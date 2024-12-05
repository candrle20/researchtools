from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils import timezone

class Institution(models.Model):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    USER_TYPES = [
        ('developer', 'Developer'),
        ('school_admin', 'School Admin'),
        ('researcher', 'Researcher'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES)
    school = models.ForeignKey('School', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Profile fields
    name = models.CharField(max_length=255, null=True, blank=True)
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    orcid = models.CharField(max_length=50, null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    office_location = models.CharField(max_length=255, null=True, blank=True)

    @property
    def is_developer(self):
        """Helper property to check if user is a developer"""
        return self.user_type == 'developer' or self.is_superuser

    def save(self, *args, **kwargs):
        # If user is a superuser and no user_type is set, make them a developer
        if self.is_superuser and not self.user_type:
            self.user_type = 'developer'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

    class Meta:
        ordering = ['username']

class School(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    admin = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='administered_school',
        limit_choices_to={'user_type': 'school_admin'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def clean(self):
        if self.admin and self.admin.user_type != 'school_admin':
            raise ValidationError("School admin must have user type 'school_admin'")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['name']

class Lab(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='labs')
    principal_investigator = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='labs_as_pi',
        limit_choices_to={'user_type': 'researcher'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.school.name})"

    class Meta:
        ordering = ['school__name', 'name']
        verbose_name_plural = 'Laboratories'

class LabMembership(models.Model):
    ROLE_CHOICES = [
        ('PI', 'Principal Investigator'),
        ('ADMIN', 'Lab Administrator'),
        ('RESEARCHER', 'Researcher'),
        ('STUDENT', 'Student'),
        ('STAFF', 'Staff'),
    ]

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='lab_memberships')
    lab = models.ForeignKey(Lab, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='RESEARCHER')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    joined_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='approved_memberships'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    message = models.TextField(blank=True)

    class Meta:
        unique_together = ('user', 'lab')
        ordering = ['-joined_date']

    def __str__(self):
        return f"{self.user.email} - {self.lab.name} ({self.status})"

    def clean(self):
        if self.user.user_type not in ['researcher', 'school_admin']:
            raise ValidationError("Only researchers and school admins can be lab members")
        if self.user.user_type == 'researcher' and self.lab.school != getattr(self.user, 'school', None):
            raise ValidationError("Researchers can only join labs in their assigned school")

    def approve(self, approver):
        self.status = 'approved'
        self.approved_by = approver
        self.approved_at = timezone.now()
        self.is_active = True
        self.save()
