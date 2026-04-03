const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Connect to SQLite database (creates file if it doesn't exist)
const db = new sqlite3.Database('./contacts.db', (err) => {
  if (err) return console.error('DB error:', err.message);
  console.log('Connected to SQLite database.');
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// POST route — handle form submission
app.post('/submit', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email) {
    return res.status(400).send('Name and email are required.');
  }

  db.run(
    `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`,
    [name, email, message],
    function (err) {
      if (err) return res.status(500).send('Database error.');
      res.redirect('/contact.html?success=true');
    }
  );
});

// GET route — view all submissions (simple admin view)
app.get('/submissions', (req, res) => {
  db.all(`SELECT * FROM contacts ORDER BY submitted_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).send('Database error.');
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
