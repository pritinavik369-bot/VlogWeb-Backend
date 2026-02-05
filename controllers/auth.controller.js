import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';

// Signup Function
export const signup = async (req, res, next) => {
  console.log('Request Body:', req.body);
  try {
    const { username, email, password } = req.body;

    // Validate the input fields
    if (!username || !email || !password || username === '' || email === '' || password === '') {
      return next(errorHandler(400, 'All fields are required'));
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(409, 'User already exists with this email'));
    }

    // Hash the password
    const hashPassword = bcryptjs.hashSync(password, 10);
    console.log('Hashed Password:', hashPassword);

    // Create a new user instance
    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });

    // Save the new user to the database
    await newUser.save();
    console.log("Signup successful");

    // Respond with a success message
    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    next(error);
  }
};

// Signin Function
export const signin = async (req, res, next) => {
  const { username, password } = req.body;
  console.log(username, password);

  if (!username || !password || username === "" || password === "") {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const validUser = await User.findOne({ username });
    if (!validUser) {
      return next(errorHandler(401, 'Invalid Username or Password'));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    console.log('Password Valid:', validPassword);

    if (!validPassword) {
      return next(errorHandler(401, 'Invalid Username or Password'));
    }

    
    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = validUser._doc;
    res.status(200).cookie('access_token', token, {
      httpOnly: true
    }).json({ ...rest, token });

  } catch (error) {
    next(error);
  }
};

// Google Authentication Function
export const google = async (req, res, next) => {
  const { name, email, googlePhotoUrl } = req.body;

  // Validate Google Data
  if (!name || !email || !googlePhotoUrl) {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET
      );

      const { password, ...rest } = user._doc;
      return res.status(200).cookie('access_token', token, {
        httpOnly: true,
      }).json({ ...rest, token });
    } else {
      // Generate a random password for Google users
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      // Generate a unique username
      const generatedUsername = name.toLowerCase().replace(/\s/g, '') + Math.floor(1000 + Math.random() * 9000);

      // Create a new user instance
      const newUser = new User({
        username: generatedUsername,
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET
      );

      const { password, ...rest } = newUser._doc;
      res.status(201).cookie('access_token', token, {
        httpOnly: true,
      }).json({ ...rest, token });
    }

  } catch (error) {
    next(error);
  }
};
