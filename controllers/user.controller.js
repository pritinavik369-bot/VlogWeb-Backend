// Import Statements
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import Contact from "../models/contact.model.js";
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config();

// Test API Route
export const test = (req, res) => {
  res.send("API is working");
};



//mailsending
const transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Update User
export const updateUser = async (req, res, next) => {
  console.log("updateUser working start", req.body);

  

  // Check if the user is authorized to update
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }

  const validUser = await User.findById(req.params.userId);
  console.log("Valid User:", validUser);
  if (!validUser) {
    return next(errorHandler(401, "Invalid Username or Password"));
  }

  
 
  

  // Validate Password
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters long"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }

  // Validate Username
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(errorHandler(400, "Username must be between 7 and 20 characters"));
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot have spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(errorHandler(400, "Username can only contain letters and numbers"));
    }
  }

  // Update User Details
  try {
    console.log("user id which we are updating", req.params.userId);
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// Sign Out
export const signout = (req, res, next) => {
  try {
    res.clearCookie("access_token").status(200).json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

// Get All Users (Admin Only)
export const getUser = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }

  try {
    const startindex = parseInt(req.query.startindex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startindex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async(req , res ,next)=>{
 
  if(!req.user.isAdmin && req.user._id !== req.params.userId){
    return next(errorHandler(403 , 'you are not allowed to delete this account'));
  }
  try{
     await User.findByIdAndDelete(req.params.userId);
     res.status(200).json({message: 'User delelted successfully'});
     
  }catch(error){
    next(error);
  }
}

export const getCommentedUser =async (req , res , next)=>{
try{
const user = await User.findById(req.params.userId);
if(!user){
  return next(errorHandler(404 , 'User not found '));
}
const{password , ...rest} = user._doc;
res.status(200).json(rest);
}catch(error){
  next(error)
}
}


export const ContactMe = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    console.log("Coming from contact.jsx:", name, email, message);

    const userId = req.user?.id || null; // Get userId from verifyUser (if logged in)
    if (!userId) {
      return next(errorHandler(404, "This user not found. Please login first."));
    }

    // Save message in database
    const newMessage = new Contact({ userId, name, email, message });
    await newMessage.save();

    // **1️⃣ Send email to Admin**
    await transpoter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Your email (Admin)
      subject: `New Contact Message from ${name}`,
      html: `
        <h3>New Contact Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    // **2️⃣ Send Thank-You Email to User**
    await transpoter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // User's email
      subject: "Thank You for Contacting Me!",
      html: `
        <h3>Hi ${name},</h3>
        <p>Hey there! 😊 I truly appreciate you reaching out. Your message has been received, and I'll get back to you shortly. Looking forward to connecting!</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>Priti Navik</strong></p>
      `,
    });

    // Success Response
    res.status(201).json({ success: true, message: "Message sent successfully!" });

  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};
