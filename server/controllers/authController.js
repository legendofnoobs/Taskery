import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Project from '../models/Project.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export async function register(req, res) {
    const { firstName, lastName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        const inboxProject = await Project.create({
            name: 'Inbox',
            color: 'gray',
            userId: user._id,
            isFavorite: false,
            isInbox: true,
        });

        user.projects = [inboxProject._id];
        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatarUrl: user.avatarUrl,
                projects: user.projects,
            },
            token,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

export async function login(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(user._id);

        res.json({
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatarUrl: user.avatarUrl,
                projects: user.projects,
            },
            token,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

export async function getMe(req, res) {
    res.json(req.user);
}

export async function updateProfile(req, res) {
    const userId = req.user._id;
    const { firstName, lastName, email, password, avatarUrl } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
        if (password) user.password = await hash(password, 10);

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatarUrl: user.avatarUrl,
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}