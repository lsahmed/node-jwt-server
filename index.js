import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt, { compare } from 'bcrypt';

import { findUser, addUser } from './users.js';
import { authToken } from './middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(express.json());    

// Register Route 
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        
        // Check if user already exists
        if (await findUser(username) && await findUser(username) == []) {
            return res.status(400).json({ message: "Username already taken." });
        }
        
        // Create new user
        const newUser = await addUser(username, password);
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Login route
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        
        const user = await findUser(username);
        console.log(user.passwordHash)
        const comparison = await bcrypt.compare(password, user.passwordHash)
        // Check if user exists and password is correct
        if (!user || user == [] || !comparison) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.json({ token });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// protected route
app.get("/dashboard", authToken, (req,res) => {
    res.json({
        message: `Welcome ${req.user.username}`,
        user: req.user
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));