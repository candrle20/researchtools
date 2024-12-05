from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.core.exceptions import ValidationError
import logging
import traceback
from .models import CustomUser, School, Lab, LabMembership, Institution
from .serializers import (
    CustomUserSerializer, 
    SchoolSerializer, 
    LabSerializer, 
    LabMembershipSerializer,
    CustomTokenObtainPairSerializer,
    UserTokenObtainPairSerializer,
    ResearcherProfileSerializer,
    InstitutionSerializer,
    CustomTokenRefreshSerializer,
)

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except TokenError as e:
            raise InvalidToken(e.args[0])
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserTokenObtainPairView(TokenObtainPairView):
    serializer_class = UserTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = CustomUser.objects.get(username=request.data['username'])
            if user.user_type not in ['researcher', 'school_admin']:
                return Response(
                    {'detail': 'Invalid user type. Please use the appropriate login portal.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        return response

class IsDevOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.user_type == 'developer' or request.user.is_superuser

class IsDevOrSchoolAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.user_type == 'developer':
            return True
        if request.user.user_type == 'school_admin':
            if isinstance(obj, School):
                return obj.admin == request.user
            if isinstance(obj, Lab):
                return obj.school.admin == request.user
            if isinstance(obj, LabMembership):
                return obj.lab.school.admin == request.user
        return False

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object
        return obj == request.user

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['profile', 'update_profile', 'me']:
            return ResearcherProfileSerializer
        return CustomUserSerializer

    def get_permissions(self):
        if self.action in ['profile', 'me']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        if 'password' not in request.data:
            return Response(
                {'password': 'This field is required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def me(self, request):
        """Get current user info"""
        user = request.user
        serializer = self.get_serializer_class()(user)
        data = serializer.data
        
        # Add additional user info
        data.update({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'is_developer': user.is_developer,
            'user_type': user.user_type,
            'portal': 'developer' if user.is_developer else user.user_type,
            'name': user.name,
            'institution': user.institution_id if user.institution else None,
            'bio': user.bio,
            'orcid': user.orcid,
            'phone': user.phone,
            'office_location': user.office_location
        })
        
        return Response(data)

    @action(detail=False, methods=['GET', 'PUT'])
    def profile(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = ResearcherProfileSerializer(user)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = ResearcherProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'developer' or user.is_superuser:
            return CustomUser.objects.all()
        elif user.user_type == 'school_admin':
            return CustomUser.objects.filter(school=user.school)
        return CustomUser.objects.filter(id=user.id)

class SchoolViewSet(viewsets.ModelViewSet):
    serializer_class = SchoolSerializer
    permission_classes = [permissions.IsAuthenticated, IsDevOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'developer' or user.is_superuser:
            return School.objects.all()
        elif user.user_type == 'school_admin':
            return School.objects.filter(admin=user)
        return School.objects.none()

    def perform_create(self, serializer):
        try:
            serializer.save()
        except Exception as e:
            logger.error(f"Error creating school: {str(e)}")
            raise

    def perform_update(self, serializer):
        try:
            serializer.save()
        except Exception as e:
            logger.error(f"Error updating school: {str(e)}")
            raise

class LabViewSet(viewsets.ModelViewSet):
    serializer_class = LabSerializer
    permission_classes = [permissions.IsAuthenticated, IsDevOrSchoolAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'developer':
            return Lab.objects.all()
        elif user.user_type == 'school_admin':
            return Lab.objects.filter(school=user.school)
        elif user.user_type == 'researcher':
            return Lab.objects.filter(members=user)
        return Lab.objects.none()

class LabMembershipViewSet(viewsets.ModelViewSet):
    serializer_class = LabMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'developer':
            return LabMembership.objects.all()
        elif user.user_type == 'school_admin':
            return LabMembership.objects.filter(lab__school=user.school)
        return LabMembership.objects.filter(user=user)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        membership = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['approved', 'rejected']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
        if request.user.user_type not in ['developer', 'school_admin']:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        membership.status = new_status
        membership.save()
        return Response(self.serializer_class(membership).data)

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsDevOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Institution.objects.all().order_by('name')

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer
