const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const port = process.env.PORT || 5500;


const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: "bq1ybtfrigsgxpgzr5ke-mysql.services.clever-cloud.com",
  user: "u5maq9am8q46zwtw",
  password: "w97U0WXoBau4QgaVOur8", 
  database: "bq1ybtfrigsgxpgzr5ke",
  port:3306 
});
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database.");
});

// Endpoint 
app.get("/generateid/:department", (req, res) => {
  const department = req.params.department;
  if (!department) {
    return res.status(400).json({ error: "Department is required." });
  }
  const query = `SELECT employeeID FROM employees WHERE department = ? ORDER BY id DESC LIMIT 1`;
  db.query(query, [department], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json({ error: "Database query error." });
    }

    let newEmployeeID;
    if (results.length > 0) {
      const lastID = results[0].employeeID;
      const numericPart = parseInt(lastID.replace(/\D/g, ""), 10); 
      const inc = numericPart + 1;
      newEmployeeID = `${department.substring(0, 2).toUpperCase()}${String(inc).padStart(3, "0")}`;
    } else {
      newEmployeeID = `${department.substring(0, 2).toUpperCase()}001`;
    }

    res.status(200).json({ employeeID: newEmployeeID });
  });
});

// Endpoint 
app.post("/add-employee", (req, res) => {
  const { firstName, middleName, lastName, email, phone, department, role, dateOfJoining, employeeID } = req.body;
  if (!firstName || !lastName || !email || !phone || !department || !role || !dateOfJoining || !employeeID) {
    return res.status(400).json({ error: "All fields are required." });
  }
  const dup = `SELECT * FROM employees WHERE email = ? OR employeeID = ?`;
  db.query(dup, [email, employeeID], (err, results) => {
    if (err) {
      console.error("Error checking for duplicates:", err);
      return res.status(500).json({ error: "Database query error." });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Email or Employee ID already exists." });
    }
    const insertQuery = `INSERT INTO employees (firstName, middleName, lastName, email, phone, department, role, dateOfJoining, employeeID) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(
      insertQuery,
      [firstName, middleName, lastName, email, phone, department, role, dateOfJoining, employeeID],
      (err, result) => {
        if (err) {
          console.error("Error inserting employee into the database:", err);
          return res.status(500).json({ error: "Database insert error." });
        }

        res.status(201).json({ message: "Employee added successfully." });
      }
    );
  });
});
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
