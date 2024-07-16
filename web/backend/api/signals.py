from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import User

@receiver(post_migrate)
def create_default_admin(sender, **kwargs):
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin')