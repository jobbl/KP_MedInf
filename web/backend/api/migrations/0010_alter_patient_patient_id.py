# Generated by Django 5.0.6 on 2024-07-03 20:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_patient_diagnose'),
    ]

    operations = [
        migrations.AlterField(
            model_name='patient',
            name='patient_id',
            field=models.CharField(max_length=100),
        ),
    ]
