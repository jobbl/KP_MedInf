from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from xgboost import XGBClassifier
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from your frontend


# load the model and predict    
loaded_model = XGBClassifier()
loaded_model.load_model('models/simple_xgboost_model.model')

@app.route('/')
def home():
    # load train feature names from models/train_feature_names.npy
    train_features = np.load('models/train_feature_names.npy', allow_pickle=True)
    return render_template('prediction_form.html', train_features=train_features)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json  # Expecting a JSON payload
    print(data)
    features = data['features']  # Your JSON payload should have a 'features' key
    values = list(features.values())
    prediction = loaded_model.predict([values])
    prediction = float(prediction[0])

    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    app.run(debug=True)