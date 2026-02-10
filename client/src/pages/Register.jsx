import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { t } = useTranslation();
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await register(name, email, password, role);
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
                    <div className="auth-logo">🌱</div>
                    <h1 className="auth-title">{t('auth.registerTitle')}</h1>
                    <p className="auth-subtitle">{t('auth.registerSubtitle')}</p>

                    {error && <p className="error-message">{error}</p>}

                    <div className="role-selector">
                        <div
                            className={`role-option ${role === 'student' ? 'selected' : ''}`}
                            onClick={() => setRole('student')}
                        >
                            <span className="role-emoji">🎓</span>
                            <span className="role-name">{t('auth.student')}</span>
                        </div>
                        <div
                            className={`role-option ${role === 'parent' ? 'selected' : ''}`}
                            onClick={() => setRole('parent')}
                        >
                            <span className="role-emoji">👨‍👩‍👧</span>
                            <span className="role-name">{t('auth.parent')}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ textAlign: 'left' }}>
                            <label>{t('auth.name')}</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                        </div>
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
                                minLength={6}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? '...' : t('auth.registerBtn')}
                        </button>
                    </form>

                    <p className="auth-footer">
                        {t('auth.hasAccount')} <Link to="/login">{t('auth.signIn')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
