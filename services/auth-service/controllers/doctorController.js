const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

// @desc    Search doctors with filters
// @route   GET /api/doctors/search
// @access  Public
const searchDoctors = async (req, res) => {
  try {
    const { specialty, city, name, minFee, maxFee, page = 1, limit = 10 } = req.query;

    // Build query - only show doctors with complete profiles
    const query = {};
    
    if (specialty) {
      query.specializations = { $in: [specialty] };
    }
    
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    
    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    // Find profiles with complete info
    let doctorProfiles = await DoctorProfile.find(query)
      .populate({
        path: 'user',
        match: { 
          isVerified: true, 
          isActive: true,
          profileComplete: true 
        },
        select: 'name email profilePicture specialty qualifications',
      })
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .exec();

    // Filter out null users and apply name filter
    doctorProfiles = doctorProfiles.filter(profile => {
      if (!profile.user) return false;
      if (name && !profile.user.name.toLowerCase().includes(name.toLowerCase())) {
        return false;
      }
      return true;
    });

    // Paginate
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedProfiles = doctorProfiles.slice(startIndex, startIndex + Number(limit));

    // Format response
    const doctors = paginatedProfiles.map(profile => ({
      id: profile.user._id,
      name: profile.user.name,
      email: profile.user.email,
      profilePicture: profile.user.profilePicture || profile.profilePicture,
      specialty: profile.user.specialty,
      qualifications: profile.user.qualifications,
      specializations: profile.specializations,
      yearsOfExperience: profile.yearsOfExperience,
      consultationFee: profile.consultationFee,
      city: profile.city,
      state: profile.state,
      clinicName: profile.clinicName,
      languages: profile.languages,
      rating: profile.rating || 0,
      reviewCount: profile.reviewCount || 0,
    }));

    res.status(200).json({
      success: true,
      count: doctors.length,
      total: doctorProfiles.length,
      page: Number(page),
      pages: Math.ceil(doctorProfiles.length / Number(limit)),
      data: doctors,
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search doctors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get doctor details by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findById(id).select('-password');
    
    if (!user || user.role !== 'doctor' || !user.isVerified || !user.profileComplete) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or profile incomplete',
      });
    }

    // Find doctor profile
    const profile = await DoctorProfile.findOne({ user: id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    // Combine user and profile data
    const doctorDetails = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture || profile.profilePicture,
      specialty: user.specialty,
      qualifications: user.qualifications,
      // Profile details
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      licenseNumber: profile.licenseNumber,
      yearsOfExperience: profile.yearsOfExperience,
      specializations: profile.specializations,
      languages: profile.languages,
      // Clinic details
      clinicName: profile.clinicName,
      clinicAddress: profile.clinicAddress,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      consultationFee: profile.consultationFee,
      // Additional info
      about: profile.about,
      education: profile.education,
      certifications: profile.certifications,
      availability: profile.availability,
      rating: profile.rating || 0,
      reviewCount: profile.reviewCount || 0,
      isProfileComplete: profile.isProfileComplete,
    };

    res.status(200).json({
      success: true,
      data: doctorDetails,
    });
  } catch (error) {
    console.error('Get doctor details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  searchDoctors,
  getDoctorDetails,
};
