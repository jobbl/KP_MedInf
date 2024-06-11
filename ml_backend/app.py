from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from xgboost import XGBClassifier

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from your frontend


# load the model and predict    
loaded_model = XGBClassifier()
loaded_model.load_model('models/simple_xgboost_model.model')


@app.route('/')
def home():
    return render_template('prediction_form.html')
    return "AKI Prediction API"

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