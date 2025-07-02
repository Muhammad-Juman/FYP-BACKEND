import { BusinessUserModel } from "../models/BusinessUser.js";
import { NormalUser } from "../models/NormalUser.js";
import { sendOTPEmail } from '../utils/emailUtility.js'
import crypto from 'crypto';
import bcrypt from "bcryptjs";


const getModelByType = (type) => {
  if (type === 'user') return NormalUser;
  if (type === 'business') return BusinessUserModel;
  throw new Error('Invalid user type');
};


export const sendOTP = async (req, res) => {
  const { email, userType } = req.body;
  try {
    const Model = getModelByType(userType);
    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    user.otp = { code, expiresAt };
    await user.save();

    await sendOTPEmail(user.email, code);

    res.json({ message: 'OTP sent',code:code });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};



export const verifyOTP = async (req, res) => {
  const { email, code, userType } = req.body;
  try {
    const Model = getModelByType(userType);
    const user = await Model.findOne({ email });
    if (!user || !user.otp || user.otp.code !== code || user.otp.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const tempToken = crypto.randomBytes(32).toString('hex');
    user.otp = undefined;
    user.tempToken = tempToken;
    user.tempTokenExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.json({ tempToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const resetPassword = async (req, res) => {
  const { email, newPassword,tempToken, userType } = req.body;
  try {
    const Model = getModelByType(userType);
    const user = await Model.findOne({ email });
    if (!user || user.tempToken !== tempToken || user.tempTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.tempToken = undefined;
    user.tempTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
