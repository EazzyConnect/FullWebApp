const {Portfolio, roleEnum} = require("../model/db");
const {asyncErrHandler} = require("../errorHandler/asyncErrHandler")
const bcrypt = require("bcrypt");

// ADMIN UPDATE USER PAGE
module.exports.adminUpdatePage = asyncErrHandler(async (req,res)=>{
const allUsers = await Portfolio.find({}, "username");
res.render("adminUpdate", {
  data: allUsers
})
});


// ADMIN ROLE: UPDATE USERS
module.exports.updateUser = asyncErrHandler(async (req,res)=>{
const {username, role, approved} = req.body
  // const username = req.params.username;
const findUser = await Portfolio.findOne({username})
if(!findUser){
const script = "<script>alert('No user found'); window.location.href = '/admin/users' </script>";
return res.send(script)};
// return res.json({data: null, message: "No user found", success: false})
// const{ role, approved } = req.body;
 if (role) {
findUser.role = role;
}
if (approved) {
findUser.approved = approved;
}
const updatedUser = await findUser.save();
const script = "<script>alert('Update Successful.'); window.location.href = '/admin/users' </script>";
return res.send(script);
// return res.json({data: updatedUser, message: "Update successful", success: true });
})


// ADMIN ROLE: UNAPPROVED USERS (Initial projection -username -name -intro)
module.exports.unapprovedUsers = asyncErrHandler(async (req,res)=>{
const allUsers = await Portfolio.find({approved: false}, "-name -intro", );
const userIndex = allUsers.map((user, index) => (
  {...user.toObject(),
  newIndex: index + 1}));
  res.render("unapproved", {
   info: userIndex
  })
// res.json({data: allUsers, success: true})
})