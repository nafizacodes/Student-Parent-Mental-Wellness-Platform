import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const studentBooks = [
    { title: 'The Anxiety Survival Guide for Teens', author: 'Jennifer Shannon', desc: 'CBT strategies for managing worry, panic, and stress.', emoji: '📗' },
    { title: 'Mindfulness for Teens', author: 'Dzung X. Vo', desc: 'How mindfulness practices can help teens thrive.', emoji: '📘' },
    { title: 'You Are a Badass at Just Being You', author: 'Jen Sincero (adapted)', desc: 'Embracing your true self and building confidence.', emoji: '📙' },
    { title: 'The 7 Habits of Highly Effective Teens', author: 'Sean Covey', desc: 'Essential habits for navigating teenage years successfully.', emoji: '📕' }
];

const parentBooks = [
    { title: 'The Whole-Brain Child', author: 'Daniel J. Siegel', desc: 'Understanding brain science to nurture your child.', emoji: '📗' },
    { title: 'Untangled', author: 'Lisa Damour', desc: 'Guiding teenage girls through seven transitions.', emoji: '📘' },
    { title: 'How to Talk So Kids Will Listen', author: 'Adele Faber', desc: 'Communication strategies for stronger relationships.', emoji: '📙' },
    { title: 'Parenting a Teen Who Has Intense Emotions', author: 'Pat Harvey', desc: 'DBT skills to help your teen manage emotions.', emoji: '📕' }
];

const helplines = [
    { name: 'National Suicide Prevention Lifeline (US)', phone: '988', desc: 'Free 24/7 support for people in distress.', emoji: '📞' },
    { name: 'Crisis Text Line', phone: 'Text HOME to 741741', desc: 'Free crisis counseling via text.', emoji: '💬' },
    { name: 'iCall (India)', phone: '9152987821', desc: 'Psychosocial helpline by TISS Mumbai.', emoji: '🇮🇳' },
    { name: 'Vandrevala Foundation (India)', phone: '1860-2662-345', desc: '24/7 mental health support in India.', emoji: '🇮🇳' },
    { name: 'Childline (India)', phone: '1098', desc: 'Emergency helpline for children in distress.', emoji: '👧' }
];

const articles = [
    { title: 'How to Support Your Teen\'s Mental Health', source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health', emoji: '🌐' },
    { title: 'The Science of Happiness', source: 'TED Talk', url: 'https://www.ted.com/talks/dan_gilbert_the_surprising_science_of_happiness', emoji: '🎬' },
    { title: 'Stress Management Techniques for Students', source: 'Mayo Clinic', url: 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/basics/stress-basics/hlv-20049495', emoji: '🏥' },
    { title: 'Building Resilience in Children', source: 'APA', url: 'https://www.apa.org/topics/resilience/guide-parents-teachers', emoji: '📰' }
];

export default function Resources() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [tab, setTab] = useState('students');

    return (
        <div className="main-content fade-in">
            <div className="page-header">
                <h1 className="page-title">{t('resources.title')}</h1>
                <p className="page-subtitle">{t('resources.subtitle')}</p>
            </div>

            <div className="tabs">
                <button className={`tab ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>
                    🎓 {t('resources.forStudents')}
                </button>
                <button className={`tab ${tab === 'parents' ? 'active' : ''}`} onClick={() => setTab('parents')}>
                    👨‍👩‍👧 {t('resources.forParents')}
                </button>
                <button className={`tab ${tab === 'helplines' ? 'active' : ''}`} onClick={() => setTab('helplines')}>
                    📞 {t('resources.helplines')}
                </button>
                <button className={`tab ${tab === 'articles' ? 'active' : ''}`} onClick={() => setTab('articles')}>
                    📰 {t('resources.articles')}
                </button>
            </div>

            <div className="section-grid">
                {tab === 'students' && studentBooks.map((book, i) => (
                    <div key={i} className="card resource-card">
                        <div className="resource-type">{t('resources.book')}</div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>{book.emoji}</div>
                        <div className="resource-title">{book.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--primary)', marginBottom: 6 }}>{book.author}</div>
                        <div className="resource-desc">{book.desc}</div>
                    </div>
                ))}

                {tab === 'parents' && parentBooks.map((book, i) => (
                    <div key={i} className="card resource-card">
                        <div className="resource-type">{t('resources.book')}</div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>{book.emoji}</div>
                        <div className="resource-title">{book.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--primary)', marginBottom: 6 }}>{book.author}</div>
                        <div className="resource-desc">{book.desc}</div>
                    </div>
                ))}

                {tab === 'helplines' && helplines.map((h, i) => (
                    <div key={i} className="card resource-card">
                        <div className="resource-type">{t('resources.helpline')}</div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>{h.emoji}</div>
                        <div className="resource-title">{h.name}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>{h.phone}</div>
                        <div className="resource-desc">{h.desc}</div>
                    </div>
                ))}

                {tab === 'articles' && articles.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card resource-card" style={{ cursor: 'pointer' }}>
                            <div className="resource-type">{a.source}</div>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>{a.emoji}</div>
                            <div className="resource-title">{a.title}</div>
                            <div className="resource-desc">Click to read →</div>
                        </div>
                    </a>
                ))}
            </div>

            <div className="disclaimer">{t('app.disclaimer')}</div>
        </div>
    );
}
