'use client';

import { useState, useEffect, useCallback } from 'react';
import { PatientNav } from '@/components/PatientNav';
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
    profilePicture?: string | null;
  };
}

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments(filter === 'all' ? undefined : filter);
      const sortedAppointments = (response.appointments || []).sort((a: AppointmentData, b: AppointmentData) => {
        // Sort by date descending (latest first), then by time descending
        const dateCompare = moment(b.appointmentDate).diff(moment(a.appointmentDate));
        if (dateCompare !== 0) return dateCompare;
        return moment(b.appointmentTime, 'HH:mm').diff(moment(a.appointmentTime, 'HH:mm'));
      });
      setAppointments(sortedAppointments);
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

  useSocket(user?.id || '', 'patient', handleSocketEvent);

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
        <PatientNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">View and manage all your appointments</p>
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-elegant border border-gray-100 p-12 text-center">
              <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg font-medium">No appointments found</p>
            </div>
          ) : (
            appointments.map(appointment => (
              <div
                key={appointment._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden transition-all"
              >
                {/* Status Badge */}
                <div className="flex justify-end p-3 pb-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md ${
                    appointment.status === 'pending' ? 'bg-yellow-500' :
                    appointment.status === 'approved' ? 'bg-green-500' :
                    appointment.status === 'rejected' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>

                {/* Card Body */}
                <div className="px-4 pb-4 pt-2 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-xl bg-white shadow-lg border border-gray-200 p-0.5 mb-3">
                    {appointment.doctorInfo?.profilePicture ? (
                      <img 
                        src={appointment.doctorInfo.profilePicture} 
                        alt={appointment.doctorInfo.name || 'Doctor'}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                        {appointment.doctorInfo?.name?.charAt(0)?.toUpperCase() || 'D'}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5 line-clamp-1">
                    {appointment.doctorInfo?.name || 'Doctor'}
                  </h3>
                  <p className="text-indigo-600 font-medium text-xs mb-3 line-clamp-1">{appointment.doctorInfo?.specialty || 'General'}</p>
                  
                  <div className="space-y-2 mb-3 w-full">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} className="text-indigo-600" />
                      </div>
                      <span className="font-medium">{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-purple-600" />
                      </div>
                      <span className="font-medium">{formatTime(appointment.appointmentTime)}</span>
                    </div>
                    <div className="px-3 py-2 bg-indigo-50 rounded-lg">
                      <span className="text-xs font-bold text-indigo-700">{appointment.timeSlot}</span>
                    </div>
                  </div>

                  {appointment.symptoms && (
                    <div className="mb-2 p-2 bg-gray-50 rounded-lg w-full">
                      <p className="text-xs font-semibold text-gray-700">Symptoms:</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{appointment.symptoms}</p>
                    </div>
                  )}

                  {appointment.rejectionReason && (
                    <div className="mb-2 p-2 bg-red-50 rounded-lg border border-red-100 w-full">
                      <p className="text-xs font-semibold text-red-700">Rejection Reason:</p>
                      <p className="text-xs text-red-600 line-clamp-1">{appointment.rejectionReason}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {appointment.status === 'approved' && (
                    <div className="space-y-1.5 w-full">
                      {appointment.meetLink && (
                        <a
                          href={appointment.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all text-xs font-bold"
                        >
                          <Video size={14} />
                          Join Call
                        </a>
                      )}
                      <button
                        onClick={() => handleComplete(appointment._id)}
                        disabled={processingId === appointment._id}
                        className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === appointment._id ? 'Processing...' : 'Mark Complete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
