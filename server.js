const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Database setup
const db = new sqlite3.Database('./journal.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the journal database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        filename TEXT NOT NULL
    )`);
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Route to save journal entry
app.post('/save', (req, res) => {
    const { date, content } = req.body;
    if (!date || !content) {
        return res.status(400).send('Date and content are required');
    }

    const filename = `entry-${date}.md`;
    const filepath = path.join(__dirname, 'entries', filename);

    // Save Markdown content to a file
    fs.writeFile(filepath, content, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to save the entry');
        }

        // Check if entry already exists
        db.get('SELECT * FROM entries WHERE date = ?', date, (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Failed to query the database');
            }

            if (row) {
                // If entry exists, update it
                db.run('UPDATE entries SET filename = ? WHERE date = ?', [filename, date], function(err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Failed to update the entry in the database');
                    }
                    res.send({ id: row.id });
                });
            } else {
                // If entry does not exist, insert it
                db.run('INSERT INTO entries (date, filename) VALUES (?, ?)', [date, filename], function(err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Failed to insert the entry into the database');
                    }
                    res.send({ id: this.lastID });
                });
            }
        });
    });
});

app.get('/get-entry', (req, res) => {
    const { date } = req.query; // Retrieve the date parameter from the query string
    // Implement logic to find the journal entry by date
    // This example assumes entries are stored as files named by date
    const entriesDirectory = path.join(__dirname, 'entries');
    const filename = `entry-${date}.md`;
    const filepath = path.join(entriesDirectory, filename);

    fs.readFile(filepath, 'utf8', (err, content) => {
        if (err) {
            // If the file doesn't exist, send a response indicating no content
            // Alternatively, handle the error as appropriate for your application
            return res.status(404).json({ message: 'Entry not found' });
        }
        // Send the entry content back to the client
        res.json({ content });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

app.get('/get-dates', (req, res) => {
    const db = new sqlite3.Database('./journal.db');
    db.all('SELECT DISTINCT date FROM entries', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            // Send the dates as a JSON array
            res.json(rows.map(row => row.date));
        }
    });
});
