from django.db import models
from django.conf import settings
from django.utils import timezone
from users.models import Lab

class Protocol(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('IN_REVIEW', 'In Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('REVISION_REQUESTED', 'Revision Requested'),
        ('WITHDRAWN', 'Withdrawn'),
    ]

    title = models.CharField(max_length=200)
    protocol_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    description = models.TextField()
    researcher = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='protocols'
    )
    laboratory = models.ForeignKey(
        Lab,
        on_delete=models.CASCADE,
        related_name='protocols',
        null=True,
        blank=True
    )
    department = models.CharField(max_length=100, null=True, blank=True)
    species = models.CharField(max_length=100, null=True, blank=True)
    pain_category = models.CharField(max_length=50, null=True, blank=True)
    animal_count = models.IntegerField(default=0)
    funding_source = models.CharField(max_length=200, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    file = models.FileField(upload_to='protocols/', null=True, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='DRAFT'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    shared_with = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='shared_protocols', 
        blank=True
    )
    is_example = models.BooleanField(default=False)
    view_count = models.IntegerField(default=0)
    is_new_submission = models.BooleanField(default=False)
    iacuc_approval = models.BooleanField(default=False)
    safety_approval = models.BooleanField(default=False)
    compliance_notes = models.TextField(null=True, blank=True)

    def increment_views(self):
        self.view_count += 1
        self.save()

    def submit_for_review(self):
        """Called when researcher submits protocol"""
        self.status = 'IN_REVIEW'
        self.submitted_at = timezone.now()
        self.is_new_submission = True
        self.save()

    def acknowledge_submission(self):
        """Called when admin acknowledges and starts review"""
        self.is_new_submission = False
        self.save()

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        if not self.protocol_number and self.laboratory:
            self.protocol_number = self.generate_protocol_number()
        super().save(*args, **kwargs)

    def generate_protocol_number(self):
        """Generate a unique protocol number"""
        year = timezone.now().year
        lab_code = self.laboratory.code if self.laboratory else 'LAB'
        count = Protocol.objects.filter(
            created_at__year=year,
            laboratory=self.laboratory
        ).count() + 1
        return f'{lab_code}-{year}-{count:04d}'

    def __str__(self):
        return self.title or "Untitled Protocol"


class ProtocolReview(models.Model):
    protocol = models.ForeignKey(
        Protocol, 
        on_delete=models.CASCADE, 
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE
    )
    decision = models.CharField(
        max_length=20, 
        choices=Protocol.STATUS_CHOICES
    )
    comments = models.TextField()
    review_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Review for {self.protocol.title}"


class ProtocolStandard(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    file = models.FileField(upload_to='standards/', null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_standards'
    )

    def __str__(self):
        return self.title