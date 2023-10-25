const {Portfolio} = require("../model/db");
const {asyncErrHandler} = require("../errorHandler/asyncErrHandler")
const bcrypt = require("bcrypt");


// GET ALL APPROVED USERS (Fields initially projected: "-name -username -intro -password")
module.exports.getAllUsers = asyncErrHandler(async (req,res)=>{
 const allUsers = await Portfolio.find({approved: true}, "-password");
// This is to put the index of the return users on the frontend, starting from 1
 const userIndex = allUsers.map((user, index) => (
  {...user.toObject(),
  newIndex: index + 1}));
  res.render("users", {
   info: userIndex
  })
})


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
module.exports.getAUser = asyncErrHandler(async (req,res)=>{
 const username = req.query.username
 const user = await Portfolio.findOne({username}, "-password");
if(user){
 res.render("userSearch",{
  data: user
 })
}else{
const script = "<script>alert('No user found'); window.location.href = '/users' </script>";
return res.send(script);
}
//  res.json({data: user, success: true})
})


// USER'S PROFILE  @AUTH ROUTE
module.exports.userProfile = asyncErrHandler(async (req,res)=>{
 res.render("profile",{
  data: req.user
 })
// return res.json({data: req.user, message : "This is your profile", success : true})
})


// EDIT USER PROFILE   @AUTH ROUTE
module.exports.editUser = asyncErrHandler(async (req,res)=>{
const { firstName, lastName, otherName, phone, website, links, aboutMe, workExperience, otherExperience, educationAndTraining, professionalOrganization, skills, projects, referees } = req.body;
if(firstName) req.user.firstName = firstName;
if(lastName) req.user.lastName = lastName;
if(otherName) req.user.otherName = otherName;
if(phone) req.user.phone = phone;
if(aboutMe) req.user.aboutMe = aboutMe;
if(website) req.user.website = website;

if(links) {
const existingLinks = req.user.links || [];
req.user.links = [...existingLinks, ...links]
};

if (workExperience) {
const existingWorkExp = req.user.workExperience || []; 
req.user.workExperience = [...existingWorkExp, ...workExperience];
}

if(otherExperience) {
const existingOtherExp = req.user.otherExperience || [];
req.user.otherExperience = [...existingOtherExp, ...otherExperience]
};

if(educationAndTraining) {
const existingEduAndTrain = req.user.educationAndTraining || [];
req.user.educationAndTraining = [...existingEduAndTrain, ...educationAndTraining]
};

if(professionalOrganization) {
const existingProfOrg = req.user.professionalOrganization || [];
req.user.professionalOrganization = [...existingProfOrg, ...professionalOrganization]
};

if(skills) {
const existingSkills = req.user.skills || [];
const newSkills = skills.split(", ").map(skill => skill.trim( ));
req.user.skills = [...existingSkills, ...newSkills]
};

if(projects) {
const existingProjects = req.user.projects || [];
req.user.projects = [...existingProjects, ...projects]
};

if(referees) {
const existingReferees = req.user.referees || [];
req.user.referees = [...existingReferees, ...referees]
};

const updatedUser = await req.user.save();
if (updatedUser) {
const script = "<script>alert('Update successful!'); window.location.href = '/users/profile' </script>";
return res.send(script);
}
// res.redirect("/users/profile")
// return res.json({data: updatedUser, message: "Update successful", success: true });
})


// CHANGE PASSWORD   @AUTH ROUTE
module.exports.changePassword = asyncErrHandler(async (req,res)=>{
if(req.body.password.length < 6) {
const script = "<script>alert('Password must be greater than 5 characters'); window.location.href = '/users/settings' </script>";
return res.send(script);
}
// return res.status(401).json({message: "Password must be greater than 6", success: false})
const hashedPassword = await bcrypt.hash (req.body.password, 4);
const update = await Portfolio.updateOne ({_id: req.user._id}, {password: hashedPassword, lastChangedPassword: Date.now()})
if (update) {
const script = "<script>alert('Password Changed Successfully. Please, Login to Continue'); window.location.href = '/auth/login' </script>";
return res.send(script);
}
// return res.status(200).json({message: "Password successfully updated", success: true})
})

