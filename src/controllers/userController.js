// src/controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        console.log(req.body)
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
    console.error(error); // This is the key change
    if (error.code === 11000) {
        // Mongoose error for duplicate key
        return res.status(409).json({ error: 'Email already exists.' });
    }
    // Handle other validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }
    // Generic server error
    res.status(500).json({ error: 'Registration failed.' });
}
};
// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed.' });
    }
};
