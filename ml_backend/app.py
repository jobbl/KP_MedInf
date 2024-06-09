from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from your frontend

# Load the model
model = joblib.load('path/to/your/model.pkl')

@app.route('/')
def home():
    return "AKI Prediction API"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json  # Expecting a JSON payload
    features = data['features']  # Your JSON payload should have a 'features' key
    
    # Perform prediction
    prediction = model.predict([features])
    probability = model.predict_proba([features])  # Assuming your model has `predict_proba`

    return jsonify({'prediction': prediction[0], 'probability': probability[0][1]})

if __name__ == '__main__':
    app.run(debug=True)