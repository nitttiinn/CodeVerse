import { UserRole } from "../generated/prisma/index.js";
import { db } from "../libs/db.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // used for sending emails
import crypto from 'crypto'; // used for generating random tokens

export const register = async (req, res) => {
    // Destructure the request body to get user details
    const { name, email, password, username: rawUsername } = req.body;

    // check if all required fields are provided
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields.'
        });
    };

    // console.log('Registering user:', { name, email, password });
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
        console.log('Generated verification token:', verificationToken);

        const newUser = await db.user.create({
            data: {
                email,
                name,
                username,
                password: hashedPassword,
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

        // console.log('Cookie set successfully:', token);

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

        // Send the email.
        console.log('Sending verification email to:', newUser.email);
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
    // Destructure the request body to get user credentials
    const { email, password } = req.body;

    // check if all required fields are provided
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields.'
        });
    };

    try {
        // check if the user exists
        const loginUser = await db.user.findUnique({
            where: { email }
        });

        if (!loginUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        };

        // check if the user is verified.
        if (!loginUser.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in.'
            });
        };

        const isValidPassword = await bcrypt.compare(password, loginUser.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        };

        // create a login JWT token
        const token = jwt.sign({
            id: loginUser.id,
            email: loginUser.email,
            role: loginUser.role,
            isVerified: loginUser.isVerified,
            username: loginUser.username
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // set the token in a cookie
        res.cookie('loginToken', token, {
            httpOnly: true, // cookie is not accessible vio JavaScript
            secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
            sameSite: 'strict', // cookie is sent only for same-site requests
            maxAge: 1000 * 60 * 60 * 24 // cookie will expire in 1 day
        });

        console.log(`${loginUser.username}, logged in successfully!`);

        return res.status(200).json({
            success: true,
            message: 'User logged in successfully.',
            user: {
                id: loginUser.id,
                username: loginUser.username,
                email: loginUser.email,
                role: loginUser.role
            }
        });

    } catch (error) {
        console.error('Error during user login:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

export const logout = async (req, res) => {
    try {
       // clear the login token cookie. i.e: logout the user.
        res.clearCookie('loginToken',{
            httpOnly: true, // cookie is not accessible via JavaScript
            secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
            sameSite: 'strict' // cookie is sent only for same-site requests
        });

        console.log('User logged out successfully.');

        // Return a success response
        return res.status(200).json({
            success: true,
            message: 'User logged out successfully.'
        });
    } catch (error) {
        console.error('Error during user logout:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        })  
    }
};

export const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'User fetched suuccessfully.',
            user: req.user // user is attached to the request object by the authMiddleware
        })
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    };
};

export const verify = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Invalid token!'
        })
    };

    try {
        // check if the user exists
        console.log('Verifying user with token:', token);


        const user = await db.user.findUnique({
            where: { verificationToken: token }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found or already verified.'
            })
        };

        // If exists, update the user to set isVerified to true and clear the verification Token.
        await db.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null // Clear the verificaiton token after verification.
            }
        });

        console.log(`User ${user.email} verified successfully.`);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now log in.'
        });
    } catch (error) {
        console.error('Error during email verification:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        })

    }
};