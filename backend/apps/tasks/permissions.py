from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Object-level permission to allow owners or shared users to access/edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Allow owner
        if obj.owner == request.user:
            return True
        
        # Allow if user is in shared_with
        if hasattr(obj, 'shared_with') and obj.shared_with.filter(id=request.user.id).exists():
            return True
            
        return False
