import express from 'express';
import { login, logout, register, verify } from '../controllers/auth.controllers.js';

const authRoutes = express.Router(); // create a new route instance

authRoutes.post('/register', register); // POSt route for user registration

authRoutes.post('/login', login); // POST route for user login

authRoutes.post('/logout', logout); // POST route for user logout

authRoutes.get('/verify', verify)

export default authRoutes;