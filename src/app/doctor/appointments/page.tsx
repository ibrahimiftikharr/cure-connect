'use client';

import { useState } from 'react';
import { DoctorNav } from '@/components/DoctorNav';
import { Calendar, Clock, Video, Filter } from 'lucide-react';
import { Appointment } from '@/types';

export default function DoctorAppointmentsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  const appointments: Appointment[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      date: 'Dec 8, 2024',
      time: '10:00 AM',
      type: 'Consultation',
      status: 'pending',
      symptoms: 'Chest pain, shortness of breath'
    },
    {
      id: '2',
      patientName: 'Michael Chen',
      date: 'Dec 8, 2024',
      time: '11:30 AM',
      type: 'Follow-up',
      status: 'approved',
      meetLink: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: '3',
      patientName: 'Emma Wilson',
      date: 'Dec 8, 2024',
      time: '2:00 PM',
      type: 'Consultation',
      status: 'approved',
      meetLink: 'https://meet.google.com/xyz-uvwx-rst',
      symptoms: 'Recurring headaches'
    },
    {
      id: '4',
      patientName: 'James Brown',
      date: 'Dec 7, 2024',
      time: '9:00 AM',
      type: 'Consultation',
      status: 'completed'
    },
  ];

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter);

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
            {(['all', 'pending', 'approved', 'completed'] as const).map((status) => (
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
          {filteredAppointments.map(appointment => (
            <div
              key={appointment.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {appointment.patientName}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {appointment.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {appointment.time}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                      {appointment.type}
                    </span>
                  </div>
                  {appointment.symptoms && (
                    <p className="text-gray-700 mt-2">
                      <strong>Symptoms:</strong> {appointment.symptoms}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium text-center ${
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    appointment.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>

                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        Approve
                      </button>
                      <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                        Reject
                      </button>
                    </div>
                  )}

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
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
