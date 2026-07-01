import {ShoppingBag, UtensilsCrossed, Car, Music, Zap, CircleHelp } from 'lucide-react'

const categoryIcons = {
    SHOPPING: ShoppingBag,
    FOOD_AND_DRINK: UtensilsCrossed,
    TRANSPORTATION: Car,
    ENTERTAINMENT: Music,
    UTILITIES: Zap,
}

function TransactionCard({ name, category, amount, date, anomaly}){
    console.log('raw date value:', date)
    const formattedDate = date ? new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    })  : "Unknown date"

    const Icon = categoryIcons[category] || CircleHelp

    return (
        <div className={`transaction-card ${anomaly === -1 ? 'anomaly' : ''}`}>
           <div className="transaction-left">
            <div className="icon-circle">
                <Icon size={18} />
            </div>
           </div>
            <div className="transction-info">
                <h3>
                    {name}
                    {anomaly === -1 && <span className="anomaly-badge">Unusual</span>}
                </h3>
                <div className="category">{category} • {formattedDate}</div>
            </div>
            <div className="transaction-amount">₹{amount}</div>
        </div>
    )
}

export default TransactionCard