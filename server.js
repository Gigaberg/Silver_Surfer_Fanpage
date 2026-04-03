const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Connect to SQLite database
const db = new Database('./contacts.db');

// Create table if it doesn't exist
db.exec(`
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

  const stmt = db.prepare(`INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`);
  stmt.run(name, email, message);
  res.redirect('/contact.html?success=true');
});

// GET route — view all submissions
app.get('/submissions', (req, res) => {
  const rows = db.prepare(`SELECT * FROM contacts ORDER BY submitted_at DESC`).all();
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
