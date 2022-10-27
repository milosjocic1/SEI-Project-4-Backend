const express = require('express');

require("dotenv").config();

const flash = require("connect-flash");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


const mongoose = require("mongoose");

const PORT = process.env.PORT

const app = express();

app.use(flash());

app.use(express.static("public"));

const expressLayouts = require("express-ejs-layouts");

// Import routes here
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const productRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const reviewRouter = require("./routes/reviews");
// const transactionRouter = require("./routes/transactions")

app.use(expressLayouts);

let session = require("express-session");
let passport = require("./helper/ppConfig");

app.use(session({
  // secret used for authenticating our user
  secret: process.env.SECRET,
  saveUninitialized: true,
  resave: false,
  cookie: {maxAge: 360000000}
}))

// Initialise passport and passport session
app.use(passport.initialize());
app.use(passport.session());

// Sharing the user information with all pages
app.use(function(req, res, next){
  res.locals.currentUser = req.user
  next();
})

// app.get("/", function(req, res) {
//     res.send("Hello");
// });

// Mount routes here
app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/", usersRouter);
app.use("/", productRouter);
app.use("/", cartRouter);
app.use("/", reviewRouter);
// app.use("/", transactionRouter);

app.set("view engine", "ejs");

// Cloudinary test - can remove and put in other files later
const { cloudinary } = require('./utils/cloudinary');
const cors = require("cors");
const { User } = require('./models/User');
const { Product } = require('./models/Product');

// const bodyParser = require('body-parser')

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
// replace bodyParser with express
app.use(cors());

app.get('/api/images', async (req, res) => {
  const {resources} = await cloudinary.search.expression('folder:bnjbdd6e')
  .sort_by('public_id', 'desc')
  .max_results(30)
  .execute();
  const publicIds = resources.map( file => file.public_id);
  res.send('publicIds')
})
app.post('/api/upload', async (req, res) => {
    try {
      const fileStr = req.body.data;
      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: 'agora_images'
      })
      console.log(uploadedResponse.url)
      User.findById(req.query.userId)
      .then((user) => {
        user.cloudinary_url = uploadedResponse.url
        user.save()
        res.json({msg: "Wooo"})
      }
      )
      .catch(error => {
        console.log(error)
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({err: "not working"}) 
    }
  })

  // ATTEMPT API TO GET PRODUCT IMAGES
  // app.post("/api/uploadProduct", async (req, res) => {
  //   try {
  //     const fileStr = req.body.data;
  //     const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
  //       upload_preset: "agora_images",
  //     });
  //     console.log(uploadedResponse.url);
  //     Product.findById(req.query.productId)
  //       .then((product) => {
  //         product.cloudinary_url = uploadedResponse.url;
  //         product.save();
  //         res.json({ msg: "yay" });
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ err: "not working" });
  //   }
  // });
  app.post("/api/uploadProduct", async (req, res) => {
    try {
      const fileStr = req.body.data;
      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: "agora_images",
      });
      console.log(uploadedResponse.url);
      Product.findById(req.query.productId)
        .then((product) => {
          product.cloudinary_url = uploadedResponse.url;
          product.save();
          res.json({ msg: "yay" });
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ err: "not working" });
    }
  });

  app.post("/stripe/charge", cors(), async (req, res) => {
    console.log("stripe-routes.js 9 | route reached", req.body);
    let { amount, id } = req.body;
    console.log("stripe-routes.js 10 | amount and id", amount, id);
    try {
      const payment = await stripe.paymentIntents.create({
        amount: amount,
        currency: "GBP",
        description: "Agora",
        payment_method: id,
        confirm: true,
      });
      console.log("stripe-routes.js 19 | payment", payment);
      res.json({
        message: "Payment Successful",
        success: true,
      });
    } catch (error) {
      console.log("stripe-routes.js 17 | error", error);
      res.json({
        message: "Payment Failed",
        success: false,
      });
    }
  });


app.listen(PORT, () => {
  console.log(PORT)
    console.log(`Agora is running on port ${PORT}`);
  });


// Database Connection
mongoose.connect(process.env.DATABASE_URL,
  { useNewURLParser: true, useUnifiedTopology: true},
  () => {
      console.log('MongoDB connected!')
  }
);

