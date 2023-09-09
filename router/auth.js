const express = require("express");
const app = express()
const router = express.Router();
const {Portfolio} = require("../model/db");
const {signUp, login, logout, AdminLogin, adminProfile} = require("../controllers/authControl");

const hbs = require ("hbs");
const path = require ("path");
const { checkAdmin } = require("../middleware/midAuth");

const templatesPath = path.join(__dirname, "../templates")

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.set("view engine", "hbs");
app.set("views", templatesPath);

router.use(express.json());


//SIGN-UP 
router.get("/signup", (req,res)=>{
res.render("signup")
})
router.post("/signup", signUp);

// LOGIN
router.get("/login", (req,res)=>{
res.render("login")
})
router.post("/login", login);

// ADMIN LOGIN
router.get("/admin/login", (req,res)=>{
res.render("adminLogin")
})

router.post("/admin/login", AdminLogin);

// ADMIN'S PROFILE
router.get("/admin/users", checkAdmin, adminProfile);

// LOG-OUT
router.get("/logout", (req,res)=>{
res.redirect("/home")
})
router.post("/logout", logout);


module.exports = router;