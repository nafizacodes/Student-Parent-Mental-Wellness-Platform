const express = require('express');
const { queryAll, queryOne, runSql } = require('../db');
const { authenticate, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Link parent to student by email
router.post('/link', authenticate, authorizeRole('parent'), (req, res) => {
    try {
        const { studentEmail } = req.body;
        if (!studentEmail) return res.status(400).json({ error: 'Student email is required.' });

        const student = queryOne('SELECT id, name, email FROM users WHERE email = ? AND role = ?', [studentEmail, 'student']);
        if (!student) return res.status(404).json({ error: 'No student found with that email.' });

        const existing = queryOne(
            'SELECT id FROM linked_accounts WHERE parent_id = ? AND student_id = ?',
            [req.user.id, student.id]
        );
        if (existing) return res.status(400).json({ error: 'Already linked to this student.' });

        runSql('INSERT INTO linked_accounts (parent_id, student_id) VALUES (?, ?)', [req.user.id, student.id]);

        res.status(201).json({
            message: 'Successfully linked to student.',
            student: { id: student.id, name: student.name, email: student.email }
        });
    } catch (err) {
        console.error('Link error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Get linked students
router.get('/students', authenticate, authorizeRole('parent'), (req, res) => {
    try {
        const students = queryAll(
            `SELECT u.id, u.name, u.email FROM linked_accounts la
       JOIN users u ON la.student_id = u.id WHERE la.parent_id = ?`,
            [req.user.id]
        );
        res.json({ students });
    } catch (err) {
        console.error('Get students error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Unlink student
router.delete('/unlink/:studentId', authenticate, authorizeRole('parent'), (req, res) => {
    try {
        const result = runSql(
            'DELETE FROM linked_accounts WHERE parent_id = ? AND student_id = ?',
            [req.user.id, parseInt(req.params.studentId)]
        );
        if (result.changes === 0) return res.status(404).json({ error: 'Link not found.' });
        res.json({ message: 'Student unlinked successfully.' });
    } catch (err) {
        console.error('Unlink error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
