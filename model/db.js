const mongoose = require("mongoose");
const dotenv = require("dotenv");

require("dotenv").config();

const roleEnum = ["admin", "user"];

const portfolioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    ref: "userOTPVerified",
  },
  password: { type: String, required: true, minLength: 6 },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  otherName: { type: String },
  address: { type: String },
  email: { type: String, required: true, unique: true },
  phoneNumber: [{ type: String, required: true, unique: true }],
  website: { type: String },
  image: { type: Buffer },
  links: [{ title: { name: String, type: String, unique: true } }],
  aboutMe: { type: String, maxLength: 2000 },
  workExperience: [
    {
      date: { type: String },
      position: { type: String },
      employer: { type: String },
      location: { type: String },
      dutiesAndAchievements: [{ type: String }],
    },
  ],
  otherExperience: [
    {
      date: { type: String },
      employer: { type: String },
      position: { type: String },
      location: { type: String },
      dutiesAndAchievements: [{ type: String }],
    },
  ],
  educationAndTraining: [
    {
      date: { type: String },
      institutionAttended: { type: String },
      degree: { type: String },
      location: { type: String },
      projectAndAchievement: [{ type: String }],
    },
  ],
  professionalOrganization: [
    {
      date: { type: String },
      organization: { type: String },
      certification: { type: String },
      location: { type: String },
      website: { type: String },
    },
  ],
  skills: [{ type: String }],
  projects: [
    {
      date: { type: String },
      title: { type: String },
      details: [{ type: String }],
      link: { type: String },
    },
  ],
  referees: [
    {
      fullName: { type: String },
      phone: { type: String },
      occupation: { type: String },
    },
  ],
  role: { type: String, enum: roleEnum, default: "user" },
  lastChangedPassword: { type: Date, default: Date.now },
  createdOn: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false },
});

const Portfolio = new mongoose.model("portfolio", portfolioSchema);

const connection = async () => {
  const MongoDbUrl = process.env.MongoDbUrl;
  await mongoose
    .connect(MongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("portfolio database is running!");
    });
};

module.exports = { Portfolio, roleEnum, connection };
