'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PatientNav } from '@/components/PatientNav';
import { Calendar, Clock, Video, Search } from 'lucide-react';
import { Notification, Appointment } from '@/types';

export default function PatientDashboardPage() {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'approved',
      message: 'Dr. Sarah Smith approved your appointment for Dec 10, 2024',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'reminder',
      message: 'Upcoming appointment with Dr. Michael Brown in 10 minutes',
      time: '10 minutes ago',
      read: false
    },
    {
      id: '3',
      type: 'rescheduled',
      message: 'Dr. Emily Davis rescheduled your appointment to Dec 12, 2024',
      time: '2 hours ago',
      read: true
    }
  ]);

  const upcomingAppointments: Appointment[] = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Smith',
      specialty: 'Cardiology',
      date: 'Dec 10, 2024',
      time: '2:00 PM',
      status: 'approved',
      meetLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Brown',
      specialty: 'Dermatology',
      date: 'Dec 8, 2024',
      time: '11:00 AM',
      status: 'approved',
      meetLink: 'https://meet.google.com/xyz-uvwx-rst'
    },
    {
      id: '3',
      doctorName: 'Dr. Emily Davis',
      specialty: 'Pediatrics',
      date: 'Dec 12, 2024',
      time: '10:00 AM',
      status: 'pending'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNav notifications={notifications} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Manage your health appointments and find doctors</p>
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

          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                  <p className="text-sm text-gray-600">{appointment.specialty}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {appointment.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {appointment.time}
                    </span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                  {appointment.status === 'approved' && appointment.meetLink ? (
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
                    <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      appointment.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appointment.status === 'approved' ? 'Approved' : 'Pending'}
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
