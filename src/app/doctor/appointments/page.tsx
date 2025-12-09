'use client';

import { useState, useEffect, useCallback } from 'react';
import { DoctorNav } from '@/components/DoctorNav';
import { Calendar, Clock, Video, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import appointmentService from '@/lib/appointmentService';
import { useSocket } from '@/hooks/useSocket';
import moment from 'moment-timezone';

interface AppointmentData {
  _id: string;
  patient: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  timeSlot: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  symptoms: string;
  rejectionReason?: string;
  meetLink?: string;
  patientInfo: {
    name: string;
    email: string;
    phone: string;
  };
  doctorInfo: {
    name: string;
    email: string;
    specialty: string;
    consultationFee: number;
  };
}

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ show: boolean; appointmentId: string }>({ show: false, appointmentId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [approveModal, setApproveModal] = useState<{ show: boolean; appointmentId: string }>({ show: false, appointmentId: '' });
  const [meetLink, setMeetLink] = useState('');
  const [meetLinkError, setMeetLinkError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments(filter === 'all' ? undefined : filter);
      setAppointments(response.appointments || []);
    } catch (error: any) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, filter]);

  const handleSocketEvent = useCallback((event: string, data: any) => {
    console.log('Socket event:', event, data);
    fetchAppointments();
  }, [filter]);

  useSocket(user?.id || '', 'doctor', handleSocketEvent);

  const handleApprove = async (appointmentId: string) => {
    setApproveModal({ show: true, appointmentId });
    setMeetLink('');
    setMeetLinkError('');
  };

  const validateAndApprove = async () => {
    // Validate Google Meet link
    const googleMeetRegex = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
    if (!meetLink.trim()) {
      setMeetLinkError('Please enter a Google Meet link');
      return;
    }
    if (!googleMeetRegex.test(meetLink)) {
      setMeetLinkError('Invalid format. Expected: https://meet.google.com/xxx-yyyy-zzz');
      return;
    }

    try {
      setProcessingId(approveModal.appointmentId);
      await appointmentService.approveAppointment(approveModal.appointmentId, meetLink);
      setApproveModal({ show: false, appointmentId: '' });
      setMeetLink('');
      fetchAppointments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      setProcessingId(rejectModal.appointmentId);
      await appointmentService.rejectAppointment(rejectModal.appointmentId, rejectReason);
      setRejectModal({ show: false, appointmentId: '' });
      setRejectReason('');
      fetchAppointments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (appointmentId: string) => {
    if (!confirm('Mark this appointment as completed?')) return;
    try {
      setProcessingId(appointmentId);
      await appointmentService.completeAppointment(appointmentId);
      fetchAppointments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to complete appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format('MMM D, YYYY');
  };

  const formatTime = (timeString: string) => {
    return moment(timeString, 'HH:mm').format('h:mm A');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DoctorNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Appointments</h1>
          <p className="text-gray-600">View and manage all your patient appointments</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter size={20} className="text-gray-600" />
            {(['all', 'pending', 'approved', 'rejected', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No appointments found</p>
            </div>
          ) : (
            appointments.map(appointment => (
              <div
                key={appointment._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {appointment.patientInfo.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {formatDate(appointment.appointmentDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {formatTime(appointment.appointmentTime)}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                        {appointment.timeSlot}
                      </span>
                    </div>
                    {appointment.symptoms && (
                      <p className="text-gray-700 mt-2">
                        <strong>Symptoms:</strong> {appointment.symptoms}
                      </p>
                    )}
                    {appointment.rejectionReason && (
                      <p className="text-red-700 mt-2">
                        <strong>Rejection Reason:</strong> {appointment.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      appointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>

                    {appointment.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApprove(appointment._id)}
                          disabled={processingId === appointment._id}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {processingId === appointment._id ? 'Processing...' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => setRejectModal({ show: true, appointmentId: appointment._id })}
                          disabled={processingId === appointment._id}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {appointment.status === 'approved' && (
                      <>
                        {appointment.meetLink && (
                          <a
                            href={appointment.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Video size={16} />
                            Join Call
                          </a>
                        )}
                        <button
                          onClick={() => handleComplete(appointment._id)}
                          disabled={processingId === appointment._id}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {processingId === appointment._id ? 'Processing...' : 'Mark Complete'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reject Appointment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Reason for Rejection *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  placeholder="Please explain why you're rejecting this appointment..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModal({ show: false, appointmentId: '' });
                    setRejectReason('');
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={processingId !== null}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processingId !== null}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {processingId ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Approve Appointment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Google Meet Link *</label>
                <input
                  type="text"
                  value={meetLink}
                  onChange={(e) => {
                    setMeetLink(e.target.value);
                    setMeetLinkError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                />
                {meetLinkError && (
                  <p className="text-red-600 text-sm mt-2">{meetLinkError}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Go to <a href="https://meet.google.com/landing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">meet.google.com/landing</a> to create a meeting link
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setApproveModal({ show: false, appointmentId: '' });
                    setMeetLink('');
                    setMeetLinkError('');
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={processingId !== null}
                >
                  Cancel
                </button>
                <button
                  onClick={validateAndApprove}
                  disabled={processingId !== null}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {processingId ? 'Approving...' : 'Approve & Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
