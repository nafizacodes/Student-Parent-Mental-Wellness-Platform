import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            navigate(data.user.role === 'parent' ? '/parent-dashboard' : '/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card">
                <div className="card">
                    <div className="auth-logo">🧠</div>
                    <h1 className="auth-title">{t('auth.loginTitle')}</h1>
                    <p className="auth-subtitle">{t('auth.loginSubtitle')}</p>

                    {error && <p className="error-message">{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label>{t('auth.email')}</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label>{t('auth.password')}</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? '...' : t('auth.loginBtn')}
                        </button>
                    </form>

                    <p className="auth-footer">
                        {t('auth.noAccount')} <Link to="/register">{t('auth.signUp')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
