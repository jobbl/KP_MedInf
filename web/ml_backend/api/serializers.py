from rest_framework import serializers
from .models import Patient, PatientFeature
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'patient_id', 'user']

# class PatientSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Patient
#         fields = ['id', 'patient_id', 'user', 'name', 'first_name', 'sex', 'birthday', 'admittance_date']


class PatientFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientFeature
        fields = ['id', 'patient', 'data', 'timestamp']
