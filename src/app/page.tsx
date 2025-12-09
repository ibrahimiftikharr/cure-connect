'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Calendar, Video, Shield, Clock, Users } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (user) {
      if (user.role === 'doctor') {
        router.push(user.profileComplete ? '/doctor/dashboard' : '/doctor/profile');
      } else if (user.role === 'patient') {
        router.push('/patient/dashboard');
      }
    }
  }, [user, router]);

  // If user is authenticated, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
              <Heart className="text-white" size={24} />
            </div>
            <span className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CureConnect
            </span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-6 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Healthcare Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with qualified doctors instantly. Book appointments, manage schedules, and attend virtual consultations—all in one place.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
          Why Choose CureConnect?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Calendar,
              title: 'Easy Scheduling',
              description: 'Book appointments with just a few clicks. View real-time availability and get instant confirmations.',
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              icon: Video,
              title: 'Virtual Consultations',
              description: 'Attend appointments from anywhere with integrated Google Meet video calls.',
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              icon: Users,
              title: 'Find Specialists',
              description: 'Search and filter doctors by specialty, location, and symptoms to find the perfect match.',
              gradient: 'from-green-500 to-emerald-500'
            },
            {
              icon: Clock,
              title: 'Real-time Updates',
              description: 'Get instant notifications for appointment confirmations, reschedules, and reminders.',
              gradient: 'from-orange-500 to-red-500'
            },
            {
              icon: Shield,
              title: 'Secure & Private',
              description: 'Your health data is protected with industry-standard security measures.',
              gradient: 'from-indigo-500 to-blue-500'
            },
            {
              icon: Heart,
              title: 'Patient-Centered Care',
              description: 'Designed with both patients and doctors in mind for a seamless healthcare experience.',
              gradient: 'from-pink-500 to-rose-500'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-xl inline-block mb-4`}>
                <feature.icon className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of patients and doctors already using CureConnect
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 font-semibold"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
              <Heart className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold">CureConnect</span>
          </div>
          <p className="text-gray-400">
            © 2024 CureConnect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
