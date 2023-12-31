const express = require("express");
const multer = require("multer");
const app = express();
const router = express.Router();
const { Portfolio } = require("../model/db");
const {
  getAllUsers,
  getAUser,
  userProfile,
  changePassword,
  editUser,
  deleteTask,
  fileUpload,
  updateItem,
} = require("../controllers/portFoControl");
const { authorized } = require("../middleware/midAuth");
const bcrypt = require("bcrypt");

const hbs = require("hbs");
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const templatesPath = path.join(__dirname, "../templates");

const jsPDF = require("jspdf");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", templatesPath);

router.use(express.json());

// GET ALL USERS
router.get("/", getAllUsers);

// USER'S PROFILE
router.get("/profile", authorized, userProfile);

// CHANGE PASSWORD
router.get("/settings", authorized, (req, res) => {
  res.render("changePass");
});
router.post("/settings", authorized, changePassword);

// EDIT USER
router.get("/profile/edit", authorized, (req, res) => {
  res.render("editProfile");
});

router.post("/profile/edit", authorized, editUser);

// DOWNLOAD PAGE
router.get("/profile/download", authorized, (req, res) => {
  res.render("download", {
    data: req.user,
  });
});

// GET ONE USER
router.get("/search", getAUser);
// router.get("/:username", getAUser);

// DELETE TASK
router.post("/profile/delete", authorized, deleteTask);

// UPDATE AN ITEM
router.post("/profile/update", authorized, updateItem);

// UPLOAD FILE
router.post("/profile/upload", authorized, upload.single("image"), fileUpload);

module.exports = router;
