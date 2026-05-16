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
      const category = transaction.category;
      const amount = transaction.amount;
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
    }
  });
  
  const categories = Array.from(categoryMap.keys());
  const amounts = Array.from(categoryMap.values());
  
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF'
  ];
  
  const data = {
    labels: categories,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  if (categories.length === 0) {
    return (
      <div className="no-chart-data">
        <p>No expense data available</p>
        <p className="sub-text">Add some expenses to see the chart</p>
      </div>
    );
  }
  
  return (
    <div className="expense-chart-container">
      <Pie data={data} options={options} />
    </div>
  );
};

export default ExpenseChart;