import { UserRole } from "../generated/prisma/index.js";
import { db } from "../libs/db.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // used for sending emails
import crypto from 'crypto'; // used for generating random tokens




export const register = async (req, res) => {
    // Destructure the request body to get user details
    const { name, email, password, username: rawUsername} = req.body;

    // check if all required fields are provided
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields.'
        });
    };


    console.log('Registering user:', { name, email, password });
    // check the length of the passwod.
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long.'
        });
    };

    // Check if the user already exists
    try {
        // Import the database client
        const existingUser = await db.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email. Please login instead.'
            })
        };

        console.log('Creating a new user!');

        const username = rawUsername || email.split('@')[0]; // Default username is the part before the '@' in the email

        // hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // create a verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await db.user.create({
            data: {
                email,
                name,
                username,
                isVerified: false, // Set to false by default
                verificationToken, // Store the verification token
                role: UserRole.USER, // Default role is USER
            }
        });

        const token = jwt.sign({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role
        }, process.env.JWT_SECRET, {
            expiresIn: '1d' // Token will expire in 1 day
        });

        res.cookie('token', token, {
            httpOnly: true, // Cookie is not accessible via JavaScript
            secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
            sameSite: 'strict', // Cookie is sent only for same-site requests
            maxAge: 24 * 60 * 60 * 1000 // Cookie will expire in 1 day
        });

        console.log('Cookie set successfully:', token);

        // Send verification email
        // send email to the user with the verification token
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_HOST_PORT,
            secure: false,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASSWORD
            }
        });

        // Create the verficatio link
        const verifyLink = `${process.env.BASE_URL}/api/v1/auth/verify?token=${verificationToken}`
        // MAIL OPTIONS
        const mailOption = {
            from: process.env.MAILTRAP_SENDERMAIL,
            to: newUser.email,
            subject: "Email Verification for Registration",
            text: `Hello ${newUser.name},\n\nPlease click on the following link to verify your email:\n\n${verifyLink}`,
            html: `<p>Hello ${newUser.name},</p><p>Please click on the following link to verify your email address:</p><a href="${verifyLink}">Verify Email</a>`
        };
        await transporter.sendMail(mailOption);

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email.'
        });

    } catch (error) {
        console.error('Error during user registration:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });

    }
};

export const login = async (req, res) => {
};

export const logout = async (req, res) => {
};

export const getUser = async (req, res) => {
};

export const verify = async (req, res) => {
};