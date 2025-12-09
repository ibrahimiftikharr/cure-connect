'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PatientNav } from '@/components/PatientNav';
import { Avatar } from '@/components/Avatar';
import { MapPin, Star, Calendar, ArrowLeft, Award, Languages, DollarSign, Clock } from 'lucide-react';
import authService from '@/lib/authService';
import appointmentService from '@/lib/appointmentService';
import moment from 'moment-timezone';

export default function DoctorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSlot, setBookingSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const getDayOfWeek = (dateString: string) => {
    return moment(dateString).format('dddd');
  };

  const formatSlotWithAmPm = (slot: string): string => {
    // Check if slot already has AM/PM
    if (slot.includes('AM') || slot.includes('PM')) {
      return slot;
    }
    
    // Parse and format slot that doesn't have AM/PM (e.g., "09:00 - 10:00")
    const parts = slot.split(' - ');
    if (parts.length === 2) {
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
      };
      return `${formatTime(parts[0])} - ${formatTime(parts[1])}`;
    }
    return slot;
  };

  const getAvailableSlots = () => {
    if (!doctor?.availability || !bookingDate) return [];
    const dayOfWeek = getDayOfWeek(bookingDate);
    const daySchedule = doctor.availability[dayOfWeek];
    if (daySchedule && daySchedule.enabled && daySchedule.slots) {
      return daySchedule.slots.map((slot: string) => formatSlotWithAmPm(slot));
    }
    return [];
  };

  const getAvailableDates = () => {
    if (!doctor?.availability) return [];
    const dates = [];
    const today = moment().tz('Asia/Karachi');
    
    for (let i = 0; i < 30; i++) {
      const date = today.clone().add(i, 'days');
      const dayOfWeek = date.format('dddd');
      const daySchedule = doctor.availability[dayOfWeek];
      
      if (daySchedule && daySchedule.enabled && daySchedule.slots && daySchedule.slots.length > 0) {
        dates.push(date.format('YYYY-MM-DD'));
      }
    }
    return dates;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingDate || !bookingTime || !bookingSlot || !symptoms.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Validate time is within slot
    const [slotStart, slotEnd] = bookingSlot.split(' - ');
    const selectedTime = moment(bookingTime, 'HH:mm');
    const slotStartTime = moment(slotStart, 'hh:mm A');
    const slotEndTime = moment(slotEnd, 'hh:mm A');

    if (!selectedTime.isBetween(slotStartTime, slotEndTime, null, '[)')) {
      alert(`Please select a time between ${slotStart} and ${slotEnd}`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      await appointmentService.bookAppointment({
        doctorId: params.id as string,
        appointmentDate: bookingDate,
        appointmentTime: bookingTime,
        timeSlot: bookingSlot,
        symptoms: symptoms.trim(),
      });
      
      alert('Appointment booked successfully! The doctor will review and approve it.');
      setShowBookingModal(false);
      setBookingDate('');
      setBookingTime('');
      setBookingSlot('');
      setSymptoms('');
      router.push('/patient/appointments');
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to book appointment. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlotChange = (slot: string) => {
    setBookingSlot(slot);
    // Clear the time when slot changes so user enters their preferred time
    setBookingTime('');
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
          <div className="bg-white rounded-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h2>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Select Date *</label>
                <select
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setBookingSlot('');
                    setBookingTime('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Choose a date</option>
                  {getAvailableDates().map((date: string) => (
                    <option key={date} value={date}>
                      {moment(date).format('MMM D, YYYY')} ({getDayOfWeek(date)})
                    </option>
                  ))}
                </select>
              </div>

              {bookingDate && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Select Time Slot *</label>
                  <select
                    value={bookingSlot}
                    onChange={(e) => handleSlotChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Choose a time slot</option>
                    {getAvailableSlots().map((slot: string) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              )}

              {bookingSlot && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Enter Exact Time *</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Please select a time within your chosen slot: {bookingSlot}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">Describe your symptoms *</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Tell the doctor about your symptoms..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingDate('');
                    setBookingTime('');
                    setBookingSlot('');
                    setSymptoms('');
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Booking...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
