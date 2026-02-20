# Generate all backend files
import os
os.chdir(r'e:\project_aws\backend')

# Create permissions.py
with open('core/permissions.py', 'w') as f:
    f.write('''from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'admin'
        )
''')

print('Created core/permissions.py')
