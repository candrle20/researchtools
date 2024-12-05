#Serializers for the search app

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Protocol, ProtocolReview, ProtocolStandard

User = get_user_model()

class ProtocolSerializer(serializers.ModelSerializer):
    researcher_email = serializers.EmailField(source='researcher.email', read_only=True)
    lab_name = serializers.CharField(source='laboratory.name', read_only=True)

    class Meta:
        model = Protocol
        fields = '__all__'
        read_only_fields = ('researcher', 'created_at', 'updated_at', 'submitted_at')

class ProtocolReviewSerializer(serializers.ModelSerializer):
    reviewer_email = serializers.EmailField(source='reviewer.email', read_only=True)

    class Meta:
        model = ProtocolReview
        fields = '__all__'
        read_only_fields = ('reviewer',)

class ProtocolStandardSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)

    class Meta:
        model = ProtocolStandard
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

