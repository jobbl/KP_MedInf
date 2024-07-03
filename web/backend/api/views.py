from rest_framework import generics, permissions
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Patient, PatientFeature
from .serializers import UserSerializer, PatientSerializer, PatientFeatureSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login, logout
import os
import numpy as np
from xgboost import XGBClassifier
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import  MultiPartParser
from rest_framework import status
import csv
from io import StringIO

model_path = "models/model_full"
loaded_model = XGBClassifier()
try:
    loaded_model.load_model(os.path.join(model_path, 'simple_xgboost_model.model'))
except:
    print("Model not found, using dummy model")
    # initialize for 2 parameters
    loaded_model.fit(np.array([[0, 0]]), np.array([0]))

MIN_USERNAME_LENGTH = 4
MIN_PASSWORD_LENGTH = 4

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Enforce minimum length requirements
        if len(username) < MIN_USERNAME_LENGTH or len(password) < MIN_PASSWORD_LENGTH:
            return Response({"error": "Username or password does not meet the minimum length requirement."}, status=400)

        user = User.objects.create_user(username=username, password=password)
        return Response({"user": UserSerializer(user).data})

# class LoginView(APIView):
#     def post(self, request):
#         username = request.data.get('username')
#         password = request.data.get('password')
#         user = authenticate(request, username=username, password=password)
#         if user:
#             login(request, user)
#             return Response({"user": UserSerializer(user).data})
#         return Response({"error": "Invalid credentials"}, status=400)
    
# from rest_framework_simplejwt.tokens import RefreshToken

class LoginView(APIView):
    def post(self, request):
        print(request.data)
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        print(user)
        if user:
            login(request, user)
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'token': str(refresh.access_token),
            })
        return Response({"error": "Invalid credentials"}, status=400)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"success": "Logged out"})

class PatientListView(generics.ListCreateAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Patient.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PatientFeatureCreateView(generics.CreateAPIView):
    queryset = PatientFeature.objects.all()
    serializer_class = PatientFeatureSerializer
    permission_classes = [IsAuthenticated]

class PredictView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, patient_id):
        try:
            patient = Patient.objects.get(patient_id=patient_id, user=request.user)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=404)
        
        latest_feature = patient.features.latest('timestamp')
        print(latest_feature.data)
        values = list(latest_feature.data.values())
        prediction = loaded_model.predict([values])
        prediction = float(prediction[0])
        return Response({'prediction': prediction})

class PatientCSVUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]  

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=400)

        if not file_obj.name.endswith('.csv'):
            return Response({"error": "Invalid file format. Please upload a CSV file."}, status=400)

        user = request.user 

        try:
            decoded_file = StringIO(file_obj.read().decode('utf-8'))
            reader = csv.DictReader(decoded_file)
            for row in reader:
                Patient.objects.create(
                    user=user,  
                    nachname=row['Nachname'],
                    vorname=row['Vorname'],
                    geschlecht=row['Geschlecht'],
                    geburtsdatum=row['Geburtsdatum'],
                    aufnahmedatum=row['Aufnahmedatum'],
                    id_nr=row['ID-Nr'],
                    aki_score=row['AKI-Score'],
                    diagnose=row['Diagnose']
                )
            return Response({"success": "Patients added successfully."}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


