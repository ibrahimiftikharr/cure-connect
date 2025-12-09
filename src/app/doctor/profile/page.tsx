'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DoctorNav } from '@/components/DoctorNav';
import { Avatar } from '@/components/Avatar';
import { Save, Clock, Loader2, Camera } from 'lucide-react';
import { authService } from '@/lib/authService';

interface Availability {
  [key: string]: { enabled: boolean; slots: string[] };
}

export default function DoctorProfilePage() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileExists, setProfileExists] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    gender: '',
    licenseNumber: '',
    qualifications: '',
    yearsOfExperience: '',
    city: '',
    about: '',
    consultationFee: '',
    languages: [] as string[],
    specializations: [] as string[],
  });

  const [availability, setAvailability] = useState<Availability>({
    Monday: { enabled: false, slots: [] },
    Tuesday: { enabled: false, slots: [] },
    Wednesday: { enabled: false, slots: [] },
    Thursday: { enabled: false, slots: [] },
    Friday: { enabled: false, slots: [] },
    Saturday: { enabled: false, slots: [] },
    Sunday: { enabled: false, slots: [] }
  });

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [newTimeSlot, setNewTimeSlot] = useState({ start: '09:00', end: '10:00' });

  const specialtyOptions = [
    'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics',
    'Orthopedics', 'Psychiatry', 'General Medicine', 'ENT',
    'Ophthalmology', 'Gynecology', 'Oncology', 'Radiology'
  ];

  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese', 'Arabic'];

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
            gender: profile.gender || '',
            licenseNumber: profile.licenseNumber || '',
            qualifications: userData?.qualifications || '',
            yearsOfExperience: profile.yearsOfExperience || '',
            city: profile.city || '',
            about: profile.about || '',
            consultationFee: profile.consultationFee || '',
            languages: profile.languages || [],
            specializations: profile.specializations || [],
          });

          if (profile.availability) {
            setAvailability(profile.availability);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        enabled: !availability[day].enabled
      }
    });
  };

  const formatTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const addTimeSlot = () => {
    const formattedStart = formatTo12Hour(newTimeSlot.start);
    const formattedEnd = formatTo12Hour(newTimeSlot.end);
    const slotString = `${formattedStart} - ${formattedEnd}`;
    if (!availability[selectedDay].slots.includes(slotString)) {
      setAvailability({
        ...availability,
        [selectedDay]: {
          ...availability[selectedDay],
          slots: [...availability[selectedDay].slots, slotString]
        }
      });
    }
  };

  const removeTimeSlot = (day: string, slot: string) => {
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        slots: availability[day].slots.filter(s => s !== slot)
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleArrayItem = (field: 'languages' | 'specializations', value: string) => {
    const array = formData[field];
    if (array.includes(value)) {
      setFormData({
        ...formData,
        [field]: array.filter((item: string) => item !== value)
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...array, value]
      });
    }
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
        updateProfile({ profilePicture: response.data.profilePicture });
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
        availability,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
        consultationFee: formData.consultationFee ? Number(formData.consultationFee) : undefined,
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
        <DoctorNav />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Profile Picture Section */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Profile</h1>
              <p className="text-gray-600">
                {profileExists ? 'Update your professional information' : 'Complete your profile to start accepting appointments'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar 
                  name={user?.name || 'Doctor'} 
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
            {/* Pre-filled Information from Signup */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
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
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Qualifications *</label>
                  <input
                    type="text"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., MBBS, MD"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Years"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Consultation Fee ($) *</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="100"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Specializations</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {specialtyOptions.map(spec => (
                      <label key={spec} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.specializations.includes(spec)}
                          onChange={() => toggleArrayItem('specializations', spec)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Languages Spoken</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {languageOptions.map(lang => (
                      <label key={lang} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={() => toggleArrayItem('languages', lang)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Consultation Fee ($) *</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About You</h2>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Tell patients about your experience, approach to care, and what makes you unique..."
              />
              <p className="text-sm text-gray-500 mt-1">{formData.about.length}/1000 characters</p>
            </div>

            {/* Availability Schedule */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <Clock className="inline mr-2" size={24} />
                Availability Schedule
              </h2>

              <div className="space-y-4">
                {Object.keys(availability).map(day => (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={availability[day].enabled}
                          onChange={() => toggleDay(day)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-lg font-medium text-gray-800">{day}</span>
                      </label>
                      
                      {availability[day].enabled && day === selectedDay && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={newTimeSlot.start}
                            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={newTimeSlot.end}
                            onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={addTimeSlot}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>

                    {availability[day].enabled && (
                      <div className="flex flex-wrap gap-2 ml-8">
                        {availability[day].slots.length > 0 ? (
                          availability[day].slots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                              <Clock size={14} />
                              {slot}
                              <button
                                type="button"
                                onClick={() => removeTimeSlot(day, slot)}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedDay(day)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Click to add time slots
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
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
