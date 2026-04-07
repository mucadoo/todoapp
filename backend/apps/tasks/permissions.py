from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Object-level permission to allow only owners of an object to edit/delete it.
    Users the object is shared with can only view it.
    """

    def has_object_permission(self, request, view, obj):
        # Always allow owners full access
        if obj.owner == request.user:
            return True
        
        # For non-owners, only allow read-only methods if the object is shared with them
        if request.method in permissions.SAFE_METHODS:
            if hasattr(obj, 'shared_with') and obj.shared_with.filter(id=request.user.id).exists():
                return True
            
        return False

class IsTaskOwner(permissions.BasePermission):
    """
    Object-level permission to allow only owners of a task to share/unshare or toggle it.
    """

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user
