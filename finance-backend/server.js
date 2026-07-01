require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid')

const app = express()
app.use(cors())
app.use(express.json())

const config = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    }
  }
})

const plaidClient = new PlaidApi(config)
let savedAccessToken = null

app.post('/create-link-token', async (req, res) => {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: 'user-id-123' },
    client_name: 'Finance Dashboard',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en',
  })
  res.json({ link_token: response.data.link_token })
})

app.post('/exchange-token', async (req, res) => {
  process.stdout.write('exchange token route hit\n')
  const { public_token } = req.body
  process.stdout.write('public token: ' + public_token + '\n')
  const response = await plaidClient.itemPublicTokenExchange({ public_token })
  savedAccessToken = response.data.access_token
  process.stdout.write('access token saved: ' + savedAccessToken + '\n')
  res.json({ access_token: savedAccessToken })
})

app.post('/transactions', async (req, res) => {
  try {
    const { access_token } = req.body
    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      options: { count: 100, offset: 0 }
    })
    
    let transactions = response.data.transactions
    
    if (transactions.length === 0) {
      transactions = [
        { transaction_id: '1', name: 'Walmart', amount: 54.23, date: '2024-03-01', personal_finance_category: { primary: 'FOOD_AND_DRINK' } },
        { transaction_id: '2', name: 'Netflix', amount: 15.99, date: '2024-03-02', personal_finance_category: { primary: 'ENTERTAINMENT' } },
        { transaction_id: '3', name: 'Uber', amount: 12.50, date: '2024-03-03', personal_finance_category: { primary: 'TRANSPORTATION' } },
        { transaction_id: '4', name: 'Amazon', amount: 89.99, date: '2024-03-04', personal_finance_category: { primary: 'SHOPPING' } },
        { transaction_id: '5', name: 'Starbucks', amount: 6.75, date: '2024-03-05', personal_finance_category: { primary: 'FOOD_AND_DRINK' } },
        { transaction_id: '6', name: 'Shell Gas Station', amount: 45.00, date: '2024-03-06', personal_finance_category: { primary: 'TRANSPORTATION' } },
        { transaction_id: '7', name: 'Target', amount: 123.45, date: '2024-03-07', personal_finance_category: { primary: 'SHOPPING' } },
        { transaction_id: '8', name: 'Spotify', amount: 9.99, date: '2024-03-08', personal_finance_category: { primary: 'ENTERTAINMENT' } },
        { transaction_id: '9', name: 'Chipotle', amount: 13.25, date: '2024-03-09', personal_finance_category: { primary: 'FOOD_AND_DRINK' } },
        { transaction_id: '10', name: 'AT&T', amount: 85.00, date: '2024-03-10', personal_finance_category: { primary: 'UTILITIES' } },
      ]
    }
    
    console.log('transactions returning:', transactions.length)
    res.json(transactions)
  } catch (err) {
    console.log('transaction error:', err.response?.data || err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/transactions-now', async (req, res) => {
  try {
    const response = await plaidClient.transactionsGet({
      access_token: savedAccessToken,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      options: { count: 100, offset: 0 }
    })
    console.log('transactions fetched:', response.data.transactions.length)
    res.json(response.data.transactions)
  } catch (err) {
    console.log('full error:', JSON.stringify(err.response?.data, null, 2))
    res.status(500).json({ error: err.response?.data || err.message })
  }
})

app.post('/analyze-transactions', async (req, res) => {
  try {
    const { transactions } = req.body

    const response = await fetch('http://localhost:5000/detect-anomalies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({transactions})
    })

    const data = await response.json()
    res.json(data)
  } catch (err) {
    console.log('analyze error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})

