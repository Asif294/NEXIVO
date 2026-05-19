from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.core.exceptions import ValidationError
from django.contrib import messages
from django import forms
from account.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'phone_number', 'full_name', 'role', 'is_active', 'is_verified', 'is_admin')
    list_filter = ('role', 'is_active', 'is_verified', 'is_admin', 'is_deleted')
    search_fields = ('username', 'email', 'phone_number', 'full_name')
    ordering = ('username',)
    list_editable = ('is_active', 'is_verified')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email', 'phone_number', 'full_name', 'profile_picture', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_verified', 'is_admin', 'is_superuser', 'groups', 'user_permissions')}),
        ('Status', {'fields': ('is_deleted',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'phone_number', 'full_name', 'password1', 'password2', 'role', 'is_active', 'is_verified'),
        }),
    )
