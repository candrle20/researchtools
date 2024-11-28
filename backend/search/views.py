from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q, Count
from django.contrib.auth.models import User
from .models import Researcher, Protocol, ProtocolReview, School, Laboratory, LabMembership, ProtocolStandard, LabJoinRequest
from .serializers import (
    ResearcherSerializer, 
    ProtocolSerializer, 
    ProtocolReviewSerializer,
    UserSerializer,
    SchoolSerializer,
    LaboratorySerializer,
    LabMembershipSerializer,
    ProtocolStandardSerializer,
    LabJoinRequestSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data['username'])
            response.data['is_staff'] = user.is_staff
            response.data['username'] = user.username
        return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
    })

# Create your views here.

class ResearcherViewSet(viewsets.ModelViewSet):
    serializer_class = ResearcherSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Researcher.objects.filter(user=self.request.user)

    @action(detail=False, methods=['GET', 'PUT'])
    def profile(self, request):
        try:
            researcher = Researcher.objects.get(user=request.user)
        except Researcher.DoesNotExist:
            # Create a new researcher profile if it doesn't exist
            researcher = Researcher.objects.create(
                user=request.user,
                name=request.user.get_full_name() or request.user.username,
                email=request.user.email
            )
        
        if request.method == 'GET':
            serializer = self.get_serializer(researcher)
            return Response(serializer.data)
        elif request.method == 'PUT':
            # Add user_id to request data
            data = request.data.copy()
            data['user_id'] = request.user.id
            
            serializer = self.get_serializer(
                researcher,
                data=data,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                # Update user email if provided
                if 'email' in request.data:
                    request.user.email = request.data['email']
                    request.user.save()
                return Response(serializer.data)
            
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=400)

    @action(detail=False, methods=['GET', 'POST'])
    def labs(self, request):
        if request.method == 'GET':
            memberships = LabMembership.objects.filter(user=request.user)
            serializer = LabMembershipSerializer(memberships, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            data = {
                'user': request.user.id,
                'laboratory': request.data.get('laboratory'),
                'role': request.data.get('role', 'RESEARCHER')
            }
            serializer = LabMembershipSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)

