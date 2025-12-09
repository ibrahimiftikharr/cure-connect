'use client';

import { useState } from 'react';
import { PatientNav } from '@/components/PatientNav';
import { Calendar, Clock, Video, Filter } from 'lucide-react';
import { Appointment } from '@/types';

export default function PatientAppointmentsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  const appointments: Appointment[] = [
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
    },
    {
      id: '4',
      doctorName: 'Dr. James Wilson',
      specialty: 'Orthopedics',
      date: 'Dec 5, 2024',
      time: '3:00 PM',
      status: 'completed'
    },
  ];

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter);

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
            {(['all', 'pending', 'approved', 'completed'] as const).map((status) => (
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
          {filteredAppointments.map(appointment => (
            <div
              key={appointment.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {appointment.doctorName}
                  </h3>
                  <p className="text-gray-600 mb-3">{appointment.specialty}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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

                <div className="flex flex-col gap-2">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    appointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>

                  {appointment.status === 'approved' && appointment.meetLink && (
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

                  {appointment.status === 'pending' && (
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
