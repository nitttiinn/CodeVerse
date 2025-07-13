import express from 'express';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware.js';
import { createProblem, deleteProblem, getAllProblems, getAllProblemsSolvedByUser, getProblemById, updateProblem } from '../controllers/problem.controllers.js';

const problemRoutes = express.Router();

// Import controllers

problemRoutes.post('/create-problem', authMiddleware, isAdmin, createProblem); // Route to create a problem by admin

problemRoutes.get('/get-all-problems', authMiddleware, getAllProblems); // Route to get all problems

problemRoutes.get('/get-problem/:id', authMiddleware, getProblemById); // Route to get a problem by ID

problemRoutes.put('/update-problem/:id', authMiddleware, isAdmin, updateProblem); // Route to update a problem by ID

problemRoutes.delete('/delete-problem/:id', authMiddleware, isAdmin, deleteProblem); // Route to delete a problem by ID

problemRoutes.get('/get-solved-problems', authMiddleware, getAllProblemsSolvedByUser); // Route to get all solved by user.

export default problemRoutes;