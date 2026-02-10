import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const tracks = [
    {
        id: 1, title: 'Forest Morning', category: 'nature', emoji: '🌲', duration: '3:20',
        // Using a generated audio tone (oscillator-based silence for demo — replaced with description)
        url: null
    },
    { id: 2, title: 'Ocean Waves', category: 'nature', emoji: '🌊', duration: '4:15', url: null },
    { id: 3, title: 'Gentle Rain', category: 'rain', emoji: '🌧️', duration: '5:00', url: null },
    { id: 4, title: 'Thunderstorm', category: 'rain', emoji: '⛈️', duration: '4:30', url: null },
    { id: 5, title: 'Piano Meditation', category: 'instrumental', emoji: '🎹', duration: '3:45', url: null },
    { id: 6, title: 'Acoustic Calm', category: 'instrumental', emoji: '🎸', duration: '4:00', url: null },
    { id: 7, title: 'Bird Song', category: 'nature', emoji: '🐦', duration: '3:10', url: null },
    { id: 8, title: 'Light Rain on Leaves', category: 'rain', emoji: '🍃', duration: '5:30', url: null },
    { id: 9, title: 'Soft Strings', category: 'instrumental', emoji: '🎻', duration: '4:20', url: null }
];

export default function Music() {
    const { t } = useTranslation();
    const [filter, setFilter] = useState('all');
    const [playing, setPlaying] = useState(null);
    const [volume, setVolume] = useState(0.7);
    const audioCtxRef = useRef(null);
    const oscRef = useRef(null);
    const gainRef = useRef(null);

    // Generate calming tones using Web Audio API
    const frequencies = {
        1: 220, 2: 174.61, 3: 246.94, 4: 196, 5: 261.63,
        6: 293.66, 7: 329.63, 8: 233.08, 9: 349.23
    };

    const playTrack = (track) => {
        stopAudio();

        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = frequencies[track.id] || 220;

        lfo.type = 'sine';
        lfo.frequency.value = 0.2; // Slow wobble
        lfoGain.gain.value = 5;

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.value = volume * 0.3; // Keep it gentle
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        lfo.start();

        oscRef.current = osc;
        gainRef.current = gain;
        setPlaying(track.id);
    };

    const stopAudio = () => {
        if (oscRef.current) {
            try { oscRef.current.stop(); } catch (e) { }
            oscRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
        setPlaying(null);
    };

    const handleVolume = (e) => {
        const v = parseFloat(e.target.value);
        setVolume(v);
        if (gainRef.current) {
            gainRef.current.gain.value = v * 0.3;
        }
    };

    const filtered = filter === 'all' ? tracks : tracks.filter(t => t.category === filter);
    const categories = ['all', 'nature', 'rain', 'instrumental'];
    const catLabels = { all: '🎵 All', nature: `🌿 ${t('music.nature')}`, rain: `🌧️ ${t('music.rain')}`, instrumental: `🎹 ${t('music.instrumental')}` };

    return (
        <div className="main-content fade-in">
            <div className="page-header">
                <h1 className="page-title">{t('music.title')}</h1>
                <p className="page-subtitle">{t('music.subtitle')}</p>
            </div>

            <div className="tabs" style={{ marginBottom: 24 }}>
                {categories.map(c => (
                    <button key={c} className={`tab ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
                        {catLabels[c]}
                    </button>
                ))}
            </div>

            {playing && (
                <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <span>🎵 {t('music.playing')}: <strong>{tracks.find(t => t.id === playing)?.title}</strong></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13 }}>{t('music.volume')}</span>
                        <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolume} className="volume-slider" />
                        <button className="btn btn-sm btn-danger" onClick={stopAudio}>⏹ Stop</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map(track => (
                    <div key={track.id} className="card music-card">
                        <div className="music-icon">{track.emoji}</div>
                        <div className="music-info">
                            <div className="music-title">{track.title}</div>
                            <div className="music-category">{track.category} • {track.duration}</div>
                        </div>
                        <div className="music-controls">
                            <button
                                className="play-btn"
                                onClick={() => playing === track.id ? stopAudio() : playTrack(track)}
                            >
                                {playing === track.id ? '⏸' : '▶'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="disclaimer">{t('app.disclaimer')}</div>
        </div>
    );
}
