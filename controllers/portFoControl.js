const { Portfolio } = require("../model/db");
const { asyncErrHandler } = require("../errorHandler/asyncErrHandler");
const bcrypt = require("bcrypt");

// GET ALL APPROVED USERS

module.exports.getAllUsers = asyncErrHandler(async (req, res) => {
  const allUsers = await Portfolio.find({ approved: true }, "-password");
  // This is to put the index of the return users on the frontend, starting from 1
  const userIndex = allUsers.map((user, index) => ({
    ...user.toObject(),
    newIndex: index + 1,
  }));
  res.render("users", {
    data: userIndex,
  });
});

// GET ALL APPROVED USERS (Fields initially projected: "-name -username -intro -password")

// module.exports.getAllUsers = asyncErrHandler(async (req,res)=>{
//  const allUsers = await Portfolio.find({approved: true}, "-intro -password");
//  res.render("users", {
//   info: allUsers
//  })
// res.json({info: allUsers, success: true})
// })

// GET ALL USERS

// module.exports.getAllUsers = asyncErrHandler(async (req,res)=>{
//  const allUser = await Portfolio.find({}, "-name -username -intro -password -lastChangedPassword" );
//  res.json({data: allUser, success: true})
// })

// GET A USER
module.exports.getAUser = asyncErrHandler(async (req, res) => {
  const username = req.query.username;
  const user = await Portfolio.findOne({ username }, "-password");
  if (user) {
    res.render("userSearch", {
      data: user,
    });
  } else {
    const script =
      "<script>alert('No user found'); window.location.href = '/users' </script>";
    return res.send(script);
  }
  //  res.json({data: user, success: true})
});

// USER'S PROFILE  @AUTH ROUTE
module.exports.userProfile = asyncErrHandler(async (req, res) => {
  res.render("profile", {
    data: req.user,
  });
});

// EDIT USER PROFILE   @AUTH ROUTE
module.exports.editUser = asyncErrHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    otherName,
    address,
    phoneNumber,
    website,
    links,
    aboutMe,
    formType,
    workExperience,
    otherExperience,
    educationAndTraining,
    professionalOrganization,
    skills,
    projects,
    referees,
  } = req.body;
  if (firstName) req.user.firstName = firstName;
  if (lastName) req.user.lastName = lastName;
  if (otherName) req.user.otherName = otherName;
  if (address) req.user.address = address;
  if (phoneNumber) req.user.phoneNumber = phoneNumber;
  if (aboutMe) req.user.aboutMe = aboutMe;
  if (website) req.user.website = website;

  if (links) {
    const existingLinks = req.user.links || [];
    req.user.links = [...existingLinks, ...links];
  }

  if (req.body.workExperience) {
    const existingWorkExp = req.user.workExperience || [];
    req.user.workExperience = [...existingWorkExp, req.body.workExperience];
  }

  if (req.body.educationAndTraining) {
    const existingEduAndTrain = req.user.educationAndTraining || [];
    req.user.educationAndTraining = [
      ...existingEduAndTrain,
      req.body.educationAndTraining,
    ];
  }

  if (req.body.professionalOrganization) {
    const existingProfOrg = req.user.professionalOrganization || [];
    req.user.professionalOrganization = [
      ...existingProfOrg,
      req.body.professionalOrganization,
    ];
  }

  if (req.body.otherExperience) {
    const existingOtherExp = req.user.otherExperience || [];
    req.user.otherExperience = [...existingOtherExp, req.body.otherExperience];
  }

  if (skills) {
    const existingSkills = req.user.skills || [];
    const newSkills = skills.split(", ").map((skill) => skill.trim());
    req.user.skills = [...existingSkills, ...newSkills];
  }

  if (req.body.projects) {
    const existingProjects = req.user.projects || [];
    req.user.projects = [...existingProjects, req.body.projects];
  }

  if (req.body.referees) {
    const existingReferees = req.user.referees || [];
    req.user.referees = [...existingReferees, req.body.referees];
  }

  const updatedUser = await req.user.save();
  if (updatedUser) {
    const script =
      "<script>alert('Update successful!'); window.location.href = '/users/profile/edit' </script>";
    return res.send(script);
  }
  // res.redirect("/users/profile")
  // return res.json({data: updatedUser, message: "Update successful", success: true });
});

// CHANGE PASSWORD   @AUTH ROUTE
module.exports.changePassword = asyncErrHandler(async (req, res) => {
  if (req.body.password.length < 6) {
    const script =
      "<script>alert('Password must be greater than 5 characters'); window.location.href = '/users/settings' </script>";
    return res.send(script);
  }
  // return res.status(401).json({message: "Password must be greater than 6", success: false})
  const hashedPassword = await bcrypt.hash(req.body.password, 4);
  const update = await Portfolio.updateOne(
    { _id: req.user._id },
    { password: hashedPassword, lastChangedPassword: Date.now() }
  );
  if (update) {
    const script =
      "<script>alert('Password Changed Successfully. Please, Login to Continue'); window.location.href = '/auth/login' </script>";
    return res.send(script);
  }
  // return res.status(200).json({message: "Password successfully updated", success: true})
});

// DELETE TASK
module.exports.deleteTask = asyncErrHandler(async (req, res) => {
  const { type, index } = req.body;
  try {
    if (
      ![
        "links",
        "workExperience",
        "otherExperience",
        "educationAndTraining",
        "professionalOrganization",
        "skills",
        "projects",
        "referees",
      ].includes(type)
    ) {
      return res.status(400).json({ error: "Invalid type" });
    }
    const user = await Portfolio.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (index < 0 || index >= user[type].length) {
      return res.status(400).json({ error: "Invalid index" });
    }
    user[type].splice(index, 1);
    await user.save();

    res.json({ success: true, message: "Delete successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE AN ITEM

module.exports.updateItem = asyncErrHandler(async (req, res) => {
  try {
    const { type, index, newData } = req.body;

    // if (!type || !index || !newData) {
    //   return res
    //     .status(400)
    //     .json({ error: "Type, index, and newData are required" });
    // }

    const allowedTypes = [
      "links",
      "workExperience",
      "otherExperience",
      "educationAndTraining",
      "professionalOrganization",
      "skills",
      "projects",
      "referees",
    ];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const user = await Portfolio.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (index < 0 || index >= user[type].length) {
      return res.status(400).json({ error: "Invalid index" });
    }

    const updatedItem = await Portfolio.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { [`${type}.${index}`]: newData } },
      { new: true }
    );
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPLOAD FILE (IMAGE)
module.exports.fileUpload = asyncErrHandler(async (req, res) => {
  try {
    const image = new Portfolio({ image: req.file.buffer, ...req.body });
    await image.save();
    res.status(201).send("Image uploaded successfully.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});
