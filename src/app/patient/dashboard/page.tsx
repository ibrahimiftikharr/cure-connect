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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <PatientNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Welcome Back, {user?.name?.split(' ')[0] || 'Patient'}!</h1>
          <p className="text-gray-600 text-lg">Manage your health appointments and find doctors</p>
        </div>

        {/* Notifications Card */}
        <div className="mb-10">
          <NotificationCard notifications={notifications} onUpdate={fetchNotifications} />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Link
            href="/patient/search"
            className="group relative overflow-hidden bg-white rounded-2xl p-8 hover:shadow-elegant-lg transition-all border border-gray-100"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Search size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Doctors</h3>
              <p className="text-gray-600">Search for specialists in your area</p>
            </div>
          </Link>

          <Link
            href="/patient/appointments"
            className="group relative overflow-hidden bg-white rounded-2xl p-8 hover:shadow-elegant-lg transition-all border border-gray-100"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Calendar size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">My Appointments</h3>
              <p className="text-gray-600">View and manage your appointments</p>
            </div>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-elegant border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
            <Link
              href="/patient/appointments"
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all"
            >
              View All
            </Link>
          </div>

          {loadingAppointments ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map(appointment => (
                <div
                  key={appointment._id}
                  className="flex flex-col p-6 border border-gray-100 rounded-xl hover:shadow-elegant transition-all bg-gradient-to-br from-white to-gray-50/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar size={24} className="text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{appointment.doctorInfo.name}</h3>
                          <p className="text-sm text-indigo-600 font-medium">{appointment.doctorInfo.specialty}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 ml-15">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                          <Calendar size={16} className="text-indigo-600" />
                          {moment(appointment.appointmentDate).format('MMM D, YYYY')}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                          <Clock size={16} className="text-indigo-600" />
                          {moment(appointment.appointmentTime, 'HH:mm').format('h:mm A')}
                        </span>
                        <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                          {appointment.timeSlot}
                        </span>
                      </div>
                      {appointment.symptoms && (
                        <p className="text-sm text-gray-700 mt-3 ml-15 px-4 py-2 bg-white rounded-lg border border-gray-100">
                          <strong className="text-gray-900">Symptoms:</strong> {appointment.symptoms}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center gap-3 flex-shrink-0">
                      {appointment.meetLink ? (
                        <a
                          href={appointment.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
                        >
                          <Video size={18} />
                          Join Call
                        </a>
                      ) : (
                        <span className="px-5 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold">
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={40} className="text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">No upcoming appointments</p>
              <p className="text-gray-500 text-sm mb-6">Book your first consultation with our specialists</p>
              <Link
                href="/patient/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <Search size={18} />
                Find a Doctor
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
