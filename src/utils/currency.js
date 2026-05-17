// utils/currency.js
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₹0.00';
    }
    const num = parseFloat(amount);
    return '₹' + num.toFixed(2);
};

export const formatIndianCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₹0.00';
    }
    const num = parseFloat(amount);
    // Format with Indian number system (lakhs, crores)
    return '₹' + num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Simple function that just returns the rupee symbol as a string
export const rupeeSymbol = () => '₹';

export default { formatCurrency, formatIndianCurrency, rupeeSymbol };
