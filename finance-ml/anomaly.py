import pandas as pd
from sklearn.ensemble import IsolationForest

transactions = [
    {"id": "1", "name": "Walmart", "amount": 54.23},
    {"id": "2", "name": "Netflix", "amount": 15.99},
    {"id": "3", "name": "Uber", "amount": 12.50},
    {"id": "4", "name": "Amazon", "amount": 89.99},
    {"id": "5", "name": "Starbucks", "amount": 6.75},
    {"id": "6", "name": "Sheel Gas Station", "amount": 45.00},
    {"id": "7", "name": "Target", "amount": 123.45},
    {"id": "8", "name": "Spotify", "amount": 9.99},
    {"id": "9", "name": "Chipotle", "amount": 13.25},
    {"id": "10", "name": "AT&T", "amount": 85.00},
    {"id": "11", "name": "Random Big Purchase", "amount": 5000.00},

]

df = pd.DataFrame(transactions)

model = IsolationForest(contamination=0.1, random_state=42)

df['anomaly'] = model.fit_predict(df[['amount']])

print(df)