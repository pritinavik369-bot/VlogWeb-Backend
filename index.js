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

app.get('/debug-db', async (req, res) => {
  const state = mongoose.connection.readyState;
  let error = null;
  let collections = [];

  try {
    if (state === 1) {
      collections = await mongoose.connection.db.listCollections().toArray();
      collections = collections.map(c => c.name);
    }
  } catch (err) {
    error = err.message;
  }

  res.json({
    readyState: state,
    readyStateDesc: ['disconnected', 'connected', 'connecting', 'disconnecting'][state],
    mongoUri: process.env.MONGO ? process.env.MONGO.substring(0, 15) + '...' : 'UNDEFINED',
    error,
    collections
  });
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
  .then(() => {
    console.log("✅ MongoDB connected");
    // Start server internally only if not in Vercel (basic check) or if run directly
    // This allows local testing via 'node index.js' or 'npm run dev'
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}!!!`);
      });
    }
  })
  .catch(err => console.log("❌ MongoDB error", err));

export default app;
