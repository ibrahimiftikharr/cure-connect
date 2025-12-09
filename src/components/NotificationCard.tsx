'use client';

import { Bell, Check, Trash2, Calendar, Clock } from 'lucide-react';
import moment from 'moment';
import notificationService from '@/lib/notificationService';

interface NotificationCardProps {
  notifications: any[];
  onUpdate: () => void;
}

export function NotificationCard({ notifications, onUpdate }: NotificationCardProps) {
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      onUpdate();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      onUpdate();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_booked':
        return <Calendar size={20} className="text-blue-600" />;
      case 'appointment_approved':
        return <Check size={20} className="text-green-600" />;
      case 'appointment_rejected':
        return <Trash2 size={20} className="text-red-600" />;
      case 'appointment_completed':
        return <Clock size={20} className="text-purple-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bell size={24} className="text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Recent Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            <Check size={16} />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.slice(0, 10).map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-lg border transition-all ${
                !notif.read
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {notif.title}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {moment(notif.createdAt).fromNow()}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No notifications yet</p>
            <p className="text-sm mt-1">You'll see updates about your appointments here</p>
          </div>
        )}
      </div>
    </div>
  );
}
