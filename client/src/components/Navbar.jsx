import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const changeLang = (e) => {
        const lang = e.target.value;
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <span>🧠</span> {t('app.name')}
                </Link>

                <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? '✕' : '☰'}
                </button>

                {user && (
                    <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                        {user.role === 'student' ? (
                            <>
                                <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>{t('nav.dashboard')}</Link>
                                <Link to="/checkin" className={isActive('/checkin')} onClick={() => setMenuOpen(false)}>{t('nav.checkin')}</Link>
                                <Link to="/games" className={isActive('/games')} onClick={() => setMenuOpen(false)}>{t('nav.games')}</Link>
                                <Link to="/music" className={isActive('/music')} onClick={() => setMenuOpen(false)}>{t('nav.music')}</Link>
                                <Link to="/resources" className={isActive('/resources')} onClick={() => setMenuOpen(false)}>{t('nav.resources')}</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/parent-dashboard" className={isActive('/parent-dashboard')} onClick={() => setMenuOpen(false)}>{t('nav.dashboard')}</Link>
                                <Link to="/resources" className={isActive('/resources')} onClick={() => setMenuOpen(false)}>{t('nav.resources')}</Link>
                            </>
                        )}
                    </div>
                )}

                <div className="navbar-actions">
                    <select
                        value={i18n.language}
                        onChange={changeLang}
                        className="form-input"
                        style={{ width: 'auto', padding: '6px 32px 6px 10px', fontSize: '13px' }}
                    >
                        <option value="en">🇬🇧 EN</option>
                        <option value="hi">🇮🇳 HI</option>
                        <option value="es">🇪🇸 ES</option>
                    </select>

                    <button
                        className={`theme-toggle ${theme === 'dark' ? 'dark' : ''}`}
                        onClick={toggleTheme}
                        title="Toggle dark mode"
                    />

                    {user && (
                        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                            {t('nav.logout')}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
