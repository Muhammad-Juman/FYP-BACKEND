import mongoose from 'mongoose';
import { PropertyModel } from '../models/Property.js';
import { BusinessUserModel } from '../models/BusinessUser.js';

// ✅ Add Property
export const addProperty = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      address,
      contactNumber,
      amenities,
      website,
      rooms,
      user,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const images = req.files?.map(file => ({ url: `/uploads/${file.filename}` }));

    const parsedRooms = typeof rooms === "string" ? JSON.parse(rooms) : rooms;
    const parsedAmenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;

    const newProperty = await PropertyModel.create({
      name,
      category,
      description,
      address,
      contactNumber,
      amenities: parsedAmenities,
      website,
      rooms: parsedRooms,
      images,
      user,
    });

    await BusinessUserModel.findByIdAndUpdate(user, {
      $push: { properties: newProperty._id },
    });

    res.status(201).json({
      message: 'Property created and linked to user successfully',
      property: newProperty
    });
  } catch (error) {
    console.error('Add property error:', error);
    res.status(500).json({
      message: 'Failed to add property',
      error: error.message
    });
  }
};

// ✅ Get All Properties By Business User
export const getPropertiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const properties = await PropertyModel.find({ user: userId });
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

// ✅ Update Property
export const updateProperty = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      address,
      contactNumber,
      amenities,
      website,
      rooms,
      user,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const parsedRooms = typeof rooms === "string" ? JSON.parse(rooms) : rooms;
    const parsedAmenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;

    const updateData = {
      name,
      category,
      description,
      address,
      contactNumber,
      amenities: parsedAmenities,
      website,
      rooms: parsedRooms,
      user,
    };

    let finalImages = [];

    if (req.body.existingImages) {
      const existingImages = JSON.parse(req.body.existingImages);
      finalImages = finalImages.concat(existingImages);
    }

    if (req.files?.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
      }));
      finalImages = finalImages.concat(newImages);
    }

    if (finalImages.length > 0) {
      updateData.images = finalImages;
    }

    const updated = await PropertyModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json({
      message: 'Property updated successfully',
      property: updated,
    });
  } catch (err) {
    console.error('Update Property Error:', err);
    res.status(500).json({
      message: 'Update failed',
      error: err.message,
    });
  }
};

// ✅ Get Properties By Category
export const getPropertyByType = async (req, res) => {
  try {
    const { type } = req.query;
    const properties = await PropertyModel.find(
      type ? { category: type } : {}
    ).populate('user');
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
};


export const searchProperties = async (req, res) => {
  const { searchType, location, startPrice, endPrice } = req.query;

  try {
    const query = {};

    // Category filter (hostel/hotel)
    if (searchType) {
      query.category = searchType;
    }

    // Address filter (if location is provided)
    if (typeof location === 'string' && location.trim() !== '') {
      query.address = { $regex: new RegExp(location.trim(), 'i') };
    }

    const allProperties = await PropertyModel.find(query);

    const start = Number(startPrice);
    const end = Number(endPrice);

    // Filter results manually based on room prices
    const filtered = allProperties.filter((property) => {
      if (!Array.isArray(property.rooms)) return false;

      return property.rooms.some((room) => {
        const price = Number(room.price);
        if (!isNaN(start) && isNaN(end)) {
          return price >= start;
        } else if (!isNaN(start) && !isNaN(end)) {
          return price >= start && price <= end;
        }
        return true; // No price filters provided
      });
    });

    res.json(filtered);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error during search' });
  }
};


