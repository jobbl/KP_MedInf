from django.db import models
from django.contrib.auth.models import User

class Patient(models.Model):
    patient_id = models.CharField(null=True, max_length=100, unique=True, default=0)
    user = models.ForeignKey(User, null=True, on_delete=models.CASCADE)
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
        user_id = patient_data.pop('user_id')
        
        # Get the User instance
        user = User.objects.get(id=user_id)
        
        # Update or create the Patient record
        patient, created = Patient.objects.update_or_create(
            patient_id=patient_id,
            defaults={
                'user': user,
                **patient_data,  # Assumes all other fields in patient_data match the model
            }
        )
        
        return patient, created

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
    patient_id_original = models.CharField(max_length=100, null=True, blank=True)
    data = models.JSONField()
    # timestamp = models.DateTimeField()

    def __str__(self):
        return str(self.patient_id_original)

class PatientPrediction(models.Model):
    patient = models.ForeignKey(Patient, related_name='predictions', on_delete=models.CASCADE)
    prediction = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient} - {self.timestamp}"