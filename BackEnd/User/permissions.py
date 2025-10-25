# users/permissions.py
from rest_framework import permissions

class IsActiveUser(permissions.BasePermission):
    """
    Allows access only to active users.
    Blocks users with is_active=False.
    """
    def has_permission(self, request, view):
        return bool( request.user.is_active)