class ProtocolViewSet(viewsets.ModelViewSet):
    serializer_class = ProtocolSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        filter_type = self.request.query_params.get('filter', 'all')
        
        if user.is_staff:
            if filter_type == 'new_submissions':
                return Protocol.objects.filter(
                    status='IN_REVIEW',
                    is_new_submission=True
                ).order_by('-submitted_at')
            elif filter_type == 'in_review':
                return Protocol.objects.filter(
                    status='IN_REVIEW',
                    is_new_submission=False
                ).order_by('-submitted_at')
            else:
                return Protocol.objects.all().order_by('-created_at')
        
        else:
            # For regular users
            base_queryset = Protocol.objects.filter(
                Q(researcher=user) |
                Q(shared_with=user)
            ).distinct()

            if filter_type == 'mine':
                return base_queryset.filter(researcher=user)
            elif filter_type == 'shared':
                return base_queryset.filter(shared_with=user)
            elif filter_type == 'drafts':
                return base_queryset.filter(status='DRAFT')
            elif filter_type == 'approved':
                return base_queryset.filter(status='APPROVED')
            elif filter_type == 'pending':
                return base_queryset.filter(status='IN_REVIEW')
            elif filter_type == 'rejected':
                return base_queryset.filter(status='REJECTED')
            
            return base_queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        queryset = self.get_queryset().order_by('-view_count')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(researcher=self.request.user)

    @action(detail=False, methods=['get'])
    def search(self, request):
        search_type = request.query_params.get('type', 'title')
        query = request.query_params.get('q', '')
        
        queryset = self.get_queryset()
        
        if search_type == 'title':
            queryset = queryset.filter(title__icontains=query)
        elif search_type == 'description':
            queryset = queryset.filter(description__icontains=query)
        elif search_type == 'researcher':
            queryset = queryset.filter(researcher__username__icontains=query)
        elif search_type == 'status':
            queryset = queryset.filter(status__iexact=query)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        protocol = self.get_object()
        email = request.data.get('email')
        
        try:
            user = User.objects.get(email=email)
            protocol.shared_with.add(user)
            return Response({'status': 'Protocol shared successfully'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Admin acknowledges new submission"""
        protocol = self.get_object()
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can acknowledge protocols'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        protocol.acknowledge_submission()  # This removes new submission flag
        return Response({
            'status': 'Protocol acknowledged successfully'
        })

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Researcher submits protocol for review"""
        protocol = self.get_object()
        if protocol.status != 'DRAFT':
            return Response(
                {'error': 'Only draft protocols can be submitted for review'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        protocol.submit_for_review()  # This sets status and new submission flag
        serializer = self.get_serializer(protocol)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_submissions(self, request):
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can view new submissions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = Protocol.objects.filter(
            status='IN_REVIEW'
        ).order_by('-submitted_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can view stats'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        stats = {
            'total': Protocol.objects.count(),
            'new_submissions': Protocol.objects.filter(
                status='IN_REVIEW',
                is_new_submission=True
            ).count(),
            'pending': Protocol.objects.filter(
                status='IN_REVIEW',
                is_new_submission=False
            ).count(),
            'approved': Protocol.objects.filter(
                status='APPROVED'
            ).count(),
            'rejected': Protocol.objects.filter(
                status='REJECTED'
            ).count(),
        }
        return Response(stats)

    def destroy(self, request, *args, **kwargs):
        protocol = self.get_object()
        # Only allow deletion if user is the researcher and protocol is in draft
        if protocol.researcher == request.user and protocol.status == 'DRAFT':
            return super().destroy(request, *args, **kwargs)
        return Response(
            {'error': 'Cannot delete this protocol'},
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=True, methods=['GET', 'POST'])
    def reviews(self, request, pk=None):
        protocol = self.get_object()
        
        if request.method == 'GET':
            reviews = ProtocolReview.objects.filter(protocol=protocol)
            serializer = ProtocolReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            if not request.user.is_staff:
                return Response(
                    {'error': 'Only staff can review protocols'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            review_data = {
                'protocol': protocol.id,
                'reviewer': request.user.id,
                'decision': request.data.get('decision'),
                'comments': request.data.get('comments'),
            }
            
            serializer = ProtocolReviewSerializer(data=review_data)
            if serializer.is_valid():
                serializer.save()
                
                # Update protocol status
                protocol.status = request.data.get('decision')
                protocol.is_new_submission = False  # Mark as reviewed
                protocol.save()
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProtocolReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ProtocolReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return ProtocolReview.objects.all()
        return ProtocolReview.objects.filter(
            protocol__researcher=self.request.user
        )

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            return Response(
                {'error': 'Only staff can review protocols'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save(reviewer=self.request.user)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_researcher(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Create new user (not staff/superuser)
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=False,
            is_superuser=False
        )
        
        # Create associated researcher profile
        Researcher.objects.create(
            name=username,
            email=email,
            institution=request.data.get('institution', ''),
            bio=request.data.get('bio', '')
        )
        
        return Response({
            'message': 'Researcher account created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['GET'])
    def laboratories(self, request, pk=None):
        school = self.get_object()
        labs = Laboratory.objects.filter(school=school)
        serializer = LaboratorySerializer(labs, many=True)
        return Response(serializer.data)

class LaboratoryViewSet(viewsets.ModelViewSet):
    serializer_class = LaboratorySerializer
    permission_classes = [IsAuthenticated]
    queryset = Laboratory.objects.all()

    def get_queryset(self):
        if self.request.user.is_staff:
            return Laboratory.objects.all()
        return Laboratory.objects.filter(
            labmembership__user=self.request.user,
            labmembership__is_active=True
        ).distinct()

    def perform_create(self, serializer):
        laboratory = serializer.save()
        # Automatically make the creator a PI of the lab
        LabMembership.objects.create(
            user=self.request.user,
            laboratory=laboratory,
            role='PI'
        )

    @action(detail=True, methods=['POST'])
    def add_member(self, request, pk=None):
        laboratory = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'RESEARCHER')

        try:
            user = User.objects.get(id=user_id)
            LabMembership.objects.create(
                user=user,
                laboratory=laboratory,
                role=role
            )
            return Response({'status': 'Member added successfully'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['GET'])
    def members(self, request, pk=None):
        laboratory = self.get_object()
        memberships = laboratory.labmembership_set.all()
        serializer = LabMembershipSerializer(memberships, many=True)
        return Response(serializer.data)

class ProtocolStandardViewSet(viewsets.ModelViewSet):
    serializer_class = ProtocolStandardSerializer
    
    def get_permissions(self):
        # Allow public access to list and retrieve actions
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        status_filter = self.request.query_params.get('status')
        queryset = ProtocolStandard.objects.all()

        if status_filter == 'PUBLISHED':
            return queryset.filter(status='PUBLISHED').order_by('-created_at')
        elif self.request.user and self.request.user.is_staff:
            return queryset.order_by('-created_at')
        else:
            return queryset.filter(status='PUBLISHED').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['POST'])
    def publish(self, request, pk=None):
        standard = self.get_object()
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can publish standards'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        standard.status = 'PUBLISHED'
        standard.save()
        serializer = self.get_serializer(standard)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def unpublish(self, request, pk=None):
        standard = self.get_object()
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can unpublish standards'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        standard.status = 'DRAFT'
        standard.save()
        serializer = self.get_serializer(standard)
        return Response(serializer.data)

class LabJoinRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LabJoinRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return LabJoinRequest.objects.all()
        return LabJoinRequest.objects.filter(
            Q(user=self.request.user) |
            Q(laboratory__principal_investigator=self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def approve(self, request, pk=None):
        join_request = self.get_object()
        if not (request.user.is_staff or 
                request.user == join_request.laboratory.principal_investigator):
            return Response(
                {'error': 'Only staff or PI can approve requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        join_request.approve(request.user)
        return Response({'status': 'Request approved'})

    @action(detail=True, methods=['POST'])
    def reject(self, request, pk=None):
        join_request = self.get_object()
        if not (request.user.is_staff or 
                request.user == join_request.laboratory.principal_investigator):
            return Response(
                {'error': 'Only staff or PI can reject requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        join_request.reject(request.user)
        return Response({'status': 'Request rejected'})


