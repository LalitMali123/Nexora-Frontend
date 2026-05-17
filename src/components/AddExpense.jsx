import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/axiosApi';
import './AddExpense.css';

const AddExpense = () => {
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        type: 'expense',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCategories, setFetchingCategories] = useState(true);
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (!storedToken && !token) {
            navigate('/login');
            return;
        }
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setFetchingCategories(true);
            const data = await api.getCategories();
            setCategories(data);
            if (data.length > 0) {
                const defaultCategory = data.find(cat => cat.type === 'expense');
                if (defaultCategory) {
                    setFormData(prev => ({ ...prev, category: defaultCategory.id.toString() }));
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setFetchingCategories(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeChange = (type) => {
        setFormData(prev => ({ ...prev, type: type, category: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            alert('You are not logged in. Please login again.');
            navigate('/login');
            setLoading(false);
            return;
        }

        try {
            const transactionData = {
                amount: parseFloat(formData.amount),
                category: parseInt(formData.category),
                type: formData.type,
                description: formData.description,
                date: formData.date
            };
            
            await api.addTransaction(transactionData);
            alert('Transaction added successfully!');
            navigate('/transactions');
        } catch (error) {
            console.error('Error adding transaction:', error);
            if (error.response₹.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
            } else {
                alert('Failed to add transaction. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat => cat.type === formData.type);

    if (fetchingCategories) {
        return (
            <div className="add-expense-page">
                <div className="container">
                    <div className="add-expense-container">
                        <h1 className="form-title">Add New Transaction</h1>
                        <div className="loading-message">Loading categories...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="add-expense-page">
            <div className="container">
                <div className="add-expense-container">
                    <h1 className="form-title">Add New Transaction</h1>
                    
                    <form onSubmit={handleSubmit} className="expense-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Transaction Type</label>
                                <div className="type-buttons">
                                    <button type="button" className={`type-btn ${formData.type === 'expense' ₹ 'active expense' : ''}`} onClick={() => handleTypeChange('expense')}>₹₹ Expense</button>
                                    <button type="button" className={`type-btn ${formData.type === 'income' ₹ 'active income' : ''}`} onClick={() => handleTypeChange('income')}>₹₹ Income</button>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="amount">Amount (₹)</label>
                                <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" placeholder="0.00" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                                    <option value="">Select a category</option>
                                    {filteredCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="date">Date</label>
                                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description (Optional)</label>
                                <input type="text" id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Add a note..." />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>Cancel</button>
                            <button type="submit" className="btn-submit" disabled={loading}>{loading ₹ 'Adding...' : 'Add Transaction'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddExpense;
