import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NormalUser } from '../models/NormalUser.js';
import {BusinessUserModel} from '../models/BusinessUser.js';

// Register
export const registerNormalUser = async (req, res) => {
  const { fullname, email, phoneNumber, password } = req.body;
  try {
    const existingUser = await NormalUser.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const existingBusinessUser = await BusinessUserModel.findOne({ email });
    if (existingBusinessUser) return res.status(400).json({ message: "This email is already registered with a\n Business User" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await NormalUser.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    res.status(200).json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// Login
export const loginNormalUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await NormalUser.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id, role: "normaluser" },process.env.JWT_SECRETE, { expiresIn: "1d" });

    res.status(200).json({ token, user,"role":"normaluser" });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};


export const getBookMarksByUserID = async (req, res) => {
  try {
    const user = await NormalUser.findById(req.params.userId).populate({
      path: 'bookmark',
      model: 'Property',
      populate: {
        path: 'user',
        model: 'BusinessUser', // Or 'NormalUser' if applicable
        select: 'fullname email phoneNumber' // Only required fields
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.bookmark);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};


export const removeBookMark = async (req, res) => {
  const { userId, propertyId } = req.body;
  try {
    const user = await NormalUser.findById(userId);
    user.bookmark = user.bookmark.filter(b => b.toString() !== propertyId);
    await user.save();
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
}


export const addBookmark =async (req, res) => {
  const { userId, propertyId } = req.body;
  try {
    const user = await NormalUser.findById(userId);
    if (!user.bookmark.includes(propertyId)) {
      user.bookmark.push(propertyId);
      await user.save();
    }
    res.json({ message: 'Bookmarked' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
}


export const addRecentView = async (req, res) => {
  const { itemId } = req.body; // this should be Property._id

  try {
    const user = await NormalUser.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove if already exists
    user.recentView = user.recentView.filter(id => id.toString() !== itemId);

    // Add new at the beginning
    user.recentView.unshift(itemId);

    // Keep only latest 5
    user.recentView = user.recentView.slice(0, 10);

    await user.save();
    res.json({ message: 'Recent view saved', recentView: user.recentView });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getRecentView = async (req, res)=> {
  try {
    const user = await NormalUser.findById(req.params.userId)
      .populate({
        path: 'recentView',
        model: 'Property',
         populate: {
          path: 'user',
          model: 'BusinessUser', // or 'NormalUser' if it's a normal user — depends on your schema
          select: 'fullname email phoneNumber' // only select required fields
        }
      });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.recentView);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}


//normal user switch to business user
export const switchToBusinessAccount = async (req, res) => {
  const { userId } = req.params;
  const { businessName, phoneNumber, website } = req.body;

  try {
    const normalUser = await NormalUser.findById(userId);
    if (!normalUser) {
      return res.status(404).json({ message: 'Normal user not found' });
    }

    // Create business user with preserved bookmarks and views
    const newBusinessUser = new BusinessUserModel({
      fullname: normalUser.fullname,
      email: normalUser.email,
      password: normalUser.password,
      phoneNumber: phoneNumber,
      businessName,
      website,
      bookmark: normalUser.bookmark || [],
      recentView: normalUser.recentView || []
    });

    await newBusinessUser.save();

    // Optionally delete normal user after successful creation
    await NormalUser.findByIdAndDelete(userId);

    res.status(200).json({
      message: 'Successfully switched to business account',
      user: newBusinessUser,
      role: 'businessuser'
    });
  } catch (error) {
    console.error('Switch error:', error);
    res.status(500).json({ message: 'Failed to switch account', error: error.message });
  }
};
