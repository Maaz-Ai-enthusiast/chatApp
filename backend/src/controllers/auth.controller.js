import User from "../models/User.js"
import jwt from "jsonwebtoken"

export async function signup(req, res) {
  const { email, password, fullName } = req.body;
  console.log('Request body:', req.body);

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'All fields (fullName, email, password) are required',
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

  console.log("Password type:", typeof password);
console.log("Password length (trimmed):", password?.trim()?.length);

if (typeof password !== "string" || password.trim().length < 6) {
  return res.status(400).json({
    success: false,
    message: 'Password must be at least 6 characters long or invalid format',
  });
}


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    const idx = Math.floor(Math.random() * 100 + 1);
    const profileImageUrl = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = new User({
      fullName,
      email,
      password,
      profilePicture: profileImageUrl,
    });

    // ✅ Save user before creating token
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      },
    });

  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}


export async function login(req, res) {
    res.send('Login Page');
}
export async function logout(req, res) {
    res.send('Logout Page');
}