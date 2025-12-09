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
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {appointment.doctorInfo.name}
                    </h3>
                    <p className="text-gray-600 mb-3">{appointment.doctorInfo.specialty}</p>
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
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
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
    </div>
  );
}
