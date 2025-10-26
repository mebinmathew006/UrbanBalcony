# users/permissions.py
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
class IsActiveUser(permissions.BasePermission):
    """
    Allows access only to active users.
    Blocks users with is_active=False.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if not request.user.is_active:
            raise PermissionDenied(detail="User blocked")
        return True