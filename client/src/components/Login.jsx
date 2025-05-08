  import React, { useState } from 'react';
  import './Login.css';
  import { loginUser } from '../api';
  import { toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import { FaEye, FaEyeSlash } from 'react-icons/fa';
  import { useNavigate } from 'react-router-dom';

  const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const response = await loginUser({ email, password });
        console.log("Login Response:", response.data);

        const user = response?.data?.user;
        const token = response?.data?.token;

        if (!user || !user.name || !user.id || !user.email) {
          throw new Error("Invalid response: Missing user information.");
        }

        // Store user data
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('role', user.isAdmin ? 'admin' : 'customer');

        toast.success(
          <div style={{ width: '400px' }}>Login successful!</div>,
          {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            closeButton: false,
          }
        );

        setTimeout(() => {
          // Call onLogin for both admin and regular users
          onLogin({ name: user.name, email: user.email, token, isAdmin: user.isAdmin });
          
          // Then navigate based on user role
          if (user.isAdmin) {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }, 2000);

      } catch (error) {
        console.error('Login error:', error);
        setError('Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="login-container">
        <div className="login-box">
          <img
            src="https://media.istockphoto.com/id/586162072/photo/various-kitchen-utensils.jpg?s=612x612&w=0&k=20&c=auwz9ZHqkG_UlKw5y-8UqvMLznA2PySQ_Jt3ameL1aU="
            alt="Shop"
            className="login-image"
          />
          <div className="login-form">
            <h2>Jay Agencies</h2>
            <p>Welcome back! Please login to manage your shop orders and products.</p>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group password-group">
                <label htmlFor="password">Password</label>
                <div className="password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="eye-icon" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p>
              Don't have an account? <a href="/signup">Register here</a>
            </p>
          </div>
        </div>
      </div>
    );
  };

  export default Login;
