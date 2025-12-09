'use client';

import { useState, useEffect } from 'react';
import { DoctorNav } from '@/components/DoctorNav';
import { NotificationCard } from '@/components/NotificationCard';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import notificationService from '@/lib/notificationService';
import appointmentService from '@/lib/appointmentService';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import moment from 'moment';
import Link from 'next/link';

interface AppointmentData {
  _id: string;
  patient: string;
  appointmentDate: string;
  appointmentTime: string;
  timeSlot: string;
  symptoms: string;
  status: string;
  patientInfo: {
    name: string;
    phone?: string;
  };
}

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingApprovals: 0,
    todayAppointments: 0,
    completedToday: 0
  });

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      setLoadingStats(true);
      const response = await appointmentService.getAppointments();
      const allAppointments = response.appointments || [];

      // Calculate stats
      const pending = allAppointments.filter((apt: AppointmentData) => apt.status === 'pending').length;
      const today = moment().startOf('day');
      const todayApts = allAppointments.filter((apt: AppointmentData) => {
        const aptDate = moment(apt.appointmentDate).startOf('day');
        return aptDate.isSame(today, 'day');
      }).length;
      const completedToday = allAppointments.filter((apt: AppointmentData) => {
        const aptDate = moment(apt.appointmentDate).startOf('day');
        return aptDate.isSame(today, 'day') && apt.status === 'completed';
      }).length;

      setStats({
        totalAppointments: allAppointments.length,
        pendingApprovals: pending,
        todayAppointments: todayApts,
        completedToday: completedToday
      });

      // Get upcoming appointments (approved only, future dates)
      const upcoming = allAppointments
        .filter((apt: AppointmentData) => {
          const aptDate = moment(apt.appointmentDate);
          return apt.status === 'approved' && aptDate.isSameOrAfter(moment(), 'day');
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
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchAppointments();
    }
  }, [user]);

  useNotificationSocket(user?.id || '', (notification) => {
    setNotifications(prev => [notification, ...prev]);
    fetchAppointments(); // Refresh appointments on new notification
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back, Doctor!</h1>
          <p className="text-gray-600">Here&apos;s your practice overview for today</p>
        </div>

        {/* Notifications Card */}
        <div className="mb-8">
          <NotificationCard notifications={notifications} onUpdate={fetchNotifications} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-blue-600" size={24} />
              {loadingStats ? (
                <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</span>
              )}
            </div>
            <p className="text-gray-600">Total Appointments</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-orange-600" size={24} />
              {loadingStats ? (
                <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</span>
              )}
            </div>
            <p className="text-gray-600">Pending Approvals</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="text-green-600" size={24} />
              {loadingStats ? (
                <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</span>
              )}
            </div>
            <p className="text-gray-600">Today&apos;s Appointments</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="text-purple-600" size={24} />
              {loadingStats ? (
                <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
              ) : (
                <span className="text-2xl font-bold text-gray-900">{stats.completedToday}</span>
              )}
            </div>
            <p className="text-gray-600">Completed Today</p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
            <Link
              href="/doctor/appointments"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              View All
            </Link>
          </div>

          {loadingAppointments ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                      <h3 className="font-semibold text-gray-900">{appointment.patientInfo.name}</h3>
                      {appointment.patientInfo.phone && (
                        <p className="text-sm text-gray-600">📞 {appointment.patientInfo.phone}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {moment(appointment.appointmentDate).format('MMM D, YYYY')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {moment(appointment.appointmentTime, 'HH:mm').format('h:mm A')}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {appointment.timeSlot}
                        </span>
                      </div>
                      {appointment.symptoms && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Symptoms:</strong> {appointment.symptoms}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-0">
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        Approved
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600">No upcoming appointments</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
