const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: "ls-e2d2e2d3495e0772140c48aadcc488664dc04d58.c5muoc260y9j.ap-south-1.rds.amazonaws.com",
  user: "dbmasteruser",
  password: "#TdxAHpji?00u1Tp~8EM7C$UCNH1(apN",
  database: "PartnerPortal",
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ', err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + connection.threadId);
});

app.get("/", (req, res) => {
  res.send('Welcome to my server.');
});

// Authentication Route
app.post('/gcs_authenticate', (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM gcs_users WHERE email = ? AND password = ?`;
  const values = [email, password];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error("Error authenticating user:", error);
      res.status(500).json({ success: false, message: "Server error" });
    } else {
      if (results.length > 0) {
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, message: "Authentication failed" });
      }
    }
  });
});

// Assuming you have already defined 'app' and 'connection' somewhere in your code.

app.get('/gcs_users', (req, res) => {
  const query = `SELECT * FROM gcs_users`;

  connection.query(query, (error, results) => {
      if (error) {
          console.error("Error:", error);
          res.status(500).json({ error: 'Internal server error' });
      } else {
          console.log("Query:", query);
          res.status(200).json(results); // Assuming you want to send the results back to the client
      }
  });
});


// Registration Route
app.post('/gcs_register', (req, res) => {
  const { email, password, firstname, lastname, phonenumber, companyname, address, city, state } = req.body;

  // Check if email already exists
  const checkQuery = `SELECT * FROM gcs_users WHERE email = ?`;
  connection.query(checkQuery, [email], (error, results) => {
    if (error) {
      console.error("Error checking existing user:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    } else {
      if (results.length > 0) {
        return res.status(400).json({ success: false, message: "Email already registered" });
      } else {
        // Insert new user
        const insertQuery = `INSERT INTO gcs_users (email, password, firstname, lastname, phonenumber, companyname, address, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const insertValues = [email, password, firstname, lastname, phonenumber, companyname, address, city, state];
        connection.query(insertQuery, insertValues, (error, results) => {
          if (error) {
            console.error("Error registering user:", error);
            return res.status(500).json({ success: false, message: "Server error" });
          } else {
            return res.json({ success: true, message: "Registration successful" });
          }
        });
      }
    }
  });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


