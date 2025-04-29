const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Validate input
        if (!username || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Check if user already exists
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Create user
        const userId = await User.create({ username, email, password, role });
        
        // Get user data
        const user = await User.findById(userId);
        
        // Generate token
        const token = User.generateToken(user);

        res.status(201).json({ 
            success: true, 
            token, 
            user: { id: user.id, username: user.username, role: user.role } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Please provide username and password' });
        }

        // Check if user exists
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate token
        const token = User.generateToken(user);

        res.status(200).json({ 
            success: true, 
            token, 
            user: { id: user.id, username: user.username, role: user.role } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.status(200).json({ 
            success: true, 
            user: { id: user.id, username: user.username, role: user.role } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};