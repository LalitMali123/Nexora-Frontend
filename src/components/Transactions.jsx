import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/axiosApi';
import './Transactions.css';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);

    const formatRupee = (amount) => {
        return '₹' + parseFloat(amount || 0).toFixed(2);
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await api.getTransactions();
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
                await api.deleteTransaction(id);
                await fetchTransactions();
                alert('Transaction deleted successfully!');
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert('Failed to delete transaction');
            }
        }
    };

    const filteredTransactions = transactions.filter(t => filter === 'all' ? true : t.type === filter);

    if (loading) return <div className="loading-spinner">Loading transactions...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="transactions-page">
            <div className="container">
                <div className="transactions-header">
                    <h1 className="page-title">All Transactions</h1>
                    <div className="filter-buttons">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                        <button className={`filter-btn ${filter === 'income' ? 'active' : ''}`} onClick={() => setFilter('income')}>Income</button>
                        <button className={`filter-btn ${filter === 'expense' ? 'active' : ''}`} onClick={() => setFilter('expense')}>Expenses</button>
                    </div>
                </div>
                <div className="transactions-list">
                    {filteredTransactions.length > 0 ? filteredTransactions.map(transaction => (
                        <div key={transaction.id} className="transaction-card">
                            <div className="transaction-info">
                                <div className="transaction-category">
                                    <span className="category-icon">{transaction.category_icon || '💰'}</span>
                                    <div><h3>{transaction.category_name || 'Uncategorized'}</h3><p className="transaction-date">{transaction.date}</p></div>
                                </div>
                                <div className="transaction-amount">
                                    <p className={`amount ${transaction.type}`}>{transaction.type === 'income' ? '+' : '-'}{formatRupee(transaction.amount)}</p>
                                    <button className="delete-btn" onClick={() => handleDelete(transaction.id)}>Delete</button>
                                </div>
                            </div>
                            {transaction.description && <div className="transaction-description"><p>{transaction.description}</p></div>}
                        </div>
                    )) : (
                        <div className="no-transactions"><p>No transactions found</p><button onClick={() => window.location.href = '/add-expense'} className="btn-add-transaction">+ Add Transaction</button></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
