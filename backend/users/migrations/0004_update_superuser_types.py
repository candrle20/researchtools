from django.db import migrations

def update_superuser_types(apps, schema_editor):
    CustomUser = apps.get_model('users', 'CustomUser')
    for user in CustomUser.objects.filter(is_superuser=True):
        user.user_type = 'developer'
        user.save()

def reverse_superuser_types(apps, schema_editor):
    pass  # No need to reverse this migration

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0002_institution_alter_customuser_options_customuser_name_and_more'),
    ]

    operations = [
        migrations.RunPython(update_superuser_types, reverse_superuser_types),
    ] 