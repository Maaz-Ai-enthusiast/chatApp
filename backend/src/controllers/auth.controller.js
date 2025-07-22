import User from "../models/User";
export async function signup(req, res) {
    const {email, password, fullName} = req.body;
   try {
    if (!email || !password || !fullName) {
        return res.status(400).json({message: 'All fields are required'});
    }
    if (password.length < 6) {
        return res.status(400).json({message: 'Password must be at least 6 characters long'});
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({message: 'Invalid email format'});
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({message: 'Email already exists'});
    }
const idx  = Math.floor(Math.random() * 100+1);
const profileImageUrl = 'https://avatar.iran.liara.run/public/${idx}.png';
    const newUser = new User({
        fullName,
        email,
        password,
        profilePicture: profileImageUrl
    });

    await newUser.save();
    res.status(201).json({message: 'User registered successfully'});

   } catch (error) {
    
   }

    res.send('Signup Page');
}

export async function login(req, res) {
    res.send('Login Page');
}
export async function logout(req, res) {
    res.send('Logout Page');
}