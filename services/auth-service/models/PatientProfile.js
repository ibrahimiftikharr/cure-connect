const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
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
  // Basic Information (some pre-filled from User)
  phone: {
    type: String,
    trim: true,
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  
  // Contact Information
  address: String,
  country: {
    type: String,
    default: 'USA',
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relation: String,
    relationship: String,
    phone: String,
  },
  
  // Medical Information
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
  },
  height: Number,
  weight: Number,
  
  // Medical History
  allergies: [String],
  chronicConditions: [String],
  currentMedications: [String],
  medicationDetails: [{
    name: String,
    dosage: String,
    frequency: String,
  }],
  previousSurgeries: [{
    name: String,
    date: Date,
    notes: String,
  }],
  
  // Insurance Information
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
  },
  insuranceProvider: String,
  insurancePolicyNumber: String,
  insuranceGroupNumber: String,
  
  // Additional Information
  notes: {
    type: String,
    maxlength: 1000,
  },
  
  // Media
  profilePhoto: String,
  
  // Status
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Method to check if profile is complete
patientProfileSchema.methods.checkProfileCompletion = function() {
  const requiredFields = [
    this.phone,
    this.dateOfBirth,
    this.address,
  ];
  
  this.isProfileComplete = requiredFields.every(field => field != null && field !== '');
  return this.isProfileComplete;
};

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

module.exports = PatientProfile;
