import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/axiosApi';
import './Reports.css';

// Simple currency formatter
const formatRupee = (amount) => {
    return '₹' + parseFloat(amount).toFixed(2);
};

const Reports = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reportType, setReportType] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token && !user) {
            setError('Please login to view reports');
            setLoading(false);
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transactionsData, categoriesData] = await Promise.all([
                api.getTransactions(),
                api.getCategories()
            ]);
            setTransactions(transactionsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const getMonthlyReport = () => {
        const monthlyData = {};
        transactions.forEach(t => {
            const month = t.date.slice(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expense: 0, count: 0, savings: 0 };
            }
            if (t.type === 'income') {
                monthlyData[month].income += parseFloat(t.amount);
            } else {
                monthlyData[month].expense += parseFloat(t.amount);
            }
            monthlyData[month].count++;
            monthlyData[month].savings = monthlyData[month].income - monthlyData[month].expense;
        });
        return Object.entries(monthlyData).sort((a, b) => a[0].localeCompare(b[0]));
    };

    const getCategoryReport = () => {
        const categoryData = {};
        transactions.forEach(t => {
            if (t.type === 'expense') {
                const categoryId = t.category;
                const category = categories.find(c => c.id === categoryId);
                const categoryName = category ? category.name : 'Unknown';
                if (!categoryData[categoryName]) {
                    categoryData[categoryName] = { amount: 0, count: 0, icon: category ? category.icon : '💰' };
                }
                categoryData[categoryName].amount += parseFloat(t.amount);
                categoryData[categoryName].count++;
            }
        });
        return Object.entries(categoryData).sort((a, b) => b[1].amount - a[1].amount);
    };

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const netSavings = totalIncome - totalExpenses;

    if (loading) return <div className="loading-spinner">Loading reports...</div>;
    if (error) return <div className="error-container"><p className="error-message">{error}</p><button onClick={() => window.location.href = '/login'} className="btn-primary">Go to Login</button></div>;

    const monthlyReport = getMonthlyReport();
    const categoryReport = getCategoryReport();

    return (
        <div className="reports-page">
            <div className="container">
                <h1 className="page-title">Expense Reports</h1>
                <div className="summary-stats">
                    <div className="stat-box"><h3>Total Income</h3><p className="income-text">{formatRupee(totalIncome)}</p></div>
                    <div className="stat-box"><h3>Total Expenses</h3><p className="expense-text">{formatRupee(totalExpenses)}</p></div>
                    <div className="stat-box"><h3>Net Savings</h3><p className={netSavings >= 0 ? 'income-text' : 'expense-text'}>{formatRupee(netSavings)}</p></div>
                    <div className="stat-box"><h3>Transactions</h3><p>{transactions.length}</p></div>
                </div>
                <div className="report-controls">
                    <div className="report-type-selector">
                        <button className={`report-btn ${reportType === 'monthly' ? 'active' : ''}`} onClick={() => setReportType('monthly')}>Monthly Report</button>
                        <button className={`report-btn ${reportType === 'category' ? 'active' : ''}`} onClick={() => setReportType('category')}>Category Report</button>
                    </div>
                </div>
                {reportType === 'monthly' && (
                    <div className="report-card">
                        <h2>Monthly Summary</h2>
                        {monthlyReport.length === 0 ? <div className="no-data">No transactions found</div> : (
                            <div className="report-table">
                                <table className="min-w-full">
                                    <thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Savings</th><th>Transactions</th></tr></thead>
                                    <tbody>
                                        {monthlyReport.map(([month, data]) => (
                                            <tr key={month}>
                                                <td>{month}</td>
                                                <td className="income">{formatRupee(data.income)}</td>
                                                <td className="expense">{formatRupee(data.expense)}</td>
                                                <td className={data.savings >= 0 ? 'income' : 'expense'}>{formatRupee(data.savings)}</td>
                                                <td>{data.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
                {reportType === 'category' && (
                    <div className="report-card">
                        <h2>Category Breakdown</h2>
                        {categoryReport.length === 0 ? <div className="no-data">No expense transactions found</div> : (
                            <div className="report-table">
                                <table className="min-w-full">
                                    <thead><tr><th>Category</th><th>Total Spent</th><th>Transactions</th><th>Average</th><th>Percentage</th></tr></thead>
                                    <tbody>
                                        {categoryReport.map(([category, data]) => (
                                            <tr key={category}>
                                                <td><span className="category-icon">{data.icon}</span> {category}</td>
                                                <td className="expense">{formatRupee(data.amount)}</td>
                                                <td>{data.count}</td>
                                                <td>{formatRupee(data.amount / data.count)}</td>
                                                <td>{totalExpenses > 0 ? ((data.amount / totalExpenses) * 100).toFixed(1) : 0}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
