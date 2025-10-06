import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        user_type: 'customer' // 'customer' ili 'artisan'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();

    const { register } = useAuth();
    const navigate = useNavigate();

    // Proveri URL parametar za tip korisnika
    useEffect(() => {
        const type = searchParams.get('type');
        if (type === 'artisan') {
            setFormData(prev => ({ ...prev, user_type: 'artisan' }));
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {

            console.log('Registering user:', {
                ...formData,
                role: formData.user_type // Proverite da li backend očekuje 'role' ili 'user_type'
            });

            await register(formData);
            navigate('/dashboard');
        } catch (err) {

            setError(err.message || 'Registration failed. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const isArtisanRegistration = formData.user_type === 'artisan';

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1>
                    {isArtisanRegistration ? 'Join as Artisan' : 'Create Account'}
                </h1>
                <p>
                    {isArtisanRegistration
                        ? 'Start selling your handcrafted furniture today'
                        : 'Join us for exclusive furniture collections'
                    }
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* User Type Selection */}
                    <div className="form-group">
                        <label>I want to:</label>
                        <div className="user-type-selection">
                            <label className="user-type-option">
                                <input
                                    type="radio"
                                    name="user_type"
                                    value="customer"
                                    checked={formData.user_type === 'customer'}
                                    onChange={handleChange}
                                />
                                <span>Shop for furniture</span>
                            </label>
                            <label className="user-type-option">
                                <input
                                    type="radio"
                                    name="user_type"
                                    value="artisan"
                                    checked={formData.user_type === 'artisan'}
                                    onChange={handleChange}
                                />
                                <span>Sell my creations</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="full_name">
                            {isArtisanRegistration ? 'Business Name' : 'Full Name'}
                        </label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            placeholder={isArtisanRegistration ? "Enter your business name" : "Enter your full name"}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="At least 6 characters"
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? (isArtisanRegistration ? 'Creating Artisan Account...' : 'Creating Account...')
                            : (isArtisanRegistration ? 'Join as Artisan' : 'Create Account')
                        }
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>

                {isArtisanRegistration && (
                    <div className="artisan-features">
                        <h4>Artisan Benefits:</h4>
                        <ul>
                            <li>Reach customers worldwide</li>
                            <li>Easy product management</li>
                            <li>85% commission on sales</li>
                            <li>Marketing support</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;