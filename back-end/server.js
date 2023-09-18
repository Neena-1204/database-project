const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const ejs = require('ejs'); // Import EJS
const multer = require('multer');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('views'));

app.set('view engine', 'ejs');


const storage = multer.diskStorage({
    destination: 'public/uploads',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create a SQLite database and table
const db = new sqlite3.Database('data.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create a 'data' table if it doesn't exist
        db.run('CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, designation TEXT, phonenumber TEL, image TEXT)');
    }
});

// Define a route to render the form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Define a route to handle form submissions
app.post('/submit',upload.single('image'), (req, res) => {
    const { name, email, designation, phonenumber} = req.body;
    const image = req.file ? req.file.filename : null; 

    if (!name || !email || !designation || !phonenumber) {
        res.status(400).send('Name and email are required.');
    } else {
        // Insert the form data into the SQLite database
        db.run('INSERT INTO data (name, email, designation, phonenumber, image) VALUES (?, ?, ?, ?, ?)', [name, email,designation,phonenumber, image], function(err) {
            if (err) {
                console.error(err.message);
                res.status(500).send('Error saving data.');
            } else {
                console.log(`Inserted record with ID: ${this.lastID}`);
                // res.set('Content-Type', 'text/html'); 
                // const successMessage = '<a href="/data"> Click here to view data </a>';
                const successMessage = 'Data submitted successfully.  <a href="/data">View Data of the Employees</a>';
                res.set('Content-Type', 'text/html');
                res.send(successMessage);
                // res.redirect(303,'/data');
                      
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
            res.render('data', { data: rows });
            // res.setHeader('Content-Type', 'application/json');
            // res.send(JSON.stringify(rows));
             // Send data as JSON
        }
    });
})


// view the data
app.get('/view/:id', (req, res) => {
    console.log('Reached the /view/:id route');
    const { id } = req.params;
    
    console.log(`Requested record with ID: ${id}`);

    // Retrieve the record with the specified ID from the database
    db.get('SELECT * FROM data WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error fetching data.');
        } else {
            if (!row) {
                res.status(404).send('Record not found.');
            } else {
                // Render an HTML page to display the details of the record
                res.render('view-record', { data: row });
            }
        }
    });
});


// // edit the data
// app.get('/edit/:id', (req, res) => {
//     console.log('Reached the /edit/:id route');
//     const { id } = req.params;
//     console.log(`Editing record with ID: ${id}`);

//     // Retrieve the record with the specified ID from the database
//     db.get('SELECT * FROM data WHERE id = ?', [id], (err, row) => {
//         if (err) {
//             console.error(err.message);
//             res.status(500).send('Error fetching data.');
//         } else {
//             if (!row) {
//                 res.status(404).send('Record not found.');
//             } else {
//                 // Render an HTML form for editing the record's data
//                 res.render('edit-record', { data: row });
//             }
//         }
//     });
// });

// app.post('/update/:id', (req, res) => {
//     const { id } = req.params;
//     const { name, email } = req.body;

//     // Perform an UPDATE operation on the database to modify the record
//     db.run('UPDATE data SET name = ?, email = ? WHERE id = ?', [name, email, id], function(err) {
//         if (err) {
//             console.error(err.message);
//             res.status(500).send('Error updating data.');
//         } else {
//             console.log(`Updated record with ID: ${id}`);
//             res.redirect('/data');
//         }
//     });
// });


app.get('/delete/:id', (req, res) => {
    const { id } = req.params;

    // Perform a DELETE operation on the database to delete the record
    db.run('DELETE FROM data WHERE id = ?', [id], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error deleting data.');
        } else {
            console.log(`Deleted record with ID: ${id}`);
            res.redirect('/data');
        }
    });
});




app.use((req, res) => {
    res.status(404).send('Page not found');
});





// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
