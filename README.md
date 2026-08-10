**Finance Dashboard with ML-Powered Anomaly Detection**

A full-stack personal finance dashboard that connects to bank accounts via the Plaid API, categorizes transactions, visualizes spending patterns, and uses an unsupervised machine learning model (Isolation Forest) to flag unusual spending activity.

# Features -
1.  Bank account integration via Plaid Link 
    (Sandbox environment) - you login securely through Plaid's official interface, so your actual bank credentials never touch this app.

    User clicks "Connet Bank"
    -> Plaid's official login popup opens
    -> User enters password DIRECTLY into Plaid (never touches your app)
    -> Plaid sends back a token saying "this user is authenticated"
    -> App only knows the token, never sees the actual password

2. Automatic transaction categorization using 
    Plaid's built in category data (Food & Drink, Shopping, Transaportation, Entertainment, Utilities)    

3. Spending analytics 
   Total spend, top spending category, and a category breakdown pie chart

4. ML-based anomaly-detction
   An Isolation Forest model (scikit-learn) analyzes transaction amount, day of week, and category to flag transactions that don't fit a user's typical spending pattern

5. Clean, responsive dashboard UI built with React, 
   with visual anomaly highlighting on flagged transactions


# Tech Stack

Layer                   Technology
Frontend                React(vite), Recharts, Lucide icons
Backend                 Node.js, Express
ML Service              Python, Flask, scikit-learn, pandas
Bank data               Plaid API(Sandbox)


# Architecture

This project runs as three independent services that communicate over HTTP:

React Frontend (5173)
         │
         ▼
Node/Express backend (3000) -> Plaid API
         │
         ▼
Flask ML Service (5000) -> Isolation Forest anomaly  detection


# Why three services instead of one
Each layer uses the tool best suited for its job - Node handles the Plaid integration and orchestration, while Python's scikit-learn ecosystem is used for the actual machine learning. This mirrors how many real-world fintech systems separate data services from ML inference services.

Data flow:
1. User connects their bank account through Plaid Link (frontend)

2. Frontend exchanges Plaid's "public_token" for an "access_token" via the Node backend

3. Node backend fetches transactions from Plaid using the "access_token"

4. Node backend forwards the transactions to the Flask ML service

5. Flask extracts features (amount, day of week, categrory), scales them, and runs Isolation Forest

6. Flagged transactions (with anomaly labels) are returned to the frontend and displayed, with unusual transactions visually highlighted


# Machine Learning Approach

The anomaly detection uses Isolation Forest, an unsupervised algorithm well-suited for this problem because:
    -> It doesn't require labeled fraud/anomaly 
       data, which is rarely available in practice

    -> It isolates anomalies based on how few 
       random splits are needed to separate a data point from the rest - points that isolate quickly are flagged as anomalies

    -> It's fast and works reasonably well even on 
       small datsets

Features used:
transaction amount, day of week, and category (encoded numerically), scaled with "StandardScaler" before fitting the model. Using multiple features (rather than amount alone) allows the model to catch anomalies based o ususual timng or category patterns, not just large transaction amounts.

Note: Plaid's Sandbox environment doesn't always backfill transaction history immediately, so the app falls back to a small set of realistic mock transactions when Plaid returns an empty result. This does not affect the underlying Plaid integration or ML pipeline, both of which work identically with real Plaid data.


# Setup Instructions

1. Backend setup

 cd finance-backend
 npm install

Create a .env file in finance-backend:
 
 PLAID_CLIENT_ID = your_client_id
 PLAID_SECRET = your_sandbox_secret
 PLAID_ENV = sandbox

Run the server:
 
 node server.js

2. ML service setup

 cd finance-ml
 pip install scikit-learn pandas flask flask-cors
 python app.py

3. Frontend setup

 cd finance_dashboard
 npm install
 npm run dev

Visit http://localhost:5173, click Connect Bank Account, and use Plaid's sandbox test credentials:

 Username: user_good
 Password: pass_good


# Future Improvements

 -> Deploy as a live demo with hosted backend services
 -> Expand ML features with longer transaction history 
    for more meaningful pattern detection
 -> Add a simple natural-language query interface 
    for spending questions
 ->  Persist transaction data in a database instead 
    of in-memory storage




Author-
Built by Mrinmayee Aole as a personal project to explore full-stack development, third-party API integration, and applied machine learning.



