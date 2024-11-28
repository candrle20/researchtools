from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.


class School(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=10, unique=True)
    administrators = models.ManyToManyField(
        User, 
        related_name='administered_schools',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Laboratory(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    school = models.ForeignKey(
        School, 
        on_delete=models.CASCADE, 
        related_name='laboratories'
    )
    description = models.TextField(null=True, blank=True)
    principal_investigator = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='labs_as_pi'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.school.code})"

    class Meta:
        ordering = ['school__name', 'name']
        verbose_name_plural = 'Laboratories'


class Researcher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='researcher_profile')
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    institution = models.CharField(max_length=200)
    bio = models.TextField(null=True, blank=True)
    orcid = models.CharField(max_length=20, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    office_location = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name


class LabMembership(models.Model):
    ROLE_CHOICES = [
        ('PI', 'Principal Investigator'),
        ('ADMIN', 'Lab Administrator'),
        ('RESEARCHER', 'Researcher'),
        ('STUDENT', 'Student'),
        ('STAFF', 'Staff'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    laboratory = models.ForeignKey(Laboratory, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    joined_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='approved_memberships'
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'laboratory')
        ordering = ['-joined_date']

    def __str__(self):
        return f"{self.user.username} - {self.laboratory.name} ({self.role})"

    def approve(self, approver):
        self.approved_by = approver
        self.approved_at = timezone.now()
        self.is_active = True
        self.save()


class LabJoinRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='lab_join_requests'
    )
    laboratory = models.ForeignKey(
        Laboratory, 
        on_delete=models.CASCADE, 
        related_name='join_requests'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='PENDING'
    )
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='reviewed_requests'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'laboratory', 'status')

    def __str__(self):
        return f"{self.user.username} -> {self.laboratory.name} ({self.status})"

    def approve(self, reviewer):
        self.status = 'APPROVED'
        self.reviewed_by = reviewer
        self.reviewed_at = timezone.now()
        self.save()

        # Create lab membership
        LabMembership.objects.create(
            user=self.user,
            laboratory=self.laboratory,
            role='RESEARCHER',
            approved_by=reviewer,
            approved_at=timezone.now()
        )

    def reject(self, reviewer):
        self.status = 'REJECTED'
        self.reviewed_by = reviewer
        self.reviewed_at = timezone.now()
        self.save()


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
        User, 
        on_delete=models.CASCADE, 
        related_name='protocols'
    )
    laboratory = models.ForeignKey(
        Laboratory,
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
    shared_with = models.ManyToManyField(User, related_name='shared_protocols', blank=True)
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
        self.is_new_submission = True  # Set flag for new submission
        self.save()

    def acknowledge_submission(self):
        """Called when admin acknowledges and starts review"""
        self.is_new_submission = False  # Remove new submission flag
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
        User, 
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
        User,
        on_delete=models.CASCADE,
        related_name='created_standards'
    )

    def __str__(self):
        return self.title