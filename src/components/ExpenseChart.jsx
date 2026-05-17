import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './ExpenseChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = ({ transactions }) => {
  // Group expenses by category
  const categoryMap = new Map();
  
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      const category = transaction.category_name || transaction.category || 'Uncategorized';
      const amount = parseFloat(transaction.amount);
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
    }
  });
  
  // Sort categories by amount (largest first)
  const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);
  const categories = sortedCategories.map(([name]) => name);
  const amounts = sortedCategories.map(([, amount]) => amount);
  
  // Enhanced color palette
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7B05E', '#B5EAD7', '#C7CEEA',
    '#FFB347', '#77DD77', '#AEC6CF', '#FF99CC', '#FFB347'
  ];
  
  const totalAmount = amounts.reduce((sum, val) => sum + val, 0);
  
  const data = {
    labels: categories,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors.slice(0, categories.length),
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '40%', // Creates a donut chart effect
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 11,
            family: "'DM Sans', sans-serif"
          },
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 14,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#00e5ff',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = ((value / totalAmount) * 100).toFixed(1);
            return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      },
    },
  };
  
  if (categories.length === 0) {
    return (
      <div className="no-chart-data">
        <div className="no-chart-icon">📊</div>
        <p>No expense data available</p>
        <p className="sub-text">Add some expenses to see your spending breakdown</p>
      </div>
    );
  }
  
  return (
    <div className="expense-chart-container">
      <div className="chart-header">
        <h3>Expense Distribution</h3>
        <div className="chart-total">
          <span className="total-label">Total Spent</span>
          <span className="total-amount">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="chart-wrapper">
        <Pie data={data} options={options} />
      </div>
      <div className="chart-footer">
        <p>Click on segments to see details • Hover for percentages</p>
      </div>
    </div>
  );
};

export default ExpenseChart;