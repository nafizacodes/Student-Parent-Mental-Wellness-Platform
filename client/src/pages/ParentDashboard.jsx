import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const moodEmojis = { happy: '😊', good: '🙂', neutral: '😐', sad: '😢', angry: '😠', tired: '😴' };

export default function ParentDashboard() {
    const { t } = useTranslation();
    const { user, apiFetch } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [report, setReport] = useState(null);
    const [period, setPeriod] = useState('weekly');
    const [linkEmail, setLinkEmail] = useState('');
    const [linkMsg, setLinkMsg] = useState('');
    const [linkError, setLinkError] = useState('');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await apiFetch('/parent/students');
            setStudents(data.students);
            if (data.students.length > 0 && !selectedStudent) {
                setSelectedStudent(data.students[0]);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (selectedStudent) {
            apiFetch(`/dashboard/parent/${selectedStudent.id}?period=${period}`)
                .then(setReport)
                .catch(console.error);
        }
    }, [selectedStudent, period]);

    const handleLink = async () => {
        if (!linkEmail) return;
        setLinkMsg(''); setLinkError('');
        try {
            const data = await apiFetch('/parent/link', {
                method: 'POST',
                body: JSON.stringify({ studentEmail: linkEmail })
            });
            setLinkMsg(data.message);
            setLinkEmail('');
            loadStudents();
        } catch (err) {
            setLinkError(err.message);
        }
    };

    const stressTrendData = report ? {
        labels: report.entries.map(e => {
            const d = new Date(e.date);
            return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: t('checkin.stress'),
                data: report.entries.map(e => e.stress),
                borderColor: '#F87171',
                backgroundColor: 'rgba(248, 113, 113, 0.1)',
                fill: true, tension: 0.4, pointRadius: 4
            },
            {
                label: t('checkin.energy'),
                data: report.entries.map(e => e.energy),
                borderColor: '#6DD5C3',
                backgroundColor: 'rgba(109, 213, 195, 0.1)',
                fill: true, tension: 0.4, pointRadius: 4
            }
        ]
    } : null;

    return (
        <div className="main-content fade-in">
            <div className="page-header">
                <h1 className="page-title">{t('dashboard.welcome')}, {user?.name} 👋</h1>
                <p className="page-subtitle">{t('dashboard.parentTitle')}</p>
            </div>

            {/* Link Student Section */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12 }}>🔗 {t('dashboard.linkStudent')}</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <input
                        type="email"
                        className="form-input"
                        placeholder={t('dashboard.studentEmail')}
                        value={linkEmail}
                        onChange={e => setLinkEmail(e.target.value)}
                        style={{ flex: 1, minWidth: 200 }}
                    />
                    <button className="btn btn-primary" onClick={handleLink}>{t('dashboard.link')}</button>
                </div>
                {linkMsg && <p className="alert alert-success" style={{ marginTop: 12 }}>{linkMsg}</p>}
                {linkError && <p className="alert alert-danger" style={{ marginTop: 12 }}>{linkError}</p>}
            </div>

            {/* Student selector */}
            {students.length > 0 && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                    {students.map(s => (
                        <button
                            key={s.id}
                            className={`btn ${selectedStudent?.id === s.id ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedStudent(s)}
                        >
                            🎓 {s.name}
                        </button>
                    ))}
                </div>
            )}

            {students.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                    <p style={{ fontSize: 48 }}>👨‍👩‍👧</p>
                    <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>{t('dashboard.noStudents')}</p>
                </div>
            )}

            {/* Report */}
            {report && (
                <>
                    {report.highStressAlert && (
                        <div className="alert alert-danger">
                            {t('dashboard.highStressAlert', { days: report.consecutiveHighStressDays })}
                        </div>
                    )}

                    <div className="stats-grid">
                        <div className="card stat-card">
                            <div className="stat-icon">{moodEmojis[report.summary.avgMood] || '😐'}</div>
                            <div className="stat-value" style={{ fontSize: 18 }}>
                                {report.summary.avgMood !== 'N/A' ? t(`checkin.moods.${report.summary.avgMood}`) : 'N/A'}
                            </div>
                            <div className="stat-label">{t('dashboard.avgMood')}</div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-icon">😰</div>
                            <div className="stat-value">{report.summary.avgStress}/5</div>
                            <div className="stat-label">{t('dashboard.avgStress')}</div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-value">{report.summary.avgEnergy}/5</div>
                            <div className="stat-label">{t('dashboard.avgEnergy')}</div>
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

                    {report.entries.length > 0 && stressTrendData && (
                        <div className="chart-container">
                            <div className="chart-header">
                                <h3 className="chart-title">📊 {t('dashboard.stressTrend')} — {report.student.name}</h3>
                            </div>
                            <Line data={stressTrendData} options={{
                                responsive: true,
                                plugins: { legend: { position: 'top' } },
                                scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } }
                            }} />
                        </div>
                    )}
                </>
            )}

            <div className="disclaimer">{t('app.disclaimer')}</div>
        </div>
    );
}
