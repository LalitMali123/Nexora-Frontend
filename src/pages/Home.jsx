import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [animatedNumbers, setAnimatedNumbers] = useState({
        users: 0,
        expenses: 0,
        satisfaction: 0
    });

    useEffect(() => {
        // Animate stats on load
        const animateNumbers = () => {
            const targets = { users: 10000, expenses: 5000000, satisfaction: 98 };
            const duration = 2000;
            const stepTime = 20;
            const steps = duration / stepTime;
            
            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;
                
                setAnimatedNumbers({
                    users: Math.floor(targets.users * progress),
                    expenses: Math.floor(targets.expenses * progress),
                    satisfaction: Math.floor(targets.satisfaction * progress)
                });
                
                if (currentStep >= steps) {
                    clearInterval(interval);
                    setAnimatedNumbers({
                        users: targets.users,
                        expenses: targets.expenses,
                        satisfaction: targets.satisfaction
                    });
                }
            }, stepTime);
        };
        
        animateNumbers();
    }, []);

    const handleGetStarted = () => {
        // Check if user is logged in
        const token = localStorage.getItem('access_token');
        const isLoggedIn = token && user;
        
        if (isLoggedIn) {
            // If logged in, go to dashboard
            navigate('/dashboard');
        } else {
            // If not logged in, go to register
            navigate('/register');
        }
    };

    const formatExpenses = (amount) => {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M+`;
        }
        return `$${amount.toLocaleString()}+`;
    };

    return (
        <div className="home">
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Track Your Expenses<br />
                        <span className="gradient-text">Smart & Simple</span>
                    </h1>
                    <p className="hero-description">
                        Take control of your finances with our powerful expense tracking tool.
                        Monitor spending, set budgets, and achieve your financial goals.
                    </p>
                    <div className="hero-buttons">
                        <button onClick={handleGetStarted} className="btn-get-started">
                            {user ? 'Go to Dashboard' : 'Get Started Free'}
                            <span className="btn-arrow">→</span>
                        </button>
                        {!user && (
                            <Link to="/login" className="btn-learn-more">Learn More</Link>
                        )}
                        {user && (
                            <Link to="/dashboard" className="btn-learn-more">Go to Dashboard</Link>
                        )}
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="stat-card">
                        <div className="stat-number">{animatedNumbers.users.toLocaleString()}+</div>
                        <div className="stat-label">Active Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{formatExpenses(animatedNumbers.expenses)}</div>
                        <div className="stat-label">Tracked Expenses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{animatedNumbers.satisfaction}%</div>
                        <div className="stat-label">Satisfaction Rate</div>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <h2 className="section-title">Why Choose Us?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Real-time Analytics</h3>
                        <p>Track your spending patterns with beautiful charts and insights</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3>Budget Management</h3>
                        <p>Set monthly budgets and get alerts when you're close to limits</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure & Private</h3>
                        <p>Your financial data is encrypted and completely private</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📱</div>
                        <h3>Mobile Friendly</h3>
                        <p>Access your expenses anytime, anywhere on any device</p>
                    </div>
                </div>
            </div>

            {/* Call to Action Section */}
            <div className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Take Control of Your Finances?</h2>
                    <p>Join thousands of users who are already saving money with ExpenseTracker</p>
                    <button onClick={handleGetStarted} className="btn-cta">
                        {user ? 'Go to Dashboard' : 'Start Your Free Trial'}
                    </button>
                </div>
            </div>
            <h1 className='designer'>Designed By: Lalit Saini</h1>
            <div className='designer'>Ex Google CEO</div>

        </div>
    );
};

export default Home;