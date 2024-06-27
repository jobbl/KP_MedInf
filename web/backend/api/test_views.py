from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from .models import Patient, PatientFeature

number_of_features = 2

class APITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.patient = Patient.objects.create(patient_id='12345', user=self.user)
        self.patient_feature = PatientFeature.objects.create(patient=self.patient, data={f'feature{i}': i for i in range(0, number_of_features)})

    # def setUp(self):
    #     self.client = APIClient()
    #     self.user = User.objects.create_user(username='testuser', password='testpassword')
    #     self.patient = Patient.objects.create(
    #         patient_id='12345',
    #         user=self.user,
    #         name='John',
    #         first_name='Doe',
    #         sex='M',
    #         birthday=date(1990, 5, 15),
    #         admittance_date=date(2024, 6, 25)
    #     )
    #     self.patient_feature = PatientFeature.objects.create(patient=self.patient, data={f'feature{i}': i for i in range(1, 63)})

    def obtain_token(self):
        url = reverse('login')
        data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data['token']
        
    def test_register(self):
        url = reverse('register')
        data = {'username': 'newuser', 'password': 'newpassword'}
        response = self.client.post(url, data, format='json')
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 3)

    def test_login(self):
        url = reverse('login')
        data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('token', response.data)

    def test_logout(self):
        token = self.obtain_token()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        url = reverse('logout')
        response = self.client.post(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_patient(self):
        token = self.obtain_token()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        url = reverse('patient-list')
        patient_data = {
            'patient_id': '67890',
            'user': self.user.id,
        }
        response = self.client.post(url, patient_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Patient.objects.count(), 2)
        self.assertEqual(Patient.objects.get(patient_id='67890').patient_id, '67890')
        
    # def test_create_patient(self):
    #     self.client.login(username='testuser', password='testpassword')
    #     url = reverse('patient-list')
    #     patient_data = {
    #         'patient_id': '67890',
    #         'user': self.user.id,
    #         'name': 'Jane',
    #         'first_name': 'Doe',
    #         'sex': 'F',
    #         'birthday': '1995-03-10',  # Example date format, adjust as per your serializer
    #         'admittance_date': '2024-06-25'  # Example date format, adjust as per your serializer
    #     }
    #     response = self.client.post(url, patient_data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #     self.assertEqual(Patient.objects.count(), 2)
    #     self.assertEqual(Patient.objects.get(patient_id='67890').patient_id, '67890')
    #     self.assertEqual(Patient.objects.get(patient_id='67890').name, 'Jane')  # Example assertion for name
    #     # Add similar assertions for other attributes as needed

    def test_create_patient_feature(self):
        token = self.obtain_token()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        url = reverse('patient-feature-create', args=[self.patient.id])
        feature_data = {
            'patient': self.patient.id,
            'data': {f'feature{i}': i for i in range(0, number_of_features)},
        }
        response = self.client.post(url, feature_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PatientFeature.objects.count(), 2)

    def test_predict(self):
        token = self.obtain_token()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        url = reverse('predict', args=[self.patient.patient_id])
        response = self.client.post(url, format='json')
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('prediction', response.data)