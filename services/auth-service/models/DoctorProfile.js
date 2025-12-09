const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  profilePicture: {
    url: String,
    publicId: String,
  },
  // Basic Information
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  
  // Professional Information
  licenseNumber: {
    type: String,
    trim: true,
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
  },
  
  // Location
  city: String,
  state: String,
  country: {
    type: String,
    default: 'USA',
  },
  
  // Professional Details
  education: [String],
  certifications: [String],
  languages: [String],
  
  // Practice Information
  consultationFee: {
    type: Number,
    min: 0,
  },
  availability: {
    Monday: {
      enabled: { type: Boolean, default: false },
      slots: [String],
    },
    Tuesday: {
      enabled: { type: Boolean, default: false },
      slots: [String],
    },
    Wednesday: {
      enabled: { type: Boolean, default: false },
      slots: [String],
    },
    Thursday: {
      enabled: { type: Boolean, default: false },
      slots: [String],
    },
    Friday: {
      enabled: { type: Boolean, default: false },
      slots: [String],
    },
    Saturday: {
      enabled: { type: Boolean, default: false },
      slots: [String],
    },
    Sunday: {
      enabled: { type: Boolean, default: false },
      slots: [String],
    },
  },
  
  // Additional Information
  about: {
    type: String,
    maxlength: 1000,
  },
  specializations: [String],
  awards: [String],
  
  // Media
  profilePhoto: String,
  
  // Status
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Method to check if profile is complete
doctorProfileSchema.methods.checkProfileCompletion = function() {
  const requiredFields = [
    this.city,
    this.consultationFee,
  ];
  
  // Check if at least one availability slot is set
  const hasAvailability = Object.values(this.availability || {}).some(day => 
    day.enabled && day.slots && day.slots.length > 0
  );
  
  this.isProfileComplete = requiredFields.every(field => field != null && field !== '') && hasAvailability;
  return this.isProfileComplete;
};

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

module.exports = DoctorProfile;
