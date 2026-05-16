import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const accessToken = localStorage.getItem('access_token');
            
            if (!accessToken) {
                setError('Please login to view transactions');
                setLoading(false);
                return;
            }
            
            console.log('Fetching transactions...');
            
            const response = await fetch('http://localhost:8000/api/transactions/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error('Failed to fetch transactions');
            }
            
            const data = await response.json();
            console.log('Transactions received:', data.length);
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                const accessToken = localStorage.getItem('access_token');
                
                const response = await fetch(`http://localhost:8000/api/transactions/${id}/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete transaction');
                }
                
                // Refresh the list after successful deletion
                await fetchTransactions();
                alert('Transaction deleted successfully!');
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert('Failed to delete transaction: ' + error.message);
            }
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (filter === 'all') return true;
        return transaction.type === filter;
    });

    if (loading) {
        return (
            <div className="transactions-page">
                <div className="container">
                    <div className="loading-spinner">Loading transactions...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="transactions-page">
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
        <div className="transactions-page">
            <div className="container">
                <div className="transactions-header">
                    <h1 className="page-title">All Transactions</h1>
                    <div className="filter-buttons">
                        <button 
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'income' ? 'active' : ''}`}
                            onClick={() => setFilter('income')}
                        >
                            Income
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'expense' ? 'active' : ''}`}
                            onClick={() => setFilter('expense')}
                        >
                            Expenses
                        </button>
                    </div>
                </div>

                <div className="transactions-list">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(transaction => (
                            <div key={transaction.id} className="transaction-card">
                                <div className="transaction-info">
                                    <div className="transaction-category">
                                        <span className="category-icon">
                                            {transaction.category_icon || '💰'}
                                        </span>
                                        <div>
                                            <h3>{transaction.category_name || transaction.category || 'Uncategorized'}</h3>
                                            <p className="transaction-date">{transaction.date}</p>
                                        </div>
                                    </div>
                                    <div className="transaction-amount">
                                        <p className={`amount ${transaction.type}`}>
                                            {transaction.type === 'income' ? '+' : '-'}₹{parseFloat(transaction.amount).toFixed(2)}
                                        </p>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => handleDelete(transaction.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                {transaction.description && (
                                    <div className="transaction-description">
                                        <p>{transaction.description}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-transactions">
                            <p>No transactions found</p>
                            <p className="sub-text">Add your first transaction to get started</p>
                            <button 
                                onClick={() => window.location.href = '/add-expense'} 
                                className="btn-add-transaction"
                            >
                                + Add Transaction
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;