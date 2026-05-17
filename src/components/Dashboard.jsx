import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ExpenseChart from './ExpenseChart';
import { api } from '../services/axiosApi';
import './Dashboard.css';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    const formatRupee = (amount) => {
        return '₹' + parseFloat(amount || 0).toFixed(2);
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token && !user) {
            setLoading(false);
            setError('Please login to view dashboard');
            return;
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await api.getDashboard();
            setSummary({ 
                totalIncome: data.total_income || 0, 
                totalExpenses: data.total_expenses || 0, 
                balance: data.balance || 0 
            });
            setTransactions(data.recent_transactions || []);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading dashboard...</div>;
    if (error) return <div className="error-container"><p className="error-message">{error}</p><button onClick={() => window.location.href = '/login'} className="btn-primary">Go to Login</button></div>;

    return (
        <div className="dashboard">
            <div className="container">
                <h1 className="dashboard-title">Dashboard</h1>
                <div className="summary-cards">
                    <div className="summary-card income"><div className="card-icon">💰</div><div className="card-content"><h3>Total Income</h3><p className="amount">{formatRupee(summary.totalIncome)}</p></div></div>
                    <div className="summary-card expense"><div className="card-icon">💸</div><div className="card-content"><h3>Total Expenses</h3><p className="amount">{formatRupee(summary.totalExpenses)}</p></div></div>
                    <div className="summary-card balance"><div className="card-icon">📊</div><div className="card-content"><h3>Balance</h3><p className={`amount ${summary.balance >= 0 ? 'positive' : 'negative'}`}>{formatRupee(summary.balance)}</p></div></div>
                </div>
                <div className="dashboard-grid">
                    <div className="chart-section"><h2>Expense Breakdown</h2><ExpenseChart transactions={transactions} /></div>
                    <div className="recent-section"><h2>Recent Transactions</h2><div className="recent-list">{transactions?.length > 0 ? transactions.map(t => (<div key={t.id} className="recent-item"><div className="recent-info"><h4>{t.category_name || t.category}</h4><p>{t.date}</p></div><p className={`recent-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{formatRupee(t.amount)}</p></div>)) : <p className="no-data">No transactions yet.</p>}</div></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
