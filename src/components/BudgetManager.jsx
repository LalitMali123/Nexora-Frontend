import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/axiosApi';
import './BudgetManager.css';

const BudgetManager = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token && !user) {
            setLoading(false);
            setError('Please login to manage budgets');
            return;
        }
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [categoriesData, budgetsData, transactionsData] = await Promise.all([
                api.getCategories(),
                api.getBudgets(),
                api.getTransactions()
            ]);
            setCategories(categoriesData.filter(cat => cat.type === 'expense'));
            setBudgets(budgetsData);
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
            const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
            const budgetData = {
                category: parseInt(newBudget.category),
                amount: parseFloat(newBudget.amount),
                month: currentMonth
            };
            
            const savedBudget = await api.addBudget(budgetData);
            setBudgets([...budgets, savedBudget]);
            setNewBudget({ category: '', amount: '' });
            alert('Budget saved successfully!');
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
            await api.deleteBudget(budgetId);
            setBudgets(budgets.filter(b => b.id !== budgetId));
            alert('Budget deleted successfully!');
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

    if (loading) return <div className="loading-spinner">Loading budgets...</div>;
    if (error) return <div className="error-container"><p className="error-message">{error}</p><button onClick={() => window.location.href = '/login'} className="btn-primary">Go to Login</button></div>;

    return (
        <div className="budget-manager">
            <div className="container">
                <h1 className="page-title">Budget Manager</h1>
                <div className="add-budget-section">
                    <h2>Set Monthly Budget</h2>
                    <div className="add-budget-form">
                        <select value={newBudget.category} onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}>
                            <option value="">Select Category</option>
                            {categories.map(category => (<option key={category.id} value={category.id}>{category.icon} {category.name}</option>))}
                        </select>
                        <input type="number" placeholder="Budget Amount" value={newBudget.amount} onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })} />
                        <button onClick={saveBudget} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Set Budget'}</button>
                    </div>
                </div>
                <div className="budgets-list">
                    <h2>Your Budgets</h2>
                    {budgets.length === 0 ? (<div className="no-budgets"><p>No budgets set yet</p><p className="sub-text">Set a budget to start tracking your spending</p></div>) : (
                        budgets.map(budget => {
                            const spent = getCategorySpending(budget.category);
                            const percentage = (spent / budget.amount) * 100;
                            const remaining = budget.amount - spent;
                            const color = getProgressColor(spent, budget.amount);
                            return (
                                <div key={budget.id} className="budget-card">
                                    <div className="budget-header"><h3>{getCategoryIcon(budget.category)} {getCategoryName(budget.category)}</h3><button onClick={() => deleteBudget(budget.id)} className="delete-budget-btn">Delete</button></div>
                                    <div className="budget-stats">
                                        <div className="budget-amounts"><span>Budget: &#8377;{parseFloat(budget.amount).toFixed(2)}</span><span>Spent: &#8377;{spent.toFixed(2)}</span><span>Remaining: &#8377;{Math.max(0, remaining).toFixed(2)}</span></div>
                                        <div className="progress-bar-container"><div className={`progress-bar ${color}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div></div>
                                        <p className={`budget-status ${color}`}>{percentage >= 100 ? '⚠️ Budget Exceeded!' : percentage >= 80 ? '⚠️ Approaching Limit' : '✅ On Track'}</p>
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
