import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';;
import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';
import executionRoute from './routes/executeCode.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json()); // Middleware to parse JSON bodies or to get data from the request body.
app.use(cookieParser()); // Middleware to parse cookies from the request headers.



app.get('/', (req, res) =>{
    res.send('Hello, World! Welcome to CodeVerse 🔥')
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemRoutes); // Registering the problem routes
app.use('/api/v1/execute-code', executionRoute);



// Portlistening on the specified port
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to see the app`);
})