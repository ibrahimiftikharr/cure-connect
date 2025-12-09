'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PatientNav } from '@/components/PatientNav';
import { Avatar } from '@/components/Avatar';
import { MapPin, Star, Calendar, ArrowLeft, Award, Languages, DollarSign, Clock } from 'lucide-react';
import authService from '@/lib/authService';

export default function DoctorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const response = await authService.getDoctorDetails(params.id as string);
        setDoctor(response.data);
        setError('');
      } catch (err: any) {
        console.error('Failed to fetch doctor details:', err);
        setError(err.response?.data?.message || 'Failed to load doctor details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDoctorDetails();
    }
  }, [params.id]);

  const availableDates = [
    'Dec 8, 2024',
    'Dec 9, 2024',
    'Dec 10, 2024',
    'Dec 11, 2024',
    'Dec 12, 2024'
  ];

  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, save appointment to backend
    alert('Appointment request sent! The doctor will review and confirm.');
    setShowBookingModal(false);
    router.push('/patient/appointments');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PatientNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PatientNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Search
          </button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-red-600">{error || 'Doctor not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Search
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                <Avatar 
                  name={doctor.name}
                  imageUrl={doctor.profilePicture?.url}
                  size="xl"
                  className="!w-32 !h-32 text-4xl shadow-xl"
                />
              </div>

              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                    <p className="text-xl text-blue-600 font-semibold mb-2">{doctor.specialty}</p>
                    <p className="text-gray-600 mb-4">{doctor.qualifications || 'Medical Professional'}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {(doctor.city || doctor.state) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={16} />
                          {[doctor.city, doctor.state].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {doctor.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-500 fill-yellow-500" />
                          {doctor.rating.toFixed(1)} ({doctor.reviewCount || 0} reviews)
                        </span>
                      )}
                      {doctor.yearsOfExperience && (
                        <span className="flex items-center gap-1">
                          <Award size={16} />
                          {doctor.yearsOfExperience} years
                        </span>
                      )}
                    </div>
                  </div>

                  {doctor.isAvailable && (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm self-start">
                      Available Now
                    </span>
                  )}
                </div>

                {doctor.about && (
                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-700 leading-relaxed">{doctor.about}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Education & Certifications */}
            {(doctor.education?.length > 0 || doctor.certifications?.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {doctor.education?.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
                    <ul className="space-y-3">
                      {doctor.education.map((edu: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <Award className="text-blue-600 mt-1" size={20} />
                          <span className="text-gray-700">{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {doctor.certifications?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications</h2>
                    <ul className="space-y-3">
                      {doctor.certifications.map((cert: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <Award className="text-green-600 mt-1" size={20} />
                          <span className="text-gray-700">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Availability Schedule */}
            {doctor.availability && Object.keys(doctor.availability).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Availability</h2>
                <div className="space-y-3">
                  {Object.entries(doctor.availability).map(([day, schedule]: [string, any]) => (
                    <div key={day}>
                      {schedule.enabled && schedule.slots && schedule.slots.length > 0 && (
                        <div className="border-l-4 border-blue-500 pl-4 py-2">
                          <h3 className="font-semibold text-gray-800 mb-2">{day}</h3>
                          <div className="flex flex-wrap gap-2">
                            {schedule.slots.map((slot: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                              >
                                <Clock size={14} />
                                {slot}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="space-y-4 mb-6">
                {doctor.consultationFee && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Consultation Fee</span>
                    <span className="text-2xl font-bold text-gray-900">${doctor.consultationFee}</span>
                  </div>
                )}

                {doctor.languages && doctor.languages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Languages className="text-blue-600 mt-1" size={20} />
                    <div>
                      <p className="text-gray-700 font-medium mb-1">Languages</p>
                      <p className="text-gray-600 text-sm">{doctor.languages.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Calendar size={20} />
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h2>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Select Date *</label>
                <select
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Choose a date</option>
                  {availableDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Select Time *</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Choose a time</option>
                  {availableTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Describe your symptoms *</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Tell the doctor about your symptoms..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
