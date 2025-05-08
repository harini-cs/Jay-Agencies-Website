import React, { useState } from 'react';
import './Login.css'; // Reuse the same CSS
import { registerUser } from '../api'; // API function
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset error messages
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Step 1: Validate name (should not be empty)
        if (!name.trim()) {
            setNameError('Name is required.');
            return;
        }

        // Step 2: Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        // Step 3: Validate password strength
        const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError('Password must be at least 8 characters long and contain at least one special character.');
            return;
        }

        // Step 4: Check if passwords match
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match!');
            return;
        }

        // Step 5: Register the user
        try {
            setLoading(true);
            const response = await registerUser({ name, email, password });

            if (response.status === 201) {
                // Show success toast notification
                toast.success(
                    <div style={{ width: '400px' }}>
                        Registration successful!
                        <br />
                        Redirecting to login...
                    </div>,
                    {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        closeButton: false, 
                    }
                );

                // Redirect to login page after a delay
                setTimeout(() => navigate('/'), 3000);
            } else {
                setEmailError(response.data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setEmailError('Registration failed. Please try again.');
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
                    <p>Create an account to shop with us.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="register-name">Full Name</label>
                            <input
                                id="register-name"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            {nameError && <p className="error-message">{nameError}</p>}
                        </div>
                        <div className="input-group">
                            <label htmlFor="register-email">Email</label>
                            <input
                                id="register-email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {emailError && <p className="error-message">{emailError}</p>}
                        </div>
                        <div className="input-group">
                            <label htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {passwordError && <p className="error-message">{passwordError}</p>}
                        </div>
                        <div className="input-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                    <p>
                        Already have an account? <a href="/">Login here</a>
                    </p>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Signup;
