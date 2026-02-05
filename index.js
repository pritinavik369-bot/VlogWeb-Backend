import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js'
import authRoutes from'./routes/auth.route.js'
import postRoutes  from './routes/post.route.js';
import commentRoutes  from './routes/comment.route.js';
import cookieParser from 'cookie-parser';
import cors from "cors";

//deploy
import path from 'path';

dotenv.config();

//console.log("Mongo URI:", process.env.MONGO);
//env file and index.js file shouldd be in same place / folder
const connectDb = async()=>{
await mongoose.connect(process.env.MONGO).then(()=>{
  console.log("mogodb connected");
}).catch((error)=>{
console.log("getting error ",error);
throw error;
})

}
connectDb(); 

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected to:', mongoose.connection.name);
});

mongoose.connection.on('error', (err) => {
  console.log('❌ MongoDB connection error:', err);
});

//deploy
const ___direname = path.resolve();



const app = express();


// Start the server
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',  // Your frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Define routes
app.use('/server/user', userRoutes);

app.use('/server/auth', authRoutes);
app.use('/server/post', postRoutes);

app.use('/server/comment', commentRoutes);


//deploy
app.use(express.static(path.join(___direname , '/client/dist')));
app.get('*', (req , res)=>{
  res.sendFile(path.join(___direname , 'client' , 'dist' ,'index.html'));
})

//Middlewares

app.use((err, req , res , next)=>{
const statusCode = err.statusCode||500;
const msg = err.message ||'internal server Error';
res.status(statusCode).json({

success: false,
statusCode,
msg
});
});






