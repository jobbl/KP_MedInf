from django.urls import path
from .views import RegisterView, LoginView, LogoutView, PatientListView, PatientFeatureCreateView, PredictView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('patients/', PatientListView.as_view(), name='patient-list'),
    path('patients/<int:patient_id>/features/', PatientFeatureCreateView.as_view(), name='patient-feature-create'),
    path('predict/<int:patient_id>/', PredictView.as_view(), name='predict'),
]
