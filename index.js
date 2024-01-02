const express = require("express");
const app = express();
const { Portfolio } = require("./model/db");
const { connection } = require("./model/db");
const portfolioRouter = require("./router/portfolio");
const authRouter = require("./router/auth");
const adminRouter = require("./router/admin");
const bcrypt = require("bcrypt");
const multer = require("multer");
const dotenv = require("dotenv");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const cors = require("cors");

const hbs = require("hbs");
const path = require("path");
const { asyncErrHandler } = require("./errorHandler/asyncErrHandler");
const templatesPath = path.join(__dirname, "./templates");

const nodemailer = require("nodemailer");
const userOTPVerification = require("./model/userOTPVerf");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.static("public"));
// app.use(express.static("images"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", templatesPath);
app.use(cookieParser()); // This middleware is used before routes

app.use("/users", portfolioRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);

// This app.use allow you to input your url in the FrontEnd
app.use("/", authRouter);

// HOMEPAGE ROUTE
app.get("/home", (req, res) => {
  res.render("home");
});

const PORT = process.env.PORT || 4555;
const start = async () => {
  try {
    await connection();
    app.listen(PORT, console.log("Server is running on 4555"));
  } catch (error) {
    console.error(error.message);
  }
};
start();
