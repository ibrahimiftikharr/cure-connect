'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Bell, Menu, X, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/Avatar';
import notificationService from '@/lib/notificationService';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import moment from 'moment';

interface NotificationData {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function DoctorNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useNotificationSocket(user?.id || '', (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const navLinks = [
    { href: '/doctor/dashboard', label: 'Dashboard' },
    { href: '/doctor/profile', label: 'Profile' },
    { href: '/doctor/appointments', label: 'Appointments' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/doctor/dashboard" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all">
              <Heart className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block tracking-tight">
              CureConnect
              <span className="text-sm font-normal text-gray-500 ml-2">Doctor</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Notifications */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-semibold shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-elegant-lg border border-gray-100 overflow-hidden z-50 animate-scale-in">
                    <div className="p-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white flex justify-between items-center">
                      <h3 className="font-semibold text-base">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all font-medium"
                        >
                          <Check size={14} />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notif => (
                          <div
                            key={notif._id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              !notif.read ? 'bg-purple-50' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                <p className="text-sm text-gray-700 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {moment(notif.createdAt).fromNow()}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                {!notif.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notif._id)}
                                    className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                                    title="Mark as read"
                                  >
                                    <Check size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notif._id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile Avatar */}
            <Link href="/doctor/profile" className="flex items-center gap-2">
              <Avatar
                name={user?.name || 'Doctor'}
                imageUrl={user?.profilePicture?.url}
                size="sm"
              />
              <span className="text-sm text-gray-700 font-medium hidden lg:block">
                {user?.name}
              </span>
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-purple-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 px-4 rounded-lg transition-colors ${
                  pathname === link.href
                    ? 'bg-purple-50 text-purple-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="block w-full text-left py-2 px-4 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
