# Modified 0005_patient_aki_score_patient_aufnahmedatum_and_more.py

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_remove_patient_admittance_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='aki_score',
            field=models.IntegerField(default=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='patient',
            name='aufnahmedatum',
            field=models.DateField(null=True, blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='patient',
            name='geburtsdatum',
            field=models.DateField(null=True, blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='patient',
            name='geschlecht',
            field=models.CharField(default='Unknown', max_length=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='patient',
            name='id_nr',
            field=models.CharField(default='', max_length=100, unique=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='patient',
            name='nachname',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='patient',
            name='vorname',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
    ]
