const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});
const getAllTable = (req, res) => {
  pool.query("SELECT * FROM production ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/production", getAllTable);
const port = 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
