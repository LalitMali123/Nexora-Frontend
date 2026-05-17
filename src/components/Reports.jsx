import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/axiosApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Reports.css';

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
                    categoryData[categoryName] = { amount: 0, count: 0, icon: category ? category.icon : '??' };
                }
                categoryData[categoryName].amount += parseFloat(t.amount);
                categoryData[categoryName].count++;
            }
        });
        return Object.entries(categoryData).sort((a, b) => b[1].amount - a[1].amount);
    };

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // PDF Download
    const downloadPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Expense Tracker Report', 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
        
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Summary', 14, 45);
        
        doc.setFontSize(10);
        doc.text(`Total Income: ?${totalIncome.toFixed(2)}`, 14, 55);
        doc.text(`Total Expenses: ?${totalExpenses.toFixed(2)}`, 14, 62);
        doc.text(`Net Savings: ?${(totalIncome - totalExpenses).toFixed(2)}`, 14, 69);
        doc.text(`Total Transactions: ${transactions.length}`, 14, 76);
        
        let startY = 85;
        
        if (reportType === 'monthly') {
            doc.text('Monthly Report', 14, startY);
            startY += 10;
            
            const monthlyData = getMonthlyReport();
            const tableData = monthlyData.map(([month, data]) => [
                month,
                `?${data.income.toFixed(2)}`,
                `?${data.expense.toFixed(2)}`,
                `?${data.savings.toFixed(2)}`,
                data.count.toString()
            ]);
            
            autoTable(doc, {
                startY: startY,
                head: [['Month', 'Income', 'Expenses', 'Savings', 'Transactions']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [102, 126, 234], textColor: [255, 255, 255] },
                styles: { fontSize: 8, cellPadding: 3 }
            });
        } else {
            doc.text('Category Report', 14, startY);
            startY += 10;
            
            const categoryData = getCategoryReport();
            const totalExpenseAmount = categoryData.reduce((sum, [_, data]) => sum + data.amount, 0);
            const tableData = categoryData.map(([category, data]) => [
                `${data.icon} ${category}`,
                `?${data.amount.toFixed(2)}`,
                data.count.toString(),
                `?${(data.amount / data.count).toFixed(2)}`,
                `${((data.amount / totalExpenseAmount) * 100).toFixed(1)}%`
            ]);
            
            autoTable(doc, {
                startY: startY,
                head: [['Category', 'Total Spent', 'Transactions', 'Average', 'Percentage']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [102, 126, 234], textColor: [255, 255, 255] },
                styles: { fontSize: 8, cellPadding: 3 }
            });
        }
        
        doc.save(`expense_report_${reportType}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    // JSON Download
    const downloadJSON = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            reportType: reportType,
            summary: {
                totalIncome: totalIncome,
                totalExpenses: totalExpenses,
                netSavings: totalIncome - totalExpenses,
                totalTransactions: transactions.length
            },
            data: reportType === 'monthly' ? getMonthlyReport() : getCategoryReport()
        };
        
        const dataStr = JSON.stringify(report, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `expense_report_${reportType}_${new Date().toISOString().slice(0, 10)}.json`);
        linkElement.click();
    };

    // CSV Download
    const downloadCSV = () => {
        let csvData = [];
        
        if (reportType === 'monthly') {
            csvData = [['Month', 'Income', 'Expenses', 'Savings', 'Transactions']];
            getMonthlyReport().forEach(([month, data]) => {
                csvData.push([month, data.income, data.expense, data.savings, data.count]);
            });
        } else {
            csvData = [['Category', 'Total Spent', 'Transactions', 'Average', 'Percentage']];
            const categoryData = getCategoryReport();
            const totalExpenseAmount = categoryData.reduce((sum, [_, data]) => sum + data.amount, 0);
            categoryData.forEach(([category, data]) => {
                csvData.push([
                    category,
                    data.amount,
                    data.count,
                    (data.amount / data.count).toFixed(2),
                    `${((data.amount / totalExpenseAmount) * 100).toFixed(1)}%`
                ]);
            });
        }
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense_report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const monthlyReport = getMonthlyReport();
    const categoryReport = getCategoryReport();

    if (loading) return <div className="loading-spinner">Loading reports...</div>;
    if (error) return <div className="error-container"><p className="error-message">{error}</p><button onClick={() => window.location.href = '/login'} className="btn-primary">Go to Login</button></div>;

    return (
        <div className="reports-page">
            <div className="container">
                <h1 className="page-title">Expense Reports</h1>
                
                <div className="summary-stats">
                    <div className="stat-box"><h3>Total Income</h3><p className="income-text">?{totalIncome.toFixed(2)}</p></div>
                    <div className="stat-box"><h3>Total Expenses</h3><p className="expense-text">?{totalExpenses.toFixed(2)}</p></div>
                    <div className="stat-box"><h3>Net Savings</h3><p className={totalIncome - totalExpenses >= 0 ? 'income-text' : 'expense-text'}>?{(totalIncome - totalExpenses).toFixed(2)}</p></div>
                    <div className="stat-box"><h3>Transactions</h3><p>{transactions.length}</p></div>
                </div>
                
                <div className="report-controls">
                    <div className="report-type-selector">
                        <button className={`report-btn ${reportType === 'monthly' ? 'active' : ''}`} onClick={() => setReportType('monthly')}>Monthly Report</button>
                        <button className={`report-btn ${reportType === 'category' ? 'active' : ''}`} onClick={() => setReportType('category')}>Category Report</button>
                    </div>
                    <div className="download-buttons">
                        <button onClick={downloadPDF} className="btn-pdf">?? Download PDF</button>
                        <button onClick={downloadJSON} className="btn-download">?? Download JSON</button>
                        <button onClick={downloadCSV} className="btn-csv">?? Download CSV</button>
                    </div>
                </div>

                {reportType === 'monthly' && (
                    <div className="report-card">
                        <h2>Monthly Summary</h2>
                        {monthlyReport.length === 0 ? (
                            <div className="no-data">No transactions found</div>
                        ) : (
                            <div className="report-table">
                                <table>
                                    <thead>
                                        <tr><th>Month</th><th>Income</th><th>Expenses</th><th>Savings</th><th>Transactions</th></tr>
                                    </thead>
                                    <tbody>
                                        {monthlyReport.map(([month, data]) => (
                                            <tr key={month}>
                                                <td>{month}</td>
                                                <td className="income">?{data.income.toFixed(2)}</td>
                                                <td className="expense">?{data.expense.toFixed(2)}</td>
                                                <td className={data.savings >= 0 ? 'income' : 'expense'}>?{data.savings.toFixed(2)}</td>
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
                        {categoryReport.length === 0 ? (
                            <div className="no-data">No expense transactions found</div>
                        ) : (
                            <div className="report-table">
                                <table>
                                    <thead>
                                        <tr><th>Category</th><th>Total Spent</th><th>Transactions</th><th>Average</th><th>Percentage</th></tr>
                                    </thead>
                                    <tbody>
                                        {categoryReport.map(([category, data]) => (
                                            <tr key={category}>
                                                <td><span className="category-icon">{data.icon}</span> {category}</td>
                                                <td className="expense">?{data.amount.toFixed(2)}</td>
                                                <td>{data.count}</td>
                                                <td>?{(data.amount / data.count).toFixed(2)}</td>
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
