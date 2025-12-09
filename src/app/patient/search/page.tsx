'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PatientNav } from '@/components/PatientNav';
import { Avatar } from '@/components/Avatar';
import { Search, MapPin, Star, Filter, Loader2, DollarSign } from 'lucide-react';
import { authService } from '@/lib/authService';

interface DoctorData {
  id: string;
  name: string;
  email: string;
  profilePicture?: { url: string; publicId: string };
  specialty: string;
  qualifications: string;
  specializations: string[];
  yearsOfExperience?: number;
  consultationFee?: number;
  city: string;
  state: string;
  clinicName?: string;
  languages?: string[];
  rating?: number;
  reviewCount?: number;
}

export default function SearchDoctorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const specialties = [
    'All Specialties',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Psychiatry',
    'General Medicine',
    'ENT',
    'Ophthalmology',
    'Gynecology',
    'Oncology',
    'Radiology'
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async (filters?: any) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.searchDoctors({
        ...filters,
        specialty: selectedSpecialty && selectedSpecialty !== 'All Specialties' ? selectedSpecialty : undefined,
        city: selectedCity && selectedCity !== 'All Cities' ? selectedCity : undefined,
        name: searchQuery || undefined,
      });

      if (response.success) {
        setDoctors(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchDoctors();
  };

  // Get unique cities from doctors for filter
  const cities = ['All Cities', ...Array.from(new Set(doctors.map(d => d.city).filter(Boolean)))];

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Doctors</h1>
          <p className="text-gray-600">Search for qualified doctors with complete profiles</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by doctor name..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : (
          <>
            {/* Results */}
            <div className="mb-4">
              <p className="text-gray-600">
                Found <strong>{doctors.length}</strong> {doctors.length === 1 ? 'doctor' : 'doctors'}
              </p>
            </div>

            {/* Doctors Grid */}
            {doctors.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doctor => (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => router.push(`/patient/doctor/${doctor.id}`)}
                  >
                    <div className="p-6">
                      {/* Circular Avatar */}
                      <div className="flex flex-col items-center mb-4">
                        <Avatar
                          name={doctor.name}
                          imageUrl={doctor.profilePicture?.url}
                          size="xl"
                          className="mb-3"
                        />
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{doctor.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-gray-500 text-sm">({doctor.reviewCount || 0} reviews)</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-1 text-center">{doctor.name}</h3>
                      <p className="text-blue-600 font-medium mb-2 text-center">{doctor.specialty}</p>
                      <p className="text-gray-600 text-sm mb-3 text-center">{doctor.qualifications}</p>
                      
                      {doctor.specializations && doctor.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                          {doctor.specializations.slice(0, 3).map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2 mb-4">
                        {doctor.yearsOfExperience && (
                          <p className="text-gray-700 text-sm flex items-center justify-center gap-2">
                            <strong>Experience:</strong> {doctor.yearsOfExperience} years
                          </p>
                        )}
                        
                        {doctor.city && (
                          <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
                            <MapPin size={14} />
                            {doctor.city}{doctor.state ? `, ${doctor.state}` : ''}
                          </p>
                        )}

                        {doctor.consultationFee && (
                          <p className="text-green-600 font-semibold flex items-center justify-center gap-1">
                            <DollarSign size={16} />
                            ${doctor.consultationFee}
                          </p>
                        )}
                      </div>

                      <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-2">No doctors found</p>
                <p className="text-gray-400">Try adjusting your search filters</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
