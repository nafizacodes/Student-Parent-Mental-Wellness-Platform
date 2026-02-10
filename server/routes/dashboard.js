const express = require('express');
const { queryAll, queryOne } = require('../db');
const { authenticate, authorizeRole } = require('../middleware/auth');

const router = express.Router();

const moodValues = {
    'happy': 5, 'good': 4, 'neutral': 3, 'sad': 2, 'angry': 1, 'tired': 2
};

// Student dashboard analytics
router.get('/student', authenticate, authorizeRole('student'), (req, res) => {
    try {
        const { period = 'weekly' } = req.query;
        const days = period === 'monthly' ? 30 : 7;

        const entries = queryAll(
            `SELECT mood, stress, energy, date
       FROM mood_entries
       WHERE user_id = ? AND date >= date('now', ?)
       ORDER BY date ASC`,
            [req.user.id, `-${days} days`]
        );

        // Calculate wellness score
        let wellnessScore = 0;
        if (entries.length > 0) {
            const avgMood = entries.reduce((sum, e) => sum + (moodValues[e.mood] || 3), 0) / entries.length;
            const avgStress = entries.reduce((sum, e) => sum + e.stress, 0) / entries.length;
            const avgEnergy = entries.reduce((sum, e) => sum + e.energy, 0) / entries.length;
            wellnessScore = Math.round(((avgMood + (6 - avgStress) + avgEnergy) / 15) * 100);
        }

        // Calculate streak
        const allDates = queryAll(
            'SELECT DISTINCT date FROM mood_entries WHERE user_id = ? ORDER BY date DESC',
            [req.user.id]
        );

        let streak = 0;
        const today = new Date();
        for (let i = 0; i < allDates.length; i++) {
            const expected = new Date(today);
            expected.setDate(expected.getDate() - i);
            const expectedStr = expected.toISOString().split('T')[0];
            if (allDates[i].date === expectedStr) {
                streak++;
            } else {
                break;
            }
        }

        res.json({ entries, wellnessScore, streak, totalEntries: allDates.length });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Parent dashboard (NO journal)
router.get('/parent/:studentId', authenticate, authorizeRole('parent'), (req, res) => {
    try {
        const { studentId } = req.params;
        const { period = 'weekly' } = req.query;
        const days = period === 'monthly' ? 30 : 7;

        const link = queryOne(
            'SELECT id FROM linked_accounts WHERE parent_id = ? AND student_id = ?',
            [req.user.id, parseInt(studentId)]
        );
        if (!link) return res.status(403).json({ error: 'You are not linked to this student.' });

        const student = queryOne('SELECT id, name FROM users WHERE id = ? AND role = ?', [parseInt(studentId), 'student']);
        if (!student) return res.status(404).json({ error: 'Student not found.' });

        const entries = queryAll(
            `SELECT mood, stress, energy, date FROM mood_entries
       WHERE user_id = ? AND date >= date('now', ?)
       ORDER BY date ASC`,
            [parseInt(studentId), `-${days} days`]
        );

        let avgMood = 'N/A', avgStress = 0, avgEnergy = 0;
        if (entries.length > 0) {
            const moodCounts = {};
            entries.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
            avgMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
            avgStress = Math.round(entries.reduce((s, e) => s + e.stress, 0) / entries.length * 10) / 10;
            avgEnergy = Math.round(entries.reduce((s, e) => s + e.energy, 0) / entries.length * 10) / 10;
        }

        // High stress alert
        let highStressAlert = false;
        let consecutiveHighStress = 0;
        const recentEntries = queryAll(
            'SELECT stress, date FROM mood_entries WHERE user_id = ? ORDER BY date DESC LIMIT 7',
            [parseInt(studentId)]
        );
        for (const entry of recentEntries) {
            if (entry.stress >= 4) {
                consecutiveHighStress++;
                if (consecutiveHighStress >= 3) { highStressAlert = true; break; }
            } else { break; }
        }

        res.json({
            student: { id: student.id, name: student.name },
            entries,
            summary: { avgMood, avgStress, avgEnergy },
            highStressAlert,
            consecutiveHighStressDays: consecutiveHighStress
        });
    } catch (err) {
        console.error('Parent dashboard error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
