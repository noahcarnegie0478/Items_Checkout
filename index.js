const express = require("express");
const app = express();

var cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

//STRIPE SET UP
const stripe = require("stripe")(process.env.STRIPE_SECRETKEY);

////////////////////////////////////////

//implement webhook into code
//download stripe
//listen to event and print
//create database ordered and store
//clear table cart.
//send email to customer
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
///test receive item
app.post("/create-checkout", async (req, res) => {
  const item = JSON.parse(req.body.item);
  // const { item } = req.body;
  console.log(item);
});
///////////////////////////////////

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { item } = req.body;
    console.log(
      item.map(itm => ({
        price_data: {
          currency: "aud",
          unit_amount: itm.price,
          product_data: {
            name: itm.name,

            images: [itm.image],
          },
        },
        quantity: 1,
      }))
    );
    const session = await stripe.checkout.sessions.create({
      line_items: item.map(itm => ({
        price_data: {
          currency: "aud",
          unit_amount: itm.price,
          product_data: {
            name: itm.name,

            images: [itm.image],
          },
        },
        quantity: 1,
      })),
      mode: "payment",
      success_url: `${process.env.SUCCESS}?success=true`,
      cancel_url: `${process.env.CANCLE}?canceled=true`,
    });
    console.log(session);
    res.json({ url: session.url, id: session.id });
  } catch (error) {}
});
//////////////////////////////////

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

// const session = await stripe.checkout.sessions.create({
//   line_items: [
//     {
//
//       price_data: {
//         currency: "usd",
//         unit_amount: 2000,
//         product_data: {
//           name: "T-shirt",
//           description: "Comfortable cotton t-shirt",
//           images: ["https://example.com/t-shirt.png"],
//         },
//       },
//       quantity: 1,
//     },
//   ],
//   mode: "payment",
//   success_url: "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
//   cancel_url: "https://example.com/cancel",
// });
