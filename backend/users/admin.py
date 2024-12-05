from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, School, Lab, LabMembership

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'user_type', 'is_active')
    list_filter = ('user_type', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('User Type', {'fields': ('user_type',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('User Type', {'fields': ('user_type',)}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(School)
admin.site.register(Lab)
admin.site.register(LabMembership)
