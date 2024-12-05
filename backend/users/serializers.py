from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from .models import CustomUser, School, Lab, LabMembership, Institution

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name', 'code', 'description', 'website', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class BaseTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
            
            # Get token data
            refresh = self.get_token(self.user)
            access_token = refresh.access_token

            # Return token data
            return {
                'access': str(access_token),
                'refresh': str(refresh)
            }
            
        except Exception as e:
            raise serializers.ValidationError({
                'detail': str(e)
            })

class CustomTokenObtainPairSerializer(BaseTokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            # Get token data from parent class
            data = super().validate(attrs)
            
            # Check if user is a developer or superuser
            if not (self.user.user_type == 'developer' or self.user.is_superuser):
                raise serializers.ValidationError({
                    'detail': 'Access denied. Developer privileges required.'
                })
            
            # Structure the response to match what frontend expects
            user_data = {
                'id': self.user.id,
                'username': self.user.username,
                'email': self.user.email,
                'user_type': self.user.user_type,
                'is_superuser': self.user.is_superuser,
                'is_staff': self.user.is_staff,
                'is_developer': True,
                'portal': 'developer',
                'name': self.user.name,
                'institution': self.user.institution_id if self.user.institution else None,
                'bio': self.user.bio,
                'orcid': self.user.orcid,
                'phone': self.user.phone,
                'office_location': self.user.office_location,
            }

            # Return structured response with complete user data
            return {
                'tokens': {
                    'access': data['access'],
                    'refresh': data['refresh']
                },
                'user': user_data
            }
        except serializers.ValidationError as e:
            raise e
        except Exception as e:
            raise serializers.ValidationError({
                'detail': str(e)
            })

class UserTokenObtainPairSerializer(BaseTokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Only allow researchers and school admins to access the research portal
        if self.user.user_type not in ['researcher', 'school_admin']:
            raise serializers.ValidationError({
                'detail': 'Invalid user type. Please use the appropriate login portal.'
            })
        
        return data

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'user_type', 'is_active', 'is_staff', 'is_superuser')
        read_only_fields = ('id',)

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        return super().update(instance, validated_data)

class ResearcherProfileSerializer(serializers.ModelSerializer):
    institution_details = InstitutionSerializer(source='institution', read_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'username', 'name', 'institution', 
                 'institution_details', 'bio', 'orcid', 'phone', 'office_location')
        read_only_fields = ('id', 'email', 'username')

class SchoolSerializer(serializers.ModelSerializer):
    admin_email = serializers.EmailField(write_only=True, required=False)
    admin_display = serializers.EmailField(source='admin.email', read_only=True)

    class Meta:
        model = School
        fields = ('id', 'name', 'code', 'description', 'admin_email', 'admin_display', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        admin_email = validated_data.pop('admin_email', None)
        try:
            if admin_email:
                try:
                    admin_user = CustomUser.objects.get(email=admin_email)
                    if admin_user.user_type != 'school_admin':
                        admin_user.user_type = 'school_admin'
                        admin_user.save()
                    validated_data['admin'] = admin_user
                except CustomUser.DoesNotExist:
                    raise serializers.ValidationError({'admin_email': 'User with this email does not exist'})
            return super().create(validated_data)
        except Exception as e:
            raise serializers.ValidationError(str(e))

    def update(self, instance, validated_data):
        admin_email = validated_data.pop('admin_email', None)
        try:
            if admin_email:
                try:
                    admin_user = CustomUser.objects.get(email=admin_email)
                    if admin_user.user_type != 'school_admin':
                        admin_user.user_type = 'school_admin'
                        admin_user.save()
                    validated_data['admin'] = admin_user
                except CustomUser.DoesNotExist:
                    raise serializers.ValidationError({'admin_email': 'User with this email does not exist'})
            return super().update(instance, validated_data)
        except Exception as e:
            raise serializers.ValidationError(str(e))

class LabSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    principal_investigator_email = serializers.EmailField(source='principal_investigator.email', read_only=True)

    class Meta:
        model = Lab
        fields = ('id', 'name', 'code', 'description', 'school', 'school_name',
                 'principal_investigator', 'principal_investigator_email',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class LabMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    lab_name = serializers.CharField(source='lab.name', read_only=True)
    approved_by_email = serializers.EmailField(source='approved_by.email', read_only=True)

    class Meta:
        model = LabMembership
        fields = ('id', 'user', 'user_email', 'lab', 'lab_name', 'role',
                 'status', 'joined_date', 'is_active', 'approved_by',
                 'approved_by_email', 'approved_at', 'message')
        read_only_fields = ('id', 'joined_date', 'approved_at')

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Structure the response to match what frontend expects
        return {
            'tokens': {
                'access': data['access'],
                'refresh': data['refresh']
            }
        }