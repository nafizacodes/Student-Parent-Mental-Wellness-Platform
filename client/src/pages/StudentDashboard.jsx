import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const moodValues = { happy: 5, good: 4, neutral: 3, sad: 2, angry: 1, tired: 2 };
const moodEmojis = { happy: '😊', good: '🙂', neutral: '😐', sad: '😢', angry: '😠', tired: '😴' };

export default function StudentDashboard() {
    const { t } = useTranslation();
    const { user, apiFetch } = useAuth();
    const [data, setData] = useState(null);
    const [period, setPeriod] = useState('weekly');

    useEffect(() => {
        apiFetch(`/dashboard/student?period=${period}`)
            .then(setData)
            .catch(console.error);
    }, [period]);

    if (!data) return <div className="main-content"><p>Loading...</p></div>;

    const labels = data.entries.map(e => {
        const d = new Date(e.date);
        return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    });

    const moodChartData = {
        labels,
        datasets: [{
            label: t('dashboard.moodTrend'),
            data: data.entries.map(e => moodValues[e.mood] || 3),
            borderColor: '#7C6FE0',
            backgroundColor: 'rgba(124, 111, 224, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#7C6FE0',
            pointRadius: 5
        }]
    };

    const stressChartData = {
        labels,
        datasets: [
            {
                label: t('checkin.stress'),
                data: data.entries.map(e => e.stress),
                borderColor: '#F87171',
                backgroundColor: 'rgba(248, 113, 113, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4
            },
            {
                label: t('checkin.energy'),
                data: data.entries.map(e => e.energy),
                borderColor: '#6DD5C3',
                backgroundColor: 'rgba(109, 213, 195, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
            y: { min: 0, max: 5, ticks: { stepSize: 1 } }
        }
    };

    return (
        <div className="main-content fade-in">
            <div className="page-header">
                <h1 className="page-title">{t('dashboard.welcome')}, {user?.name} 👋</h1>
                <p className="page-subtitle">{t('dashboard.studentTitle')}</p>
            </div>

            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-icon">💯</div>
                    <div className="stat-value">{data.wellnessScore}%</div>
                    <div className="stat-label">{t('dashboard.wellnessScore')}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{data.streak}</div>
                    <div className="stat-label">{t('dashboard.streak')}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{data.totalEntries}</div>
                    <div className="stat-label">{t('dashboard.totalEntries')}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon">
                        {data.entries.length > 0 ? moodEmojis[data.entries[data.entries.length - 1].mood] : '😐'}
                    </div>
                    <div className="stat-value" style={{ fontSize: 18 }}>
                        {data.entries.length > 0 ? t(`checkin.moods.${data.entries[data.entries.length - 1].mood}`) : '-'}
                    </div>
                    <div className="stat-label">Today's Mood</div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab ${period === 'weekly' ? 'active' : ''}`} onClick={() => setPeriod('weekly')}>
                    {t('dashboard.weekly')}
                </button>
                <button className={`tab ${period === 'monthly' ? 'active' : ''}`} onClick={() => setPeriod('monthly')}>
                    {t('dashboard.monthly')}
                </button>
            </div>

            {data.entries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                    <p style={{ fontSize: 48 }}>📝</p>
                    <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>{t('dashboard.noData')}</p>
                    <Link to="/checkin" className="btn btn-primary" style={{ marginTop: 16 }}>
                        {t('nav.checkin')}
                    </Link>
                </div>
            ) : (
                <>
                    <div className="chart-container">
                        <div className="chart-header">
                            <h3 className="chart-title">📈 {t('dashboard.moodTrend')}</h3>
                        </div>
                        <Line data={moodChartData} options={chartOptions} />
                    </div>

                    <div className="chart-container">
                        <div className="chart-header">
                            <h3 className="chart-title">📊 {t('dashboard.stressTrend')}</h3>
                        </div>
                        <Line data={stressChartData} options={chartOptions} />
                    </div>
                </>
            )}

            <h3 style={{ margin: '28px 0 16px' }}>⚡ {t('dashboard.quickActions')}</h3>
            <div className="section-grid">
                <Link to="/checkin" className="card game-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="game-icon">📝</div>
                    <div className="game-title">{t('nav.checkin')}</div>
                </Link>
                <Link to="/games" className="card game-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="game-icon">🎮</div>
                    <div className="game-title">{t('nav.games')}</div>
                </Link>
                <Link to="/music" className="card game-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="game-icon">🎵</div>
                    <div className="game-title">{t('nav.music')}</div>
                </Link>
            </div>

            <div className="disclaimer">{t('app.disclaimer')}</div>
        </div>
    );
}
