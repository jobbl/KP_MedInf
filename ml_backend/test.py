import pytest
import json
from flask import Flask
from app import app  # replace with the actual name of your Flask app file

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_predict(client):
    # Define a sample payload based on the input format of your API
    payload = {
        "features": {
            "creatinine_mean": 0.5,
            "uo_rt_6hr": 0.5,
        }
    }

    # Send a request to the API
    response = client.post('/predict', data=json.dumps(payload), content_type='application/json')

    # Validate the response
    assert response.status_code == 200
    assert 'prediction' in response.get_json()

    # Add more assertions as needed based on the expected output of your API