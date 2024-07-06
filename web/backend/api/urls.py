from django.urls import path, include
from django.contrib import admin
from .views import RegisterView, LoginView, LogoutView, PatientListView, PredictView, PatientCSVUploadView, PatientFeatureUploadView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('patients/', PatientListView.as_view(), name='patient-list'),
    path('patients/<int:patient_id>/features/upload', PatientFeatureUploadView.as_view(), name='patient-feature-create'),
    path('predict/<int:patient_id>/', PredictView.as_view(), name='predict'),
    path('upload_patients/', PatientCSVUploadView.as_view(), name='upload_patients'),
]
