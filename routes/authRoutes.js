import express from 'express';
const router = express.Router();
import {sendOTP,verifyOTP,resetPassword} from '../controllers/authController.js';

router.post('/forgot-password',sendOTP)
router.post('/verify-otp',verifyOTP)
router.post('/reset-password',resetPassword)


export default router;