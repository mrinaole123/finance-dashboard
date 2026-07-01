from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/detect-anomalies', methods=['POST'])
def detect_anomalies():
    data = request.json
    transactions = data['transactions']

    df = pd.DataFrame(transactions)

    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek

    df['category'] = df['personal_finance_category'].apply(lambda x: x.get('primary') if isinstance(x, dict) else x)
    df['category_code'] = df['category'].astype('category').cat.codes

    features = df[['amount', 'day_of_week', 'category_code']]

    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)

    model = IsolationForest(contamination=0.1, random_state=42)
    df['anomaly'] = model.fit_predict(scaled_features)

    df['date'] = df['date'].dt.strftime('%Y-%m-%d')
    
    result = df.drop(columns=['category']).to_dict('records')
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000)