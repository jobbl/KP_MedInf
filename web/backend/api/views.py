from rest_framework import generics, permissions
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Patient, PatientFeature, PatientPrediction
from .serializers import UserSerializer, PatientSerializer, PatientFeatureSerializer, PatientPredictionSerializer
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
from datetime import datetime
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.db.models import Max
from .lstm import Net, normalise_data_with_parameters, batch_predict
import torch
import pandas as pd

model_path = "models"

xgb_model = XGBClassifier()
try:
    xgb_model.load_model(os.path.join(model_path, 'xgb_original.model'))
except:
    print("Model not found, using dummy model")
    # initialize for 2 parameters
    xgb_model.fit(np.array([[0, 0]]), np.array([0]))
    
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# LSTM parameters
input_size = 30
output_size = 1
emb_size = round(input_size / 1)
number_layers = 3
dropout = 0
bi_directional = True

predict_threshold = 0.5 

nn_model = Net(input_size, emb_size, output_size, bi_directional, number_layers, dropout).to(device)
nn_model.load_state_dict(torch.load(os.path.join(model_path, 'LSTM/LSTM_best.pth'), map_location = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu'))['model_state_dict'])
normalisation_parameters_array = np.load(os.path.join(model_path, 'LSTM/normalization_parameters.npy'), allow_pickle=True) 
normalisation_parameters = normalisation_parameters_array.item() if normalisation_parameters_array.shape == () else normalisation_parameters_array.tolist()
use_xgb = False

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

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
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
        return Patient.objects.filter()

    def perform_create(self, serializer):
        serializer.save()

    # delete patient
    def delete(self, request, patient_id):
        patient = get_object_or_404(Patient, patient_id=patient_id)
        patient.delete()
        return Response({"success": "Patient deleted."}, status=status.HTTP_204_NO_CONTENT)

class PatientFeatureCreateView(generics.CreateAPIView):
    queryset = PatientFeature.objects.all()
    serializer_class = PatientFeatureSerializer
    permission_classes = [IsAuthenticated]

class PatientCSVUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]  

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=400)

        if not file_obj.name.endswith('.csv'):
            return Response({"error": "Invalid file format. Please upload a CSV file."}, status=400)

        try:
            decoded_file = StringIO(file_obj.read().decode('utf-8'))
            reader = csv.DictReader(decoded_file)
            patients_created = 0
            for row in reader:
                try:
                    Patient.objects.create(
                        # user=user,
                        patient_id=row['ID-Nr'],  # Make sure this column exists in your CSV
                        nachname=row['Nachname'],
                        vorname=row['Vorname'],
                        geschlecht=row['Geschlecht'],
                        geburtsdatum=datetime.strptime(row['Geburtsdatum'], '%Y-%m-%d').date(),
                        aufnahmedatum=datetime.strptime(row['Aufnahmedatum'], '%Y-%m-%d').date(),
                        id_nr=row['ID-Nr'],
                        aki_score=int(row['AKI-Score']),
                        diagnose=row['Diagnose']
                    )
                    patients_created += 1
                except IntegrityError as e:
                    if 'unique constraint' in str(e).lower():
                        return Response({"error": f"Patient with ID-Nr {row['ID-Nr']} already exists."}, status=400)
                    else:
                        raise
                except ValueError as e:
                    return Response({"error": f"Invalid data format: {str(e)}"}, status=400)
            return Response({"success": f"{patients_created} patients added successfully."}, status=201)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=400)


class PatientFeatureUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]  
    
    def post(self, request, patient_id, format=None):
        file_obj = request.FILES.get('file')

        if not file_obj:
            return Response({"error": "No file provided"}, status=400)

        if not file_obj.name.endswith('.csv'):
            return Response({"error": "Invalid file format. Please upload a CSV file."}, status=400)

        try:
            decoded_file = StringIO(file_obj.read().decode('utf-8'))
            reader = csv.DictReader(decoded_file)
            features_created = 0
            for row in reader:
                try:
                    timestamp=row['charttime']
                    patient = Patient.objects.get(patient_id=patient_id)
                    PatientFeature.objects.create(
                        patient=patient,
                        patient_id_original=patient_id,
                        # timestamp=row['charttime'],
                        data=row
                    )
                    features_created += 1
                except Patient.DoesNotExist:
                    return Response({"error": f"Patient with ID-Nr {row['ID-Nr']} not found."}, status=404)
                except ValueError as e:
                    return Response({"error": f"Invalid data format: {str(e)}"}, status=400)
            return Response({"success": f"{features_created} features added successfully."}, status=201)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=400)

