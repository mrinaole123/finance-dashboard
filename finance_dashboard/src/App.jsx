import React, { useEffect, useState } from "react"
import TransactionCard from "./TransactionCard"
import ConnectBank from "./ConnectBank"
import './App.css'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
const COLORS = ['#1a1a2e', '#4361ee', '#4cc9f0', '#f72585', '#7209b7', '#3a0ca3']

function App(){
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState("All")
  const [linkToken, setLinkToken] = useState(null)
  console.log('link token:', linkToken)
  const [accessToken, setAccessToken] = useState(null)

  
  useEffect(() => {
    fetch('http://localhost:3000/create-link-token', { method: 'POST'})
      .then(res => res.json())
      .then(data => {
        console.log('data from backend:', data)
        setLinkToken(data.link_token)
      })
       .catch(err => console.log('error:', err))
  }, [])

  const handleSuccess = (public_token) => {
    console.log('public token received:', public_token)
    fetch('http://localhost:3000/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token })
    })
      .then(res => res.json())
      .then(data => {
        console.log('access token received:', data.access_token)
        setAccessToken(data.access_token)
        fetchTransactions(data.access_token)
      })
      .catch(err => console.log('exchange error:', err))
  }

  const fetchTransactions = (token) => {
    console.log('fetching transactions with token:', token)
    fetch('http://localhost:3000/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ access_token: token })
    })
      .then(res => res.json())
      .then(data => { 
        console.log('transactions received:', data)
        analyzeTransactions(data)
      })
      .catch(err => console.log('fetch transactions error:', err))
  }

  const analyzeTransactions = (transactionList) => {
    fetch('http://localhost:3000/analyze-transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: transactionList })
    })
      .then(res => res.json())
      .then(data => {
        console.log('transactions with anomaly flags:', data)
        setTransactions(data)
      })
      .catch(err => console.log('analyze error:', err))
  }

  const getTopCategory = () => {
    const categoryTotals = {}

    transactions.forEach(t => {
      const cat = t.personal_finance_category?.primary || "Unknown"
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount
    })

    let topCategory = "N/A"
    let maxAmount = 0

    for (const cat in categoryTotals) {
      if (categoryTotals[cat] > maxAmount) {
        maxAmount = categoryTotals[cat]
        topCategory = cat
      }
    }

    return topCategory
  }

  const getCategoryChartData = () => {
    const categoryTotals = {}

    transactions.forEach(t => {
      const cat = t.personal_finance_category?.primary || "Unknown"
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount
    })

    return Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: parseFloat(categoryTotals[cat].toFixed(2))
    }))
  }

  const filtered = filter === "All"
    ? transactions
    : transactions.filter(t => t.personal_finance_category?.primary === filter)

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Finance Dashboard</h1>

        {!accessToken && linkToken && (
          <ConnectBank linkToken={linkToken} onSuccess={handleSuccess} />
        )}
      </div>

      {transactions.length > 0 ? (
        <>
          <div className="metric-cards">
            <div className="metric-card">
              <div className="label">Total Spent</div>
              <div className="value">₹{transactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</div>
            </div>
            <div className="metric-card">
              <div className="label">Top Category</div>
              <div className="value">{getTopCategory()}</div>
            </div>
            <div className="metric-card">
              <div className="label">Flagged Transactions</div>
              <div className="value">{transactions.filter(t => t.anomaly === -1).length}</div>
            </div>
           
          </div>

          <div className="chart-container">
            <h2>Spending by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
                <Pie
                  data = {getCategoryChartData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ₹${value}`}
                >
                  {getCategoryChartData().map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]}  />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>


          <div className="filters">
            <button className= {`filter-btn ${filter === "All" ? "active" : ""}`} onClick={() => setFilter("All")}>All</button>
            <button className= {`filter-btn ${filter === "FOOD_AND_DRINK" ? "active" : ""}`} onClick={() => setFilter("FOOD_AND_DRINK")}>Food</button>
            <button className= {`filter-btn ${filter === "TRANSPORTATION" ? "active" : ""}`} onClick={() => setFilter("TRANSPORTATION")}>Transport</button>
            <button className= {`filter-btn ${filter === "SHOPPING" ? "active" : ""}`} onClick={() => setFilter("SHOPPING")}>Shopping</button>
            <button className= {`filter-btn ${filter === "ENTERTAINMENT" ? "active" : ""}`} onClick={() => setFilter("ENTERTAINMENT")}>Entertainment</button>
            <button className= {`filter-btn ${filter === "UTILITIES" ? "active" : ""}`} onClick={() => setFilter("UTILITIES")}>Utilities</button>
          </div>

          <div className="transaction-list">
            {filtered.map(transaction => (
              <TransactionCard
                key={transaction.transaction_id}
                name={transaction.name}
                category={transaction.personal_finance_category?.primary}
                amount={transaction.amount}
                date={transaction.date}
                anomaly={transaction.anomaly}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h2>No transactions</h2>
          <p>Connect your bank account to see your spending breakdown, category insights, and unusual transaction alerts.</p>
          </div>
      )}


        
    </div>
  )
}

export default App