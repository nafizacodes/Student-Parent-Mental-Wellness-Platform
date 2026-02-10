import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const moods = [
    { key: 'happy', emoji: '😊' },
    { key: 'good', emoji: '🙂' },
    { key: 'neutral', emoji: '😐' },
    { key: 'sad', emoji: '😢' },
    { key: 'angry', emoji: '😠' },
    { key: 'tired', emoji: '😴' }
];

export default function DailyCheckin() {
    const { t } = useTranslation();
    const { apiFetch } = useAuth();
    const [mood, setMood] = useState('');
    const [stress, setStress] = useState(3);
    const [energy, setEnergy] = useState(3);
    const [journal, setJournal] = useState('');
    const [saved, setSaved] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        apiFetch('/mood/today')
            .then(data => {
                if (data.entry) {
                    setMood(data.entry.mood);
                    setStress(data.entry.stress);
                    setEnergy(data.entry.energy);
                    setJournal(data.entry.journal || '');
                    setIsUpdate(true);
                }
            })
            .catch(() => { });
    }, []);

    const handleSubmit = async () => {
        if (!mood) return;
        setLoading(true);
        try {
            await apiFetch('/mood', {
                method: 'POST',
                body: JSON.stringify({ mood, stress, energy, journal })
            });
            setSaved(true);
            setIsUpdate(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content fade-in">
            <div className="page-header">
                <h1 className="page-title">{t('checkin.title')}</h1>
                <p className="page-subtitle">{t('checkin.subtitle')}</p>
            </div>

            {saved && <div className="alert alert-success">✅ {t('checkin.saved')}</div>}

            <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
                <h3 style={{ marginBottom: 16 }}>{t('checkin.mood')}</h3>
                <div className="mood-selector">
                    {moods.map(m => (
                        <div
                            key={m.key}
                            className={`mood-option ${mood === m.key ? 'selected' : ''}`}
                            onClick={() => setMood(m.key)}
                        >
                            <span className="mood-emoji">{m.emoji}</span>
                            <span className="mood-label">{t(`checkin.moods.${m.key}`)}</span>
                        </div>
                    ))}
                </div>

                <div className="slider-container">
                    <div className="slider-header">
                        <span className="slider-label">😰 {t('checkin.stress')}</span>
                        <span className="slider-value">{stress}/5</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={stress}
                        onChange={e => setStress(parseInt(e.target.value))}
                    />
                </div>

                <div className="slider-container">
                    <div className="slider-header">
                        <span className="slider-label">⚡ {t('checkin.energy')}</span>
                        <span className="slider-value">{energy}/5</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={energy}
                        onChange={e => setEnergy(parseInt(e.target.value))}
                    />
                </div>

                <div className="form-group" style={{ marginTop: 20 }}>
                    <label>📝 {t('checkin.journal')}</label>
                    <textarea
                        className="form-input"
                        value={journal}
                        onChange={e => setJournal(e.target.value)}
                        placeholder={t('checkin.journalPlaceholder')}
                    />
                </div>

                <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: 8 }}
                    onClick={handleSubmit}
                    disabled={!mood || loading}
                >
                    {loading ? '...' : isUpdate ? t('checkin.update') : t('checkin.submit')}
                </button>
            </div>

            <div className="disclaimer">{t('app.disclaimer')}</div>
        </div>
    );
}
