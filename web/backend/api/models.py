from django.db import models
from django.contrib.auth.models import User

class Patient(models.Model):
    patient_id = models.CharField(null=True, max_length=100, unique=True, default=0)
    nachname = models.CharField(null=True, max_length=100)
    vorname = models.CharField(null=True, max_length=100)
    geschlecht = models.CharField(null=True, max_length=10)
    geburtsdatum = models.DateField(null=True, blank=True)
    aufnahmedatum = models.DateField(null=True, blank=True)
    id_nr = models.CharField(null=True, max_length=100, unique=True)
    aki_score = models.IntegerField()
    diagnose = models.CharField(null=True, max_length=255)

    def __str__(self):
        return self.patient_id
    
    def create_or_update_patient(patient_data):
        """
        Create or update a Patient record based on the patient_id.
        
        :param patient_data: Dictionary containing patient data.
        :return: A tuple of (Patient instance, created boolean)
        """
        # Extract the patient_id and user_id from the data
        patient_id = patient_data.pop('patient_id')
        
        # Update or create the Patient record
        patient, created = Patient.objects.update_or_create(
            patient_id=patient_id,
            defaults={
                # 'user': user,
                **patient_data,  # Assumes all other fields in patient_data match the model
            }
        )
        
        return patient, created

class PatientFeature(models.Model):
    patient = models.ForeignKey(Patient, related_name='features', on_delete=models.CASCADE)
    patient_id_original = models.CharField(max_length=100, null=True, blank=True)
    data = models.JSONField()

    def __str__(self):
        return str(self.patient_id_original)

class PatientPrediction(models.Model):
    patient = models.ForeignKey(Patient, related_name='predictions', on_delete=models.CASCADE)
    prediction = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient} - {self.timestamp}"