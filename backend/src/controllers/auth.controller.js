import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js"
import jwt from "jsonwebtoken"


const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', 
  });
};
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
    console.log('New user created:', newUser);
  const token = generateToken(newUser._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
  try {
    const { email, password } = req.body;
    console.log('Login request body:', req.body);

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log('✨ enteredPassword:', password);
    console.log('🔒 storedHash:', user.password);
    console.log('✅ password match?:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'Strict',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}



export async function logout(req, res) {
  try {
    res.cookie("token", "", { maxAge: 0 });
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.log('Logout Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}


export const updateProfile = async (req, res) => {
  try {

    const {profilePic} = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture is required',
      });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResponse.secure_url },
      { new: true }
    ).select('-password');
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    
  }
}



export const checkAuth = async (req, res) => {
  try {
res.status(200).json(
  req.user
);
  } catch (error) {
    console.error('Check Auth Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
