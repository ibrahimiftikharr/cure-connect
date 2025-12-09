'use client';

import { useState } from 'react';
import { DoctorNav } from '@/components/DoctorNav';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Notification, Appointment } from '@/types';

export default function DoctorDashboardPage() {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      message: 'New appointment request from Sarah Johnson for Dec 8, 2024',
      time: '2 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'reminder',
      message: 'Upcoming appointment with Michael Chen in 10 minutes',
      time: '10 minutes ago',
      read: false
    },
    {
      id: '3',
      type: 'booking',
      message: 'Emma Wilson requested to reschedule appointment',
      time: '1 hour ago',
      read: true
    }
  ]);

  const stats = {
    totalAppointments: 48,
    pendingApprovals: 5,
    todayAppointments: 8,
    completedToday: 3
  };

  const upcomingAppointments: Appointment[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      time: '10:00 AM',
      date: 'Dec 8, 2024',
      type: 'Consultation',
      status: 'pending'
    },
    {
      id: '2',
      patientName: 'Michael Chen',
      time: '11:30 AM',
      date: 'Dec 8, 2024',
      type: 'Follow-up',
      status: 'approved'
    },
    {
      id: '3',
      patientName: 'Emma Wilson',
      time: '2:00 PM',
      date: 'Dec 8, 2024',
      type: 'Consultation',
      status: 'approved'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNav notifications={notifications} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back, Doctor!</h1>
          <p className="text-gray-600">Here&apos;s your practice overview for today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-blue-600" size={24} />
              <span className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</span>
            </div>
            <p className="text-gray-600">Total Appointments</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-orange-600" size={24} />
              <span className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</span>
            </div>
            <p className="text-gray-600">Pending Approvals</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="text-green-600" size={24} />
              <span className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</span>
            </div>
            <p className="text-gray-600">Today&apos;s Appointments</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="text-purple-600" size={24} />
              <span className="text-2xl font-bold text-gray-900">{stats.completedToday}</span>
            </div>
            <p className="text-gray-600">Completed Today</p>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {appointment.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {appointment.time}
                    </span>
                    <span>{appointment.type}</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                  {appointment.status === 'pending' ? (
                    <>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
