from django.db import models
from django.contrib.auth.models import User

class Patient(models.Model):
    patient_id = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    nachname = models.CharField(max_length=100)
    vorname = models.CharField(max_length=100)
    geschlecht = models.CharField(max_length=10)
    geburtsdatum = models.DateField(null=True, blank=True)
    aufnahmedatum = models.DateField(null=True, blank=True)
    id_nr = models.CharField(max_length=100, unique=True)
    aki_score = models.IntegerField()

    def __str__(self):
        return self.patient_id

# class Patient(models.Model):
#     patient_id = models.CharField(max_length=100)
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     name = models.CharField(max_length=255)
#     first_name = models.CharField(max_length=255)
#     sex = models.CharField(max_length=10)
#     birthday = models.DateField()
#     admittance_date = models.DateField()

#     def __str__(self):
#         return f"{self.name} ({self.patient_id})"

class PatientFeature(models.Model):
    patient = models.ForeignKey(Patient, related_name='features', on_delete=models.CASCADE)
    data = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.patient_id} - {self.timestamp}"