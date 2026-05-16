import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ExpenseChart from './ExpenseChart';
import './Dashboard.css';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, user } = useContext(AuthContext);

    useEffect(() => {
        // Check if user is logged in
        const storedToken = localStorage.getItem('access_token');
        if (!storedToken && !token) {
            console.log('No token found, staying on loading...');
            setLoading(false);
            setError('Please login to view dashboard');
            return;
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const accessToken = localStorage.getItem('access_token');
            console.log('Fetching dashboard with token:', accessToken ? 'Token exists' : 'No token');
            
            const response = await fetch('http://localhost:8000/api/dashboard/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            console.log('Dashboard response status:', response.status);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error('Failed to fetch dashboard data');
            }
            
            const data = await response.json();
            console.log('Dashboard data received:', data);
            
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

    if (loading) {
        return (
            <div className="dashboard">
                <div className="container">
                    <div className="loading-spinner">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <div className="container">
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button onClick={() => window.location.href = '/login'} className="btn-primary">
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="container">
                <h1 className="dashboard-title">Dashboard</h1>
                
                <div className="summary-cards">
                    <div className="summary-card income">
                        <div className="card-icon">💰</div>
                        <div className="card-content">
                            <h3>Total Income</h3>
                            <p className="amount">₹{parseFloat(summary.totalIncome).toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div className="summary-card expense">
                        <div className="card-icon">💸</div>
                        <div className="card-content">
                            <h3>Total Expenses</h3>
                            <p className="amount">₹{parseFloat(summary.totalExpenses).toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div className="summary-card balance">
                        <div className="card-icon">📊</div>
                        <div className="card-content">
                            <h3>Balance</h3>
                            <p className={`amount ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
                                ₹{parseFloat(summary.balance).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="chart-section">
                        <h2>Expense Breakdown</h2>
                        <ExpenseChart transactions={transactions} />
                    </div>
                    
                    <div className="recent-section">
                        <h2>Recent Transactions</h2>
                        <div className="recent-list">
                            {transactions && transactions.length > 0 ? (
                                transactions.map(transaction => (
                                    <div key={transaction.id} className="recent-item">
                                        <div className="recent-info">
                                            <h4>{transaction.category_name || transaction.category}</h4>
                                            <p>{transaction.date}</p>
                                        </div>
                                        <p className={`recent-amount ${transaction.type}`}>
                                            {transaction.type === 'income' ? '+' : '-'}₹{parseFloat(transaction.amount).toFixed(2)}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">No transactions yet. Add your first expense!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;