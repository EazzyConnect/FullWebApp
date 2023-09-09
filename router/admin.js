const express = require("express");
const router = express.Router();
const {Portfolio} = require("../model/db");
const { unapprovedUsers, updateUser, adminUpdatePage } = require("../controllers/adminControl");
const {checkAdmin} = require("../middleware/midAuth");


router.use(express.json());


//UNAPPROVED USERS 
router.get("/users/unapproved", checkAdmin, unapprovedUsers);

// UPDATE USERS

// router.get("/users/update/:username", checkAdmin, (req,res)=>{
//  const username = req.params.username;
//  res.render("adminUpdate")
// });

router.get("/users/update", checkAdmin, adminUpdatePage)
router.post("/users/update", checkAdmin, updateUser);


module.exports = router;