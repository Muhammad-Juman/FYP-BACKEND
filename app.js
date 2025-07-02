import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import cors from "cors";
import normalUserRoutes from './routes/normalUserRoutes.js';
import businessUserRoutes from './routes/businessUserRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import authRoutes from './routes/authRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url';

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.use(cors({
  origin: '*', // for dev; replace with frontend URL in prod
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth/normaluser', normalUserRoutes);
app.use('/api/auth/businessuser', businessUserRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/auth',authRoutes)



mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000,'0.0.0.0', () => console.log('Server running on port',process.env.PORT));
  })
  .catch((err) => console.log('DB error:', err));
