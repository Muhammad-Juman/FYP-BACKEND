import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BusinessUserModel } from '../models/BusinessUser.js';
import { PropertyModel } from '../models/Property.js';
import { NormalUser } from '../models/NormalUser.js';

// Register
export const registerBusinessUser = async (req, res) => {
  const { fullname, email, phoneNumber, password, businessName, webiste } = req.body;
  try {
    const existingUser = await BusinessUserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const existingNormalUser = await NormalUser.findOne({ email });
    if (existingNormalUser) return res.status(400).json({ message: "This email is already registered with a\n Normal User" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await BusinessUserModel.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      businessName,
      webiste
    });

    res.status(200).json({ message: "Business user registered", user });
  } catch (error) {
    res.status(500).json({ message: "Sign Up Failed", error: error.message });
  }
};

// Login
export const loginBusinessUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await BusinessUserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id, role: "businessuser" }, process.env.JWT_SECRETE, { expiresIn: "1d" });

    res.status(200).json({ token, user,"role":"businessuser" });
  } catch (error) {
    res.status(500).json({ message: "Login Failed", error: error.message });
  }
};


 export const getBookMarksByUserID = async (req, res) => {
  try {
    const user = await BusinessUserModel.findById(req.params.userId).populate({
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
    const user = await BusinessUserModel.findById(userId);
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
    const user = await BusinessUserModel.findById(userId);
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
    const user = await BusinessUserModel.findById(req.params.userId);
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
    const user = await BusinessUserModel.findById(req.params.userId)
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