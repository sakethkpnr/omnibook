from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create an admin user (role=admin) for the API.'

    def add_arguments(self, parser):
        parser.add_argument('--username', default='admin')
        parser.add_argument('--email', default='admin@example.com')
        parser.add_argument('--password', default='admin123')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.role = 'admin'
            user.set_password(password)
            user.email = email
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated user "{username}" to admin.'))
        else:
            user = User.objects.create_user(username=username, email=email, password=password, role='admin')
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created admin user "{username}".'))
        self.stdout.write('You can now log in at the frontend with this user.')
