import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './BudgetManager.css';

const BudgetManager = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const accessToken = localStorage.getItem('access_token');
            
            if (!accessToken) {
                setError('Please login to manage budgets');
                setLoading(false);
                return;
            }

            // Fetch categories
            const categoriesResponse = await fetch('http://localhost:8000/api/categories/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData.filter(cat => cat.type === 'expense'));

            // Fetch budgets
            const budgetsResponse = await fetch('http://localhost:8000/api/budgets/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const budgetsData = await budgetsResponse.json();
            setBudgets(budgetsData);

            // Fetch transactions for spending calculation
            const transactionsResponse = await fetch('http://localhost:8000/api/transactions/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const transactionsData = await transactionsResponse.json();
            setTransactions(transactionsData);

        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const saveBudget = async () => {
        if (!newBudget.category || !newBudget.amount) {
            alert('Please select a category and enter amount');
            return;
        }

        setSaving(true);
        try {
            const accessToken = localStorage.getItem('access_token');
            const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
            
            const budgetData = {
                category: parseInt(newBudget.category),
                amount: parseFloat(newBudget.amount),
                month: currentMonth
            };

            const response = await fetch('http://localhost:8000/api/budgets/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(budgetData)
            });

            if (response.ok) {
                const savedBudget = await response.json();
                setBudgets([...budgets, savedBudget]);
                setNewBudget({ category: '', amount: '' });
                alert('Budget saved successfully!');
            } else {
                const error = await response.json();
                alert('Failed to save budget: ' + JSON.stringify(error));
            }
        } catch (error) {
            console.error('Error saving budget:', error);
            alert('Failed to save budget');
        } finally {
            setSaving(false);
        }
    };

    const deleteBudget = async (budgetId) => {
        if (!window.confirm('Are you sure you want to delete this budget?')) return;

        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/budgets/${budgetId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                setBudgets(budgets.filter(b => b.id !== budgetId));
                alert('Budget deleted successfully!');
            } else {
                alert('Failed to delete budget');
            }
        } catch (error) {
            console.error('Error deleting budget:', error);
            alert('Failed to delete budget');
        }
    };

    const getCategorySpending = (categoryId) => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        return transactions
            .filter(t => t.type === 'expense' && t.category === categoryId && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Unknown';
    };

    const getCategoryIcon = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.icon : '💰';
    };

    const getProgressColor = (spent, budget) => {
        const percentage = (spent / budget) * 100;
        if (percentage >= 100) return 'danger';
        if (percentage >= 80) return 'warning';
        return 'success';
    };

    if (loading) {
        return (
            <div className="budget-manager">
                <div className="container">
                    <div className="loading-spinner">Loading budgets...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="budget-manager">
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
        <div className="budget-manager">
            <div className="container">
                <h1 className="page-title">Budget Manager</h1>
                
                <div className="add-budget-section">
                    <h2>Set Monthly Budget</h2>
                    <div className="add-budget-form">
                        <select
                            value={newBudget.category}
                            onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.icon} {category.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Budget Amount"
                            value={newBudget.amount}
                            onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                        />
                        <button onClick={saveBudget} className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Set Budget'}
                        </button>
                    </div>
                </div>

                <div className="budgets-list">
                    <h2>Your Budgets</h2>
                    {budgets.length === 0 ? (
                        <div className="no-budgets">
                            <p>No budgets set yet</p>
                            <p className="sub-text">Set a budget to start tracking your spending</p>
                        </div>
                    ) : (
                        budgets.map(budget => {
                            const spent = getCategorySpending(budget.category);
                            const percentage = (spent / budget.amount) * 100;
                            const remaining = budget.amount - spent;
                            const color = getProgressColor(spent, budget.amount);
                            const categoryName = getCategoryName(budget.category);
                            const categoryIcon = getCategoryIcon(budget.category);
                            
                            return (
                                <div key={budget.id} className="budget-card">
                                    <div className="budget-header">
                                        <h3>{categoryIcon} {categoryName}</h3>
                                        <button onClick={() => deleteBudget(budget.id)} className="delete-budget-btn">
                                            Delete
                                        </button>
                                    </div>
                                    <div className="budget-stats">
                                        <div className="budget-amounts">
                                            <span>Budget: ₹{parseFloat(budget.amount).toFixed(2)}</span>
                                            <span>Spent: ₹{spent.toFixed(2)}</span>
                                            <span>Remaining: ₹{Math.max(0, remaining).toFixed(2)}</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div 
                                                className={`progress-bar ${color}`} 
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className={`budget-status ${color}`}>
                                            {percentage >= 100 
                                                ? '⚠️ Budget Exceeded!' 
                                                : percentage >= 80 
                                                    ? '⚠️ Approaching Limit' 
                                                    : '✅ On Track'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetManager;