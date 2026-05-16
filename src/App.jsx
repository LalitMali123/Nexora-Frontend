import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import AddExpense from './components/AddExpense';
import BudgetManager from './components/BudgetManager';
import Reports from './components/Reports';
import TestLogin from './components/TestLogin';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/budget" element={<BudgetManager />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/test" element={<TestLogin />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;