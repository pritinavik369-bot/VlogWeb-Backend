import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import cookieParser from 'cookie-parser';
import cors from "cors";

dotenv.config();

const app = express();
// Health check (IMPORTANT)
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://vlog-web-frontend.vercel.app"
  ],
  credentials: true
}));

// Routes
app.use('/server/user', userRoutes);
app.use('/server/auth', authRoutes);
app.use('/server/post', postRoutes);
app.use('/server/comment', commentRoutes);



// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const msg = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    msg
  });
});

// DB connection
mongoose.connect(process.env.MONGO)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error", err));

export default app;
