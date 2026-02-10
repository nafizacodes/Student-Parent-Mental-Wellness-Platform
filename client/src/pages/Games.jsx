import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

function BubblePop({ onBack }) {
    const { t } = useTranslation();
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const bubblesRef = useRef([]);
    const animRef = useRef(null);

    const colors = ['#7C6FE0', '#6DD5C3', '#F0A8D0', '#A89BF0', '#60A5FA', '#FBBF24', '#4ADE80'];

    const createBubble = useCallback((canvas) => {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height + 30,
            r: 15 + Math.random() * 30,
            speed: 0.5 + Math.random() * 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 0.7 + Math.random() * 0.3,
            wobble: Math.random() * Math.PI * 2
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        for (let i = 0; i < 15; i++) {
            const b = createBubble(canvas);
            b.y = Math.random() * canvas.height;
            bubblesRef.current.push(b);
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (Math.random() < 0.03) {
                bubblesRef.current.push(createBubble(canvas));
            }

            bubblesRef.current = bubblesRef.current.filter(b => b.y + b.r > -10);

            bubblesRef.current.forEach(b => {
                b.y -= b.speed;
                b.wobble += 0.02;
                b.x += Math.sin(b.wobble) * 0.5;

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fillStyle = b.color;
                ctx.globalAlpha = b.opacity;
                ctx.fill();

                // Shine
                ctx.beginPath();
                ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.15, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            animRef.current = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    const handleClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        bubblesRef.current = bubblesRef.current.filter(b => {
            const dist = Math.sqrt((b.x - mx) ** 2 + (b.y - my) ** 2);
            if (dist < b.r) {
                setScore(s => s + 1);
                return false;
            }
            return true;
        });
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button className="btn btn-secondary" onClick={onBack}>← {t('games.back')}</button>
                <span className="badge badge-primary" style={{ fontSize: 16, padding: '8px 16px' }}>
                    {t('games.score')}: {score}
                </span>
            </div>
            <canvas ref={canvasRef} className="bubble-canvas" onClick={handleClick} />
        </div>
    );
}

function BreathingExercise({ onBack }) {
    const { t } = useTranslation();
    const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale
    const [running, setRunning] = useState(false);
    const intervalRef = useRef(null);

    const start = () => {
        setRunning(true);
        setPhase('inhale');
        let step = 0;
        intervalRef.current = setInterval(() => {
            step++;
            const cycle = step % 12;
            if (cycle < 4) setPhase('inhale');
            else if (cycle < 7) setPhase('hold');
            else setPhase('exhale');
        }, 1000);
    };

    const stop = () => {
        setRunning(false);
        setPhase('idle');
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

    const getText = () => {
        if (phase === 'inhale') return t('games.inhale');
        if (phase === 'hold') return t('games.hold');
        if (phase === 'exhale') return t('games.exhale');
        return '🧘';
    };

    return (
        <div className="fade-in">
            <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 16 }}>← {t('games.back')}</button>
            <div className="breathing-container">
                <div className={`breathing-circle ${phase}`}>
                    <span className="breathing-text">{getText()}</span>
                </div>
                <p className="breathing-instruction">
                    {phase === 'idle' ? t('games.breathingDesc') : `${phase === 'inhale' ? '4s' : phase === 'hold' ? '3s' : '5s'}`}
                </p>
                <button
                    className={`btn ${running ? 'btn-danger' : 'btn-primary'} btn-lg`}
                    style={{ marginTop: 24 }}
                    onClick={running ? stop : start}
                >
                    {running ? t('games.stop') : t('games.start')}
                </button>
            </div>
        </div>
    );
}

function ColorTherapy({ onBack }) {
    const { t } = useTranslation();
    const [bg, setBg] = useState('');
    const therapyColors = [
        '#E8E0FF', '#D4E8FF', '#D4F5E0', '#FFF0D4', '#FFD4E8',
        '#D4FFF0', '#F0E0FF', '#E0F0FF', '#F5F0D4', '#FFE0D4',
        '#D4FFF5', '#FFECD4', '#E0D4FF', '#D4FFE0', '#FFD4D4',
        '#D4F0FF'
    ];

    return (
        <div className="fade-in">
            <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 16 }}>← {t('games.back')}</button>
            <div className="card" style={{
                background: bg || 'var(--bg-card)',
                transition: 'background 1s ease',
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🎨</p>
                <h3 style={{ marginBottom: 24 }}>{t('games.colorTherapy')}</h3>
                <div className="color-grid" style={{ maxWidth: 400 }}>
                    {therapyColors.map(c => (
                        <div
                            key={c}
                            className={`color-swatch ${bg === c ? 'selected' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setBg(c)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Games() {
    const { t } = useTranslation();
    const [activeGame, setActiveGame] = useState(null);

    if (activeGame === 'bubble') return <div className="main-content"><BubblePop onBack={() => setActiveGame(null)} /></div>;
    if (activeGame === 'breathing') return <div className="main-content"><BreathingExercise onBack={() => setActiveGame(null)} /></div>;
    if (activeGame === 'color') return <div className="main-content"><ColorTherapy onBack={() => setActiveGame(null)} /></div>;

    return (
        <div className="main-content fade-in">
            <div className="page-header">
                <h1 className="page-title">{t('games.title')}</h1>
                <p className="page-subtitle">{t('games.subtitle')}</p>
            </div>

            <div className="section-grid">
                <div className="card game-card" onClick={() => setActiveGame('bubble')}>
                    <div className="game-icon">🫧</div>
                    <div className="game-title">{t('games.bubblePop')}</div>
                    <div className="game-desc">{t('games.bubbleDesc')}</div>
                </div>
                <div className="card game-card" onClick={() => setActiveGame('breathing')}>
                    <div className="game-icon">🧘</div>
                    <div className="game-title">{t('games.breathing')}</div>
                    <div className="game-desc">{t('games.breathingDesc')}</div>
                </div>
                <div className="card game-card" onClick={() => setActiveGame('color')}>
                    <div className="game-icon">🎨</div>
                    <div className="game-title">{t('games.colorTherapy')}</div>
                    <div className="game-desc">{t('games.colorDesc')}</div>
                </div>
            </div>

            <div className="disclaimer">{t('app.disclaimer')}</div>
        </div>
    );
}
