# Generated by Django 5.0.6 on 2024-07-03 19:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_merge_20240703_2153'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='patient',
            name='admittance_date',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='birthday',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='first_name',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='name',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='sex',
        ),
        migrations.AlterField(
            model_name='patient',
            name='patient_id',
            field=models.CharField(max_length=100, unique=True),
        ),
    ]