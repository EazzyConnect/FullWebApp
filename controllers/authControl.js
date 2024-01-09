const { Portfolio } = require("../model/db");
const { asyncErrHandler } = require("../errorHandler/asyncErrHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { text } = require("express");
require("dotenv").config();

const nodemailer = require("nodemailer");
const userOTPVerification = require("../model/userOTPVerf");

// Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

// SIGNUP ROUTE
module.exports.signUp = asyncErrHandler(async (req, res) => {
  const {
    password,
    email,
    username,
    firstName,
    lastName,
    phoneNumber,
    confirmPassword,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !username ||
    !password ||
    !phoneNumber ||
    !confirmPassword
  ) {
    const script =
      "<script>alert('Registration failed. Fill up all information and AVOID SPACES in between your text.'); window.location.href = '/signup' </script>";
    return res.send(script);
  }
  const capitalizeFirstName = sentenceCase(firstName);
  const capitalizeLastName = sentenceCase(lastName);
  const trimEmail = trimSpaces(email);
  const trimUsername = trimSpaces(username);
  const trimPhoneNumber = trimSpaces(phoneNumber);

  const checkExistingUser = await Portfolio.findOne({ username: trimUsername });
  if (checkExistingUser) {
    const script =
      "<script>alert('Username already exist.'); window.location.href = '/auth/signup' </script>";
    return res.send(script);
  }
  const checkExistingEmail = await Portfolio.findOne({ email: trimEmail });
  if (checkExistingEmail) {
    const script =
      "<script>alert('Email already exist.'); window.location.href = '/auth/signup' </script>";
    return res.send(script);
  }
  const checkExistingPhone = await Portfolio.findOne({
    phoneNumber: trimPhoneNumber,
  });
  if (checkExistingPhone) {
    const script =
      "<script>alert('Phone already exist.'); window.location.href = '/auth/signup' </script>";
    return res.send(script);
  }
  if (password.length < 6) {
    const script =
      "<script>alert('Password length must be more than 5 characters'); window.location.href = '/auth/signup' </script>";
    return res.send(script);
  }
  if (confirmPassword !== password) {
    const script =
      "<script>alert('Password does not match.'); window.location.href = '/auth/signup' </script>";
    return res.send(script);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await Portfolio.create({
    firstName: capitalizeFirstName,
    lastName: capitalizeLastName,
    email: trimEmail,
    username: trimUsername,
    phoneNumber: trimPhoneNumber,
    password: hashedPassword,
  });
  if (newUser) {
    await sendOTPEmail(newUser, res);
    return;
    // const script =
    //   "<script>alert('Registration Successful, Please Login To Continue'); window.location.href = '/login' </script>";
    // return res.send(script);
  } else {
    const script =
      "<script>alert('Registration failed'); window.location.href = '/signup' </script>";
    return res.send(script);
  }
});

// Convert to Sentence case function
const sentenceCase = (word) => {
  const input = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  const output = input.trim().replace(/ /g, "");
  return output;
};

// Trim out white spaces function
const trimSpaces = (word) => {
  return word.trim().replace(/ /g, "");
};

// Send OTP function
const sendOTPEmail = async (user, res) => {
  const { _id, email } = user;
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p> Enter this <b>${otp}</b> to verify your email address and complete signing up.
      <br>
      <b>NOTE: This OTP expires in one (1) hour.</b>`,
    };
    const hashedOTP = await bcrypt.hash(otp, 10);
    const newOTPVerification = await new userOTPVerification({
      userId: _id,
      email,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);
    console.log("Email sent!");

    const script =
      "<script>alert('OTP has been sent to your email for verification. Check your email inbox or spam.'); window.location.href = '/auth/login/verifyEmail' </script>";
    return res.send(script);
    // res.json({
    //   status: "PENDING",
    //   message: "Verification OTP email sent",
    //   data: {
    //     userId: _id,
    //     email,
    //   },
    // });
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

// Verify OTP
module.exports.verifyOTP = asyncErrHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      const script =
        "<script> alert('Please provide user OTP details.'); window.location.href='/auth/login/verifyEmail' </script>";
      return res.send(script);
    } else {
      const userOTPVerifyRecords = await userOTPVerification.findOne({
        email,
      });
      if (!userOTPVerifyRecords) {
        const script =
          "<script> alert('No record found, please sign up or login or request new OTP code.'); window.location.href='/auth/login/verifyEmail' </script>";
        return res.send(script);
      } else {
        //OTP record exists
        const { expiresAt, otp: hashedOTP } = userOTPVerifyRecords;
        if (expiresAt < Date.now()) {
          await userOTPVerification.deleteMany({ email });
          // throw new Error("OTP code has expired, please request again.");
          const script =
            "<script> alert('OTP code has expired, please request again.'); window.location.href='/auth/login/verifyEmail' </script>";
          return res.send(script);
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          if (!validOTP) {
            const script =
              "<script> alert('Invalid code provided. Please check your inbox and make sure you provide the correct OTP code sent.'); window.location.href='/auth/login/verifyEmail' </script>";
            return res.send(script);
          } else {
            // Success
            await Portfolio.updateOne({ email }, { $set: { approved: true } });
            await userOTPVerification.deleteMany({ email });
            // res.json({
            //   status: "VERIFIED",
            //   message: "User email verified successfully.",
            // });
            const script =
              "<script> alert('User email verified successfully. Login to continue'); window.location.href='/auth/login' </script>";
            return res.send(script);
          }
        }
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
});

// RESENDING OTP
module.exports.resendOTP = asyncErrHandler(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      const script =
        "<script> alert('Please provide your email.'); window.location.href='/auth/login/resendOTP' </script>";
      return res.send(script);
    } else {
      const checkEmail = await Portfolio.findOne({ email });
      if (!checkEmail) {
        const script =
          "<script> alert('No record found.'); window.location.href='/auth/login/resendOTP' </script>";
        return res.send(script);
      } else {
        await userOTPVerification.deleteMany({ email });
        sendOTPEmail({ email }, res);
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
});

// LOGIN
module.exports.login = asyncErrHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const script =
      "<script> alert ('Please provide username and password to login.'); window.location.href= '/auth/login' </script>";
    return res.send(script);
  }
  const user = await Portfolio.findOne({ username });
  if (!user) {
    const script =
      "<script>alert('User not found'); window.location.href = '/auth/login' </script>";
    return res.send(script);
  }
  const check = await bcrypt.compare(password, user.password);
  if (!check) {
    const script =
      "<script>alert('Invalid credentials provided.'); window.location.href = '/auth/login' </script>";
    return res.send(script);
  }
  const approvedUser = user.approved === false;
  if (approvedUser) {
    const script =
      "<script> alert('Please verify your email.'); window.location.href = '/auth/login/verifyEmail' </script>";
    return res.send(script);
  }
  const token = jwt.sign({ _id: user._id }, process.env.SecretKey);
  res.cookie("authorization", token);
  res.redirect("/users/profile");
  // res.render("profile")
  // return res.json({data: user, message: "Welcome, login successful", success: true})
});

// LOG-OUT
module.exports.logout = asyncErrHandler(async (_, res) => {
  res.cookie("authorization", "", { maxAge: 1 });
  return res.json({
    message: "You have successfully logged out",
    success: true,
  });
});

// ADMIN LOGIN
module.exports.AdminLogin = asyncErrHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await Portfolio.findOne({ username, role: "admin" });
  if (!user) {
    const script =
      "<script>alert('You are not an Admin. Authorization denied!'); window.location.href = '/login' </script>";
    return res.send(script);
  }
  // if(!user) return res.json({data: null, message:"User not found", success: false});
  const check = await bcrypt.compare(password, user.password);
  if (!check) {
    const script =
      "<script>alert('Authentication error'); window.location.href = '/auth/admin/login' </script>";
    return res.send(script);
  }
  // return res.json({data: null, message: "Authentication error", success: false});
  const token = jwt.sign({ _id: user._id }, process.env.SecretKey);
  res.cookie("authorization", token);
  res.redirect("/admin/users");
});

// ADMIN'S PROFILE  @AUTH ROUTE
module.exports.adminProfile = asyncErrHandler(async (req, res) => {
  res.render("adminPage", {
    data: req.user,
  });
});
