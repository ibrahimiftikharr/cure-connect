'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PatientNav } from '@/components/PatientNav';
import { NotificationCard } from '@/components/NotificationCard';
import { Calendar, Clock, Video, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import notificationService from '@/lib/notificationService';
import appointmentService from '@/lib/appointmentService';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import moment from 'moment';

interface AppointmentData {
  _id: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  timeSlot: string;
  symptoms: string;
  status: string;
  meetLink?: string;
  doctorInfo: {
    name: string;
    specialty: string;
    consultationFee?: number;
    phone?: string;
  };
}

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await appointmentService.getAppointments('approved');
      const upcoming = response.appointments
        .filter((apt: AppointmentData) => {
          const aptDate = moment(apt.appointmentDate);
          return aptDate.isSameOrAfter(moment(), 'day');
        })
        .sort((a: AppointmentData, b: AppointmentData) => {
          return moment(a.appointmentDate).diff(moment(b.appointmentDate));
        })
        .slice(0, 3);
      setAppointments(upcoming);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUpcomingAppointments();
    }
  }, [user]);

  useNotificationSocket(user?.id || '', (notification) => {
    setNotifications(prev => [notification, ...prev]);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Manage your health appointments and find doctors</p>
        </div>

        {/* Notifications Card */}
        <div className="mb-8">
          <NotificationCard notifications={notifications} onUpdate={fetchNotifications} />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/patient/search"
            className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white hover:shadow-xl transition-all group"
          >
            <Search size={32} className="mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">Find Doctors</h3>
            <p className="opacity-90">Search for specialists in your area</p>
          </Link>

          <Link
            href="/patient/appointments"
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white hover:shadow-xl transition-all group"
          >
            <Calendar size={32} className="mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold mb-2">My Appointments</h3>
            <p className="opacity-90">View and manage your appointments</p>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
            <Link
              href="/patient/appointments"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View All
            </Link>
          </div>

          {loadingAppointments ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map(appointment => (
                <div
                  key={appointment._id}
                  className="flex flex-col p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{appointment.doctorInfo.name}</h3>
                      <p className="text-sm text-gray-600">{appointment.doctorInfo.specialty}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {moment(appointment.appointmentDate).format('MMM D, YYYY')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {moment(appointment.appointmentTime, 'HH:mm').format('h:mm A')}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {appointment.timeSlot}
                        </span>
                      </div>
                      {appointment.symptoms && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Symptoms:</strong> {appointment.symptoms}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center gap-3">
                      {appointment.meetLink ? (
                        <a
                          href={appointment.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Video size={16} />
                          Join Call
                        </a>
                      ) : (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600">No upcoming appointments</p>
              <Link
                href="/patient/search"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
              >
                Find a doctor
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
