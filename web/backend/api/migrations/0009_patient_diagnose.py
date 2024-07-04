# Example migration file: 0009_patient_diagnose.py
from django.db import migrations, models

def set_default_diagnose(apps, schema_editor):
    Patient = apps.get_model('api', 'Patient')
    for patient in Patient.objects.all():
        if patient.diagnose is None:
            patient.diagnose = 'Unknown'
        patient.save()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_remove_patient_admittance_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='diagnose',
            field=models.CharField(max_length=255, default='Unknown'),
            preserve_default=False,
        ),
        migrations.RunPython(set_default_diagnose),
    ]