class LabValuesListView(APIView):
    def get(self, request, patient_id):
        lab_values = PatientFeature.objects.filter(patient_id_original=patient_id)
        serializer = PatientFeatureSerializer(lab_values, many=True)
        return Response(serializer.data)
        
class PredictView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, patient_id):
        # Ensure the patient exists and belongs to the user making the request
        patient = get_object_or_404(Patient, patient_id=patient_id)

        if use_xgb:
            # Get the latest PatientFeature entry for this patient by ordering by a timestamp field
            latest_feature = PatientFeature.objects.filter(patient=patient).aggregate(Max('data__charttime'))

            if not latest_feature['data__charttime__max']:
                return Response({"error": "No lab values found for this patient."}, status=status.HTTP_404_NOT_FOUND)

            latest_feature_instance = PatientFeature.objects.filter(patient=patient, data__charttime=latest_feature['data__charttime__max']).first()

            latest_feature_instance_cleaned = latest_feature_instance.data.copy()
            latest_feature_instance_cleaned.pop('charttime', None)
            features = []
            for key, value in latest_feature_instance_cleaned.items():
                try:
                    features.append(float(value))
                except:
                    features.append(0)
            
            print(len(features))
            print(features)
            # try:
            # Make prediction
            prediction = xgb_model.predict(np.array([features]))[0]
            probability = xgb_model.predict_proba(np.array([features]))[0][1]
            print(f"XGB prediction: {prediction}, probability: {probability}")
        else:
            # Fetch data and convert to a list of dictionaries
            data_list = list(PatientFeature.objects.filter(patient=patient).order_by('data__charttime').values('data'))
            # Convert the list of dictionaries to a DataFrame
            # Extract 'data' dictionaries from the list
            data_dicts = [item['data'] for item in data_list]

            # Convert the list of 'data' dictionaries to a DataFrame
            X = pd.DataFrame(data_dicts)

            # Convert 'charttime' to datetime and set as index if needed
            print(X.columns)
            # Ensure 'charttime' and 'icustay_id' are in the DataFrame and set 'charttime' as the index
            X['charttime'] = pd.to_datetime(X['charttime'])  # Adjust column name if necessary
            X = X.set_index('charttime')
            # Before resampling and calculating the mean
            # Convert columns that should be numeric but are stored as strings
            for column in X.columns:
                try:
                    X[column] = pd.to_numeric(X[column], errors='coerce')
                except ValueError:
                    # This column might be non-numeric and not intended for conversion, so we pass
                    pass

            # Now that we've attempted to convert all columns to numeric types where applicable,
            # we can proceed with resampling and calculating the mean
            SAMPLING_INTERVAL = '6h'  # Adjusted to lowercase 'h' as per the deprecation warning
            X = X.resample(SAMPLING_INTERVAL).mean()  # Proceed as before
            # fill nan values with 0
            X = X.fillna(0)
            # Normalize data    
            X_predict = normalise_data_with_parameters(X, normalisation_parameters)
            
            features = np.array(X_predict.values)  # Convert DataFrame to numpy array
            features_tensor = batch_predict(features).to(device)  # Batch and convert to tensor
            print(features_tensor.shape)
            probability = nn_model(features_tensor)  # Predict
            print(probability)
            prediction = torch.sigmoid(probability) > predict_threshold  # Apply threshold

            print(f"LSTM prediction: {prediction}")
            

        # Create and save the new PatientPrediction
        new_prediction = PatientPrediction(
            patient=patient,
            prediction={"prediction": int(prediction), "probability": float(probability)},
            # timestamp is auto-added
        )
        new_prediction.save()


        # Optionally, you can serialize and return the new prediction
        serializer = PatientPredictionSerializer(new_prediction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class PatientPredictionView(APIView):
    def get(self, request, patient_id):
        predictions = PatientPrediction.objects.filter(patient__patient_id=patient_id)
        serializer = PatientPredictionSerializer(predictions, many=True)
        return Response(serializer.data)