# Generated by Django 5.0.6 on 2024-07-02 12:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_patient_aki_score_patient_aufnahmedatum_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='patient',
            name='aufnahmedatum',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='patient',
            name='geburtsdatum',
            field=models.DateField(blank=True, null=True),
        ),
    ]