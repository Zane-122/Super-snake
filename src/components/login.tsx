import React, { useEffect, useState } from 'react';
import CartoonInput from './input';
import BasicButton from './Basic-button';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const handleLogin = async () => {
    if (!email || !password) {
      return setError('Please fill in all fields');
      setTimeout(() => {
        setError('');
      }, 3000);
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
      setTimeout(() => {
        setError('');
      }, 3000);
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return setError('Please enter a valid email address');
      setTimeout(() => {
        setError('');
      }, 3000);
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 'fit-content', padding: "15px", paddingTop: "0px", backgroundColor: 'rgba(160, 204, 255, 0.5)', borderRadius: '15px', border: '4px solid black', gap: '10px'}}>
      <h1 style={{ margin: "0px", padding: "0px", paddingTop: "20px"}}>Login</h1>
      {error ? <text style={{ color: 'red', padding: 0, margin: "0px", fontSize: '12px'}}>{error}</text> : <text style={{ color: 'black', padding: 0, margin: "0px", fontSize: '12px'}}> - </text>}
      <CartoonInput
        value={email}
        onChange={setEmail}
        placeholder="Your email"
        maxLength={20}
        />
        <CartoonInput
        value={password}
        onChange={setPassword}
        placeholder="Your password"
        maxLength={20}
        type="password"
        />
        <BasicButton
          label={loading ? 'Loading...' : 'Login'}
          color="rgb(55, 255, 218)"
          onClick={handleLogin}
          size="small"
        />
    </div>
  )
};

export default Login;