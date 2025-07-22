import express from 'express';
import { login, logout, register, getProfile, verify } from '../controllers/auth.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const authRoutes = express.Router(); // create a new route instance

authRoutes.post('/register', register); // POSt route for user registration

authRoutes.post('/login', login); // POST route for user login

authRoutes.post('/verify',verify);

authRoutes.post('/logout', authMiddleware,logout); // POST route for user logout

authRoutes.get('/profile', authMiddleware,getProfile); // GET route to fetch user profile

export default authRoutes;