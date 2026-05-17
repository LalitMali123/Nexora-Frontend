import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/axiosApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

    // Download PDF Report - Using window.html2canvas approach (alternative)
    const downloadPDFReport = () => {
        try {
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(22);
            doc.setTextColor(40, 40, 40);
            doc.text('Expense Report', 14, 20);
            
            // Date
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
            doc.text(`Report Type: ${reportType === 'monthly' ? 'Monthly Summary' : 'Category Breakdown'}`, 14, 37);
            
            // Summary
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('Summary', 14, 50);
            
            doc.setFontSize(10);
            doc.text(`Total Income: ${formatRupee(totalIncome)}`, 14, 60);
            doc.text(`Total Expenses: ${formatRupee(totalExpenses)}`, 14, 67);
            doc.text(`Net Savings: ${formatRupee(netSavings)}`, 14, 74);
            doc.text(`Total Transactions: ${transactions.length}`, 14, 81);
            
            let yPos = 100;
            
            // Monthly Report Table
            if (reportType === 'monthly') {
                doc.setFontSize(12);
                doc.text('Monthly Report', 14, yPos);
                yPos += 10;
                
                const monthlyData = getMonthlyReport();
                
                // Table headers
                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                doc.setFillColor(102, 126, 234);
                doc.rect(14, yPos, 180, 8, 'F');
                
                doc.text('Month', 16, yPos + 5);
                doc.text('Income', 56, yPos + 5);
                doc.text('Expenses', 96, yPos + 5);
                doc.text('Savings', 136, yPos + 5);
                doc.text('Transactions', 166, yPos + 5);
                
                yPos += 8;
                
                // Table rows
                monthlyData.forEach(([month, data]) => {
                    doc.setTextColor(40, 40, 40);
                    doc.text(month, 16, yPos + 5);
                    doc.setTextColor(16, 185, 129);
                    doc.text(formatRupee(data.income), 56, yPos + 5);
                    doc.setTextColor(239, 68, 68);
                    doc.text(formatRupee(data.expense), 96, yPos + 5);
                    doc.setTextColor(data.savings >= 0 ? 16 : 239, data.savings >= 0 ? 185 : 68, data.savings >= 0 ? 129 : 68);
                    doc.text(formatRupee(data.savings), 136, yPos + 5);
                    doc.setTextColor(40, 40, 40);
                    doc.text(data.count.toString(), 166, yPos + 5);
                    yPos += 7;
                    
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                });
            } else {
                // Category Report Table
                doc.setFontSize(12);
                doc.text('Category Report', 14, yPos);
                yPos += 10;
                
                const categoryData = getCategoryReport();
                const totalExpenseAmount = categoryData.reduce((sum, [_, data]) => sum + data.amount, 0);
                
                // Table headers
                doc.setFontSize(9);
                doc.setTextColor(255, 255, 255);
                doc.setFillColor(102, 126, 234);
                doc.rect(14, yPos, 180, 8, 'F');
                
                doc.text('Category', 16, yPos + 5);
                doc.text('Total Spent', 66, yPos + 5);
                doc.text('Transactions', 106, yPos + 5);
                doc.text('Average', 146, yPos + 5);
                doc.text('Percentage', 176, yPos + 5);
                
                yPos += 8;
                
                // Table rows
                categoryData.forEach(([category, data]) => {
                    doc.setTextColor(40, 40, 40);
                    doc.text(`${data.icon} ${category}`, 16, yPos + 5);
                    doc.setTextColor(239, 68, 68);
                    doc.text(formatRupee(data.amount), 66, yPos + 5);
                    doc.setTextColor(40, 40, 40);
                    doc.text(data.count.toString(), 106, yPos + 5);
                    doc.text(formatRupee(data.amount / data.count), 146, yPos + 5);
                    doc.text(`${((data.amount / totalExpenseAmount) * 100).toFixed(1)}%`, 176, yPos + 5);
                    yPos += 7;
                    
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                });
            }
            
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Report generated by Expense Tracker', 14, doc.internal.pageSize.height - 10);
            
            doc.save(`expense_report_${reportType}_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Download JSON Report
    const downloadJSONReport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            reportType: reportType,
            summary: {
                totalIncome: totalIncome,
                totalExpenses: totalExpenses,
                netSavings: netSavings,
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

    // Download CSV Report
    const downloadCSVReport = () => {
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

    if (loading) return <div className="loading-spinner">Loading reports...</div>;
    if (error) return <div className="error-container"><p className="error-message">{error}</p><button onClick={() => window.location.href = '/login'} className="btn-primary">Go to Login</button></div>;

    const monthlyReport = getMonthlyReport();
    const categoryReport = getCategoryReport();

    return (
        <div className="reports-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Expense Reports</h1>
                    <div className="download-buttons">
                        <button onClick={downloadPDFReport} className="btn-pdf">📄 Download PDF</button>
                        <button onClick={downloadJSONReport} className="btn-json">📥 Download JSON</button>
                        <button onClick={downloadCSVReport} className="btn-csv">📊 Download CSV</button>
                    </div>
                </div>

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
                                <table>
                                    <thead>
                                        <tr><th>Month</th><th>Income</th><th>Expenses</th><th>Savings</th><th>Transactions</th></tr>
                                    </thead>
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
                                <table>
                                    <thead>
                                        <tr><th>Category</th><th>Total Spent</th><th>Transactions</th><th>Average</th><th>Percentage</th></tr>
                                    </thead>
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