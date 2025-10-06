// pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    //  UZMI REDIRECT URL AKO POSTOJI
    const from = location.state?.from || '/'

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(formData)
            // REDIRECT NA PRETHODNU STRANICU ILI HOME
            navigate(from, { replace: true })
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
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
                    />
                </div>

                <button type="submit" disabled={loading} className="auth-button">
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>

                {/* Test credentials */}
                <div className="test-credentials">
                    <h4>Test Accounts:</h4>
                    <p><strong>Customer:</strong> customer@example.com / customer123</p>
                    <p><strong>Admin:</strong> admin@luxurywood.com / admin123</p>
                    <p><strong>Artisan:</strong> marko.woodcraft@luxurywood.com / artisan123</p>
                </div>
            </form>
        </div>
    )
}

export default Login