const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const ejs = require('ejs'); // Import EJS

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('views'));

app.set('view engine', 'ejs');

// Create a SQLite database and table
const db = new sqlite3.Database('data.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create a 'data' table if it doesn't exist
        db.run('CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)');
    }
});

// Define a route to render the form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Define a route to handle form submissions
app.post('/submit', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        res.status(400).send('Name and email are required.');
    } else {
        // Insert the form data into the SQLite database
        db.run('INSERT INTO data (name, email) VALUES (?, ?)', [name, email], function(err) {
            if (err) {
                console.error(err.message);
                res.status(500).send('Error saving data.');
            } else {
                console.log(`Inserted record with ID: ${this.lastID}`);
                res.send('Data submitted successfully.');
            }
        });
    }
});

// Add this route to server.js
app.get('/data', (req, res) => {
    // Retrieve all records from the 'data' table
    db.all('SELECT * FROM data', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error fetching data.');
        } else {
            res.render('data', { data: rows }); // Send data as JSON
        }
    });
});


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
