import React, { useState } from 'react';

const TestLogin = () => {
    const [username, setUsername] = useState('testuser2');
    const [password, setPassword] = useState('testpass123');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testLogin = async () => {
        setLoading(true);
        setResult('Testing login...');
        
        try {
            const requestBody = {
                username: username,
                password: password
            };
            
            console.log('Sending to backend:', requestBody);
            
            const response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            console.log('Response:', response.status, data);
            
            setResult(JSON.stringify({
                status: response.status,
                data: data
            }, null, 2));
            
        } catch (error) {
            console.error('Error:', error);
            setResult('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const testRegister = async () => {
        setLoading(true);
        setResult('Testing registration...');
        
        try {
            const requestBody = {
                username: 'test_' + Date.now(),
                email: 'test@example.com',
                password: 'testpass123'
            };
            
            const response = await fetch('http://localhost:8000/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            setResult(JSON.stringify({
                status: response.status,
                data: data
            }, null, 2));
            
        } catch (error) {
            setResult('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Backend Login Test</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <div>
                    <label>Username: </label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ margin: '10px', padding: '5px' }}
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ margin: '10px', padding: '5px' }}
                    />
                </div>
            </div>
            
            <div>
                <button 
                    onClick={testRegister} 
                    disabled={loading}
                    style={{ margin: '5px', padding: '10px' }}
                >
                    Test Register
                </button>
                <button 
                    onClick={testLogin} 
                    disabled={loading}
                    style={{ margin: '5px', padding: '10px' }}
                >
                    Test Login
                </button>
            </div>
            
            {loading && <p>Loading...</p>}
            
            {result && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '10px', 
                    background: '#f0f0f0',
                    borderRadius: '5px',
                    overflow: 'auto'
                }}>
                    <pre>{result}</pre>
                </div>
            )}
        </div>
    );
};

export default TestLogin;