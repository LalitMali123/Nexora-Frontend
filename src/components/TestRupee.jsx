import React from 'react';

const TestRupee = () => {
    const amount = 1000;
    const rupeeSymbol = '\u20B9'; // Unicode for ₹
    
    return (
        <div style={{ padding: '20px' }}>
            <h2>Rupee Symbol Test</h2>
            <p>Direct Unicode: {rupeeSymbol}{amount}</p>
            <p>HTML Entity: &#8377;{amount}</p>
            <p>Template literal: {`\u20B9${amount}`}</p>
            <p>Using Intl: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}</p>
        </div>
    );
};

export default TestRupee;
