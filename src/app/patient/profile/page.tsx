'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PatientNav } from '@/components/PatientNav';
import { Avatar } from '@/components/Avatar';
import { Save, Loader2, User, Heart, FileText, Phone, Camera } from 'lucide-react';
import { authService } from '@/lib/authService';

export default function PatientProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileExists, setProfileExists] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodGroup: '',
    height: '',
    weight: '',
    allergies: [] as string[],
    chronicConditions: [] as string[],
    currentMedications: [] as string[],
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const commonAllergies = ['Penicillin', 'Aspirin', 'Peanuts', 'Shellfish', 'Latex', 'Pollen'];
  const commonConditions = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Arthritis'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      
      if (response.success) {
        const { profile, profileExists: exists, user: userData } = response.data;
        setProfileExists(exists);

        // Set profile picture from user or profile
        if (userData?.profilePicture?.url) {
          setProfilePicture(userData.profilePicture.url);
        } else if (profile?.profilePicture?.url) {
          setProfilePicture(profile.profilePicture.url);
        }

        if (exists && profile) {
          // Pre-fill form with existing profile data
          setFormData({
            phone: profile.phone || '',
            dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
            gender: profile.gender || '',
            address: profile.address || '',
            bloodGroup: profile.bloodGroup || '',
            height: profile.height || '',
            weight: profile.weight || '',
            allergies: profile.allergies || [],
            chronicConditions: profile.chronicConditions || [],
            currentMedications: profile.currentMedications || [],
            emergencyContactName: profile.emergencyContact?.name || '',
            emergencyContactPhone: profile.emergencyContact?.phone || '',
            emergencyContactRelation: profile.emergencyContact?.relation || '',
            insuranceProvider: profile.insuranceInfo?.provider || '',
            insurancePolicyNumber: profile.insuranceInfo?.policyNumber || '',
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addToArray = (field: 'allergies' | 'chronicConditions' | 'currentMedications', value: string) => {
    if (value && !formData[field].includes(value)) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value]
      });
    }
  };

  const removeFromArray = (field: 'allergies' | 'chronicConditions' | 'currentMedications', value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter(item => item !== value)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await authService.uploadProfilePicture(file);
      if (response.success) {
        setProfilePicture(response.data.profilePicture.url);
        setSuccess('Profile picture uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const profileData = {
        ...formData,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        },
        insuranceInfo: {
          provider: formData.insuranceProvider,
          policyNumber: formData.insurancePolicyNumber,
        },
      };

      const response = await authService.saveProfile(profileData);
      
      if (response.success) {
        setSuccess(profileExists ? 'Profile updated successfully!' : 'Profile created successfully!');
        setProfileExists(true);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PatientNav />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Profile Picture Section */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <User className="text-blue-600" size={32} />
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              </div>
              <p className="text-gray-600">
                {profileExists ? 'Keep your health information up to date' : 'Complete your profile for better healthcare'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar 
                  name={user?.name || 'Patient'} 
                  imageUrl={profilePicture} 
                  size="xl"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" size={32} />
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
                  <Camera size={16} />
                  {profilePicture ? 'Change Photo' : 'Upload Photo'}
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="fixed top-4 right-4 z-50 animate-fade-in">
              <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px]">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} />
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-1">From signup (cannot be changed here)</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-1">From signup (cannot be changed here)</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select blood group</option>
                    {bloodGroupOptions.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="170"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="70"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your complete address"
                  required
                />
              </div>
            </div>

            {/* Medical Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="text-red-500" size={20} />
                Medical Information
              </h2>

              {/* Allergies */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Allergies</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Add an allergy"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addToArray('allergies', newAllergy);
                      setNewAllergy('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonAllergies.map(allergy => (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => addToArray('allergies', allergy)}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                    >
                      + {allergy}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((allergy, idx) => (
                    <div key={idx} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeFromArray('allergies', allergy)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Chronic Conditions</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Add a condition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addToArray('chronicConditions', newCondition);
                      setNewCondition('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonConditions.map(condition => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => addToArray('chronicConditions', condition)}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                    >
                      + {condition}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.chronicConditions.map((condition, idx) => (
                    <div key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm flex items-center gap-2">
                      {condition}
                      <button
                        type="button"
                        onClick={() => removeFromArray('chronicConditions', condition)}
                        className="text-orange-500 hover:text-orange-700 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Current Medications</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Add a medication"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addToArray('currentMedications', newMedication);
                      setNewMedication('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.currentMedications.map((medication, idx) => (
                    <div key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                      {medication}
                      <button
                        type="button"
                        onClick={() => removeFromArray('currentMedications', medication)}
                        className="text-green-500 hover:text-green-700 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="text-red-600" size={20} />
                Emergency Contact
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Emergency contact name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Emergency contact phone"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Relation *</label>
                  <input
                    type="text"
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Spouse, Parent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Insurance Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Insurance Provider</label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Blue Cross"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Policy Number</label>
                  <input
                    type="text"
                    name="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Policy number"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {profileExists ? 'Update Profile' : 'Create Profile'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
