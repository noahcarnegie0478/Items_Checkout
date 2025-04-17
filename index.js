const express = require("express");
const app = express();
var cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

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
const getItemByID = (req, res) => {
  const { cart } = req.body;
  console.log(cart);

  pool.query(
    "select * from production where id =  ANY($1::int[])",
    [cart],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
};
const updateCart = (req, res) => {
  console.log(req);
  const { cart } = req.body;
  console.log(cart);
  const id = Math.floor(Math.random() * 100);
  pool.query(
    "insert into cart(id,production_id) values ($1, $2)",
    [id, cart],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
};
const getAllCart = (req, res) => {
  pool.query("SELECT * FROM cart ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/cart", getAllCart);
app.post("/cart", updateCart);
//
app.post("/cardID", getItemByID);
//
app.get("/production", getAllTable);
//

app.listen(3000, () => {
  console.log(`Server listening on port 3000`);
});
