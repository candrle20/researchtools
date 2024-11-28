#Serializers for the search app

from rest_framework import serializers
from .models import Protocol, ProtocolReview, Researcher, Laboratory, School, LabMembership, ProtocolStandard, LabJoinRequest
from django.contrib.auth.models import User
import re

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff']

class SchoolAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class SchoolSerializer(serializers.ModelSerializer):
    administrators = SchoolAdminSerializer(many=True, read_only=True)
    lab_count = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = [
            'id', 'name', 'code', 'administrators', 
            'lab_count', 'created_at', 'updated_at'
        ]

    def get_lab_count(self, obj):
        return obj.laboratories.count()

class LaboratorySerializer(serializers.ModelSerializer):
    school = SchoolSerializer(read_only=True)
    school_id = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
        source='school',
        write_only=True
    )
    principal_investigator = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Laboratory
        fields = [
            'id', 'name', 'code', 'school', 'school_id',
            'description', 'principal_investigator',
            'member_count', 'created_at', 'updated_at'
        ]

    def get_member_count(self, obj):
        return obj.labmembership_set.filter(is_active=True).count()

class LabMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    laboratory = LaboratorySerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)

    class Meta:
        model = LabMembership
        fields = [
            'id', 'user', 'laboratory', 'role',
            'joined_date', 'is_active', 'approved_by',
            'approved_at'
        ]

class LabJoinRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    laboratory = LaboratorySerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)

    class Meta:
        model = LabJoinRequest
        fields = [
            'id', 'user', 'laboratory', 'status',
            'message', 'created_at', 'updated_at',
            'reviewed_by', 'reviewed_at'
        ]
        read_only_fields = ['status', 'reviewed_by', 'reviewed_at']

class ResearcherSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Researcher
        fields = [
            'id', 'user_id', 'name', 'email', 'institution', 'bio', 
            'orcid', 'phone', 'office_location'
        ]
        extra_kwargs = {
            'name': {'required': True},
            'email': {
                'required': True,
                'error_messages': {
                    'invalid': 'Please enter a valid email address',
                    'blank': 'Email address is required',
                }
            },
            'institution': {'required': False, 'allow_blank': True, 'allow_null': True},
            'bio': {'required': False, 'allow_blank': True, 'allow_null': True},
            'orcid': {'required': False, 'allow_blank': True, 'allow_null': True},
            'phone': {'required': False, 'allow_blank': True, 'allow_null': True},
            'office_location': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError('Email address is required')
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', value):
            raise serializers.ValidationError('Please enter a valid email address')
        return value

    def create(self, validated_data):
        user_id = validated_data.pop('user_id', None)
        if user_id:
            user = User.objects.get(id=user_id)
            validated_data['user'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Remove user_id from validated_data if present
        validated_data.pop('user_id', None)
        return super().update(instance, validated_data)

class ProtocolSerializer(serializers.ModelSerializer):
    researcher_name = serializers.ReadOnlyField(source='researcher.username')
    shared_with = UserSerializer(many=True, read_only=True)
    laboratory = LaboratorySerializer(read_only=True)
    laboratory_id = serializers.PrimaryKeyRelatedField(
        queryset=Laboratory.objects.all(),
        source='laboratory',
        required=False,
        allow_null=True,
        write_only=True
    )

    class Meta:
        model = Protocol
        fields = [
            'id', 
            'title', 
            'protocol_number',
            'description', 
            'researcher', 
            'researcher_name',
            'laboratory',
            'laboratory_id',
            'department',
            'species',
            'pain_category',
            'animal_count',
            'funding_source',
            'start_date',
            'end_date',
            'file', 
            'status', 
            'created_at', 
            'updated_at', 
            'shared_with',
            'is_example', 
            'view_count',
            'is_new_submission', 
            'submitted_at',
            'iacuc_approval',
            'safety_approval',
            'compliance_notes'
        ]
        read_only_fields = [
            'protocol_number', 
            'is_new_submission', 
            'submitted_at',
            'view_count',
            'researcher',
            'created_at',
            'updated_at'
        ]

class ProtocolReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.ReadOnlyField(source='reviewer.username')

    class Meta:
        model = ProtocolReview
        fields = [
            'id', 
            'protocol', 
            'reviewer', 
            'reviewer_name', 
            'decision',
            'comments', 
            'review_date'
        ]

class ProtocolStandardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProtocolStandard
        fields = [
            'id', 
            'title', 
            'description', 
            'category',
            'file',
            'status',
            'created_at',
            'updated_at',
            'created_by'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

