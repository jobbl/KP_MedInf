from rest_framework import serializers
from .models import Patient, PatientFeature
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

# class PatientSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Patient
#         fields = ['id', 'patient_id', 'user']

class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Patient
        fields = ['patient_id', 'user', 'nachname', 'vorname', 'geschlecht', 'geburtsdatum', 'aufnahmedatum', 'id_nr', 'aki_score', 'diagnose']

class PatientFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientFeature
        fields = ['id', 'patient', 'data']
