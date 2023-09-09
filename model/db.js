const mongoose = require("mongoose");
require("dotenv").config()


const roleEnum = ["admin","user"];

const portfolioSchema = new mongoose.Schema({
 firstName : {type: String, required: true},
 lastName : {type: String, required: true},
 email : {type: String, required: true, unique: true},
 username : {type: String, required: true, unique: true},
 password : {type: String, required: true, minLength: 6},
 createdOn : {type: Date, default: Date.now},
 intro : {type: String, maxLength: 100},
 about : {type: String, maxLength: 1000},
 tools : [{type: String}],
 howManyMonthsProgramming : {type: Number},
 favoriteMealInTechquestProgram : {type: String},
 favoriteQuote : {type: String},
 role : {type: String, enum: roleEnum, default: "user"},
 lastChangedPassword: {type: Date, default: Date.now},
 approved : {type: Boolean, default: false}
});


const Portfolio = new mongoose.model ("portfolio", portfolioSchema);


mongoose.connect(process.env.MongoDbUrl)
.then(() => console.log("portfolio database is running"));

module.exports = {Portfolio, roleEnum}