const express = require("express");
const app = express();
const {Portfolio} = require("./model/db");
const portfolioRouter = require("./router/portfolio");
const authRouter = require("./router/auth");
const adminRouter = require("./router/admin")
const bcrypt = require ("bcrypt");
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser");
const cors = require("cors");

const hbs = require ("hbs");
const path = require ("path");
const templatesPath = path.join(__dirname, "./templates")

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.set("view engine", "hbs");
app.set("views", templatesPath);
app.use(cookieParser()); // This middleware is used before routes

app.use("/users", portfolioRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRouter);

// This app.use allow you to input your url in the FrontEnd
app.use("/", authRouter);

// HOMEPAGE ROUTE
app.get("/home", (req,res)=>{
res.render("home")
})


const PORT = process.env.PORT || 4555
app.listen(PORT, console.log("Server is running on 4555"))