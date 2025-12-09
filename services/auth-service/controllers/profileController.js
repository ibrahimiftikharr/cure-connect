const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUtils');

// @desc    Get user profile (doctor or patient)
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Get user basic info
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let profile = null;
    let profileExists = false;

    // Fetch profile based on role
    if (userRole === 'doctor') {
      profile = await DoctorProfile.findOne({ user: userId });
    } else if (userRole === 'patient') {
      profile = await PatientProfile.findOne({ user: userId });
    }

    if (profile) {
      profileExists = true;
    }

    // Prepare response with user info and profile
    const responseData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
      profile: profile || {},
      profileExists,
    };

    // Add role-specific fields from User schema
    if (userRole === 'doctor') {
      responseData.user.specialty = user.specialty;
      responseData.user.qualifications = user.qualifications;
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Create or update user profile
// @route   POST/PUT /api/profile
// @access  Private
const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const profileData = req.body;

    let profile = null;
    let isNewProfile = false;

    if (userRole === 'doctor') {
      // Check if profile exists
      profile = await DoctorProfile.findOne({ user: userId });

      // Extract qualifications to update User model
      const { qualifications, ...doctorProfileData } = profileData;

      if (profile) {
        // Update existing profile
        Object.assign(profile, doctorProfileData);
        profile.checkProfileCompletion();
        await profile.save();
      } else {
        // Create new profile
        profile = await DoctorProfile.create({
          user: userId,
          ...doctorProfileData,
        });
        profile.checkProfileCompletion();
        await profile.save();
        isNewProfile = true;
      }

      // Update User's profileComplete status and qualifications
      const updateData = {
        profileComplete: profile.isProfileComplete,
      };
      if (qualifications) {
        updateData.qualifications = qualifications;
      }
      await User.findByIdAndUpdate(userId, updateData);

    } else if (userRole === 'patient') {
      // Check if profile exists
      profile = await PatientProfile.findOne({ user: userId });

      if (profile) {
        // Update existing profile
        Object.assign(profile, profileData);
        profile.checkProfileCompletion();
        await profile.save();
      } else {
        // Create new profile
        profile = await PatientProfile.create({
          user: userId,
          ...profileData,
        });
        profile.checkProfileCompletion();
        await profile.save();
        isNewProfile = true;
      }

      // Update User's profileComplete status
      await User.findByIdAndUpdate(userId, {
        profileComplete: profile.isProfileComplete,
      });
    }

    res.status(isNewProfile ? 201 : 200).json({
      success: true,
      message: isNewProfile ? 'Profile created successfully' : 'Profile updated successfully',
      data: {
        profile,
        isProfileComplete: profile.isProfileComplete,
      },
    });
  } catch (error) {
    console.error('Create/Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/profile
// @access  Private
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let result = null;

    if (userRole === 'doctor') {
      result = await DoctorProfile.findOneAndDelete({ user: userId });
    } else if (userRole === 'patient') {
      result = await PatientProfile.findOneAndDelete({ user: userId });
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Update User's profileComplete status
    await User.findByIdAndUpdate(userId, {
      profileComplete: false,
    });

    res.status(200).json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/profile/upload-picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    const userId = req.user._id;
    const userRole = req.user.role;

    // Get existing profile to check for old picture
    let profile = null;
    if (userRole === 'doctor') {
      profile = await DoctorProfile.findOne({ user: userId });
    } else if (userRole === 'patient') {
      profile = await PatientProfile.findOne({ user: userId });
    }

    // Delete old profile picture from Cloudinary if exists
    if (profile?.profilePicture?.publicId) {
      try {
        await deleteFromCloudinary(profile.profilePicture.publicId);
      } catch (error) {
        console.error('Error deleting old picture:', error.message);
      }
    }

    // Upload new picture to Cloudinary
    const folder = `cureconnect/${userRole}s`;
    const result = await uploadToCloudinary(req.file.buffer, folder, `${userId}_profile`);

    const profilePictureData = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    // Update User model
    await User.findByIdAndUpdate(userId, { profilePicture: profilePictureData });

    // Update profile if exists
    if (profile) {
      profile.profilePicture = profilePictureData;
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: profilePictureData,
      },
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getProfile,
  createOrUpdateProfile,
  deleteProfile,
  uploadProfilePicture,
};
