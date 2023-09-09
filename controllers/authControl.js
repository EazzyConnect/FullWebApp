const {Portfolio} = require("../model/db");
const {asyncErrHandler} = require("../errorHandler/asyncErrHandler");
const bcrypt = require ("bcrypt");
const jwt = require ("jsonwebtoken");
require("dotenv").config();


// SIGNUP ROUTE
module.exports.signUp = asyncErrHandler(async (req,res)=>{
 const {password, email, username, firstName, lastName} = req.body;
 const checkExistingUser = await Portfolio.findOne({username});
 if(checkExistingUser){
  const script = "<script>alert('Username already exist.'); window.location.href = '/auth/signup' </script>";
 return res.send(script);
 }
 const checkExistingEmail = await Portfolio.findOne({email});
 if(checkExistingEmail){
  const script = "<script>alert('Email already exist.'); window.location.href = '/auth/signup' </script>";
 return res.send(script);
 }
 if(!firstName || !lastName || !email || !username || !password){
 const script = "<script>alert('Registration failed. Fill up all information'); window.location.href = '/signup' </script>";
 return res.send(script);
}
 if(password.length < 6) {
 const script = "<script>alert('Password length must be more than 5 characters'); window.location.href = '/auth/signup' </script>";
 return res.send(script);
 }
 const hashedPassword = await bcrypt.hash(password, 4);
 const newUser = await Portfolio.create({ firstName, lastName, email, username, password: hashedPassword});
 if (newUser) {
 const script = "<script>alert('Registration Successful, Please Login To Continue'); window.location.href = '/login' </script>";
 return res.send(script);
 }else {
 const script = "<script>alert('Registration failed'); window.location.href = '/signup' </script>";
 return res.send(script);
}
})


module.exports.login = asyncErrHandler(async(req,res)=>{
 const {username,password} = req.body;
 const user = await Portfolio.findOne({username});
 if(!user) {
  const script = "<script>alert('User not found'); window.location.href = '/auth/login' </script>";
  return res.send(script);
 }
 // return res.json({data: null, message:"User not found", success: false});
 const check = await bcrypt.compare(password, user.password);
 if(!check) {
  const script = "<script>alert('Authentication error'); window.location.href = '/auth/login' </script>";
  return res.send(script);
 }
 // return res.json({data: null, message: "Authentication error", success: false});
 const token = jwt.sign({_id : user._id}, process.env.SecretKey);
 res.cookie("authorization", token);
 res.redirect("/users/profile")
// res.render("profile")
// return res.json({data: user, message: "Welcome, login successful", success: true})
})


// LOG-OUT
module.exports.logout = asyncErrHandler(async (_, res)=>{
 res.cookie("authorization", "", {maxAge : 1})
 return res.json({message: "You have successfully logged out", success: true})
})


// ADMIN LOGIN
module.exports.AdminLogin = asyncErrHandler(async(req,res)=>{
 const {username,password} = req.body;
 const user = await Portfolio.findOne({username, role: "admin"});
 if (!user) {
const script = "<script>alert('You are not an Admin. Authorization denied!'); window.location.href = '/login' </script>";
return res.send(script);
}
 // if(!user) return res.json({data: null, message:"User not found", success: false});
 const check = await bcrypt.compare(password, user.password);
 if(!check) {
 const script = "<script>alert('Authentication error'); window.location.href = '/auth/admin/login' </script>";
  return res.send(script);
 }
 // return res.json({data: null, message: "Authentication error", success: false});
 const token = jwt.sign({_id : user._id}, process.env.SecretKey);
res.cookie("authorization", token);
res.redirect("/admin/users")
})


// ADMIN'S PROFILE  @AUTH ROUTE
module.exports.adminProfile = asyncErrHandler(async (req,res)=>{
 res.render("adminPage",{
  data: req.user
 })
})