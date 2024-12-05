from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q, Count
from django.conf import settings
from .models import Protocol, ProtocolReview, ProtocolStandard
from users.models import CustomUser
from .serializers import (
    ProtocolSerializer, 
    ProtocolReviewSerializer,
    ProtocolStandardSerializer,
)
from rest_framework_simplejwt.views import TokenObtainPairView

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'user_type': user.user_type,
    })

class ProtocolViewSet(viewsets.ModelViewSet):
    serializer_class = ProtocolSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        filter_type = self.request.query_params.get('filter', 'all')
        
        if user.user_type == 'developer' or user.user_type == 'school_admin':
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
            # For researchers
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
            user = CustomUser.objects.get(email=email)
            protocol.shared_with.add(user)
            return Response({'status': 'Protocol shared successfully'})
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'User with this email not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Admin acknowledges new submission"""
        protocol = self.get_object()
        if request.user.user_type not in ['developer', 'school_admin']:
            return Response(
                {'error': 'Only administrators can acknowledge protocols'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        protocol.acknowledge_submission()
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
        
        protocol.submit_for_review()
        serializer = self.get_serializer(protocol)
        return Response(serializer.data)

class ProtocolReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ProtocolReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['developer', 'school_admin']:
            return ProtocolReview.objects.all()
        return ProtocolReview.objects.filter(
            Q(protocol__researcher=user) |
            Q(reviewer=user)
        ).distinct()

class ProtocolStandardViewSet(viewsets.ModelViewSet):
    serializer_class = ProtocolStandardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'developer':
            return ProtocolStandard.objects.all()
        return ProtocolStandard.objects.filter(status='PUBLISHED')


