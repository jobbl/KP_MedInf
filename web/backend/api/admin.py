from django.contrib import admin
from .models import Patient, PatientFeature, PatientPrediction

admin.site.register(Patient)
admin.site.register(PatientFeature)
admin.site.register(PatientPrediction)
