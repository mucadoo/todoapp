from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Object-level permission to allow only owners of an object to edit/delete it.
    Users the task is shared with can only view it.
    """

    def has_object_permission(self, request, view, obj):
        # Always allow owners full access
        if obj.owner == request.user:
            return True
        
        # Check if the object is shared with the current user
        is_shared = False
        if hasattr(obj, 'shared_with'):
            is_shared = obj.shared_with.filter(id=request.user.id).exists()
        
        # Non-owners can only use safe methods (GET, HEAD, OPTIONS)
        if is_shared and request.method in permissions.SAFE_METHODS:
            return True
            
        return False

class IsTaskOwner(permissions.BasePermission):
    """
    Object-level permission to allow only owners of a task to share/unshare or toggle it.
    """

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user
