const express = require('express');
const { queryAll, queryOne, runSql } = require('../db');
const { authenticate, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Save mood entry (student only)
router.post('/', authenticate, authorizeRole('student'), (req, res) => {
    try {
        const { mood, stress, energy, journal } = req.body;

        if (!mood || !stress || !energy) {
            return res.status(400).json({ error: 'Mood, stress, and energy are required.' });
        }

        if (stress < 1 || stress > 5 || energy < 1 || energy > 5) {
            return res.status(400).json({ error: 'Stress and energy must be between 1 and 5.' });
        }

        const today = new Date().toISOString().split('T')[0];

        // Check if entry already exists for today
        const existing = queryOne(
            'SELECT id FROM mood_entries WHERE user_id = ? AND date = ?',
            [req.user.id, today]
        );

        if (existing) {
            runSql(
                'UPDATE mood_entries SET mood = ?, stress = ?, energy = ?, journal = ? WHERE id = ?',
                [mood, stress, energy, journal || null, existing.id]
            );
            return res.json({ message: 'Mood entry updated for today.' });
        }

        runSql(
            'INSERT INTO mood_entries (user_id, mood, stress, energy, journal, date) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, mood, stress, energy, journal || null, today]
        );

        res.status(201).json({ message: 'Mood entry saved.' });
    } catch (err) {
        console.error('Mood save error:', err);
        res.status(500).json({ error: 'Server error saving mood.' });
    }
});

// Get mood entries (student only - includes journal)
router.get('/', authenticate, authorizeRole('student'), (req, res) => {
    try {
        const { days = 30 } = req.query;
        const entries = queryAll(
            `SELECT id, mood, stress, energy, journal, date, created_at
       FROM mood_entries WHERE user_id = ?
       ORDER BY date DESC LIMIT ?`,
            [req.user.id, parseInt(days)]
        );
        res.json({ entries });
    } catch (err) {
        console.error('Mood fetch error:', err);
        res.status(500).json({ error: 'Server error fetching moods.' });
    }
});

// Get today's entry
router.get('/today', authenticate, authorizeRole('student'), (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const entry = queryOne(
            'SELECT id, mood, stress, energy, journal, date FROM mood_entries WHERE user_id = ? AND date = ?',
            [req.user.id, today]
        );
        res.json({ entry: entry || null });
    } catch (err) {
        console.error('Today mood error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
