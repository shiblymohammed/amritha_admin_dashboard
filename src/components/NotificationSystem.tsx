// _file: admin_dashboard/src/components/NotificationSystem.tsx_
import { useState, useEffect, useCallback } from 'react';
import type { NotificationItem } from '../types';
import { bookingApi } from '../api/bookingApi';
import { 
  FiBell, 
  FiX, 
  FiCheck, 
  FiCalendar, 
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiSettings
} from 'react-icons/fi';

interface NotificationSystemProps {
  onNewBooking?: (booking: any) => void;
}

function NotificationSystem({ onNewBooking }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // Simulate real-time notifications by polling for new bookings
  const checkForNewBookings = useCallback(async () => {
    if (!isEnabled) return;

    try {
      const recentBookings = await bookingApi.getRecentBookings();
      const newBookings = recentBookings.filter(booking => 
        new Date(booking.booking_date) > lastChecked
      );

      if (newBookings.length > 0) {
        const newNotifications: NotificationItem[] = newBookings.map(booking => ({
          id: `booking-${booking.id}-${Date.now()}`,
          type: 'booking',
          title: 'New Booking Received',
          message: `${booking.full_name} booked ${booking.selected_rooms?.length || 1} room(s) for ${booking.check_in}`,
          timestamp: new Date().toISOString(),
          read: false,
          data: booking
        }));

        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);
        setLastChecked(new Date());

        // Play notification sound
        if (soundEnabled) {
          playNotificationSound();
        }

        // Call callback for new bookings
        newBookings.forEach(booking => {
          onNewBooking?.(booking);
        });

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          newBookings.forEach(booking => {
            new Notification('New Hotel Booking', {
              body: `${booking.full_name} booked a room for ${booking.check_in}`,
              icon: '/favicon.ico',
              tag: `booking-${booking.id}`
            });
          });
        }
      }
    } catch (error: any) {
      console.error('Error checking for new bookings:', error);
      
      // Handle authentication errors gracefully
      if (error.response?.status === 401) {
        console.log('Authentication required for checking new bookings');
        return;
      }
      
      // For other errors, you might want to show a notification
      // but avoid spamming the user with error notifications
    }
  }, [isEnabled, lastChecked, soundEnabled, onNewBooking]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Poll for new bookings every 30 seconds
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(checkForNewBookings, 30000);
    return () => clearInterval(interval);
  }, [checkForNewBookings, isEnabled]);

  // Initial load of recent notifications
  useEffect(() => {
    const loadInitialNotifications = async () => {
      try {
        const recentBookings = await bookingApi.getRecentBookings();
        const initialNotifications: NotificationItem[] = recentBookings
          .slice(0, 10) // Show last 10 bookings as notifications
          .map(booking => ({
            id: `initial-${booking.id}`,
            type: 'booking',
            title: 'Recent Booking',
            message: `${booking.full_name} booked ${booking.selected_rooms?.length || 1} room(s)`,
            timestamp: booking.booking_date,
            read: true,
            data: booking
          }));

        setNotifications(initialNotifications);
      } catch (error: any) {
        console.error('Error loading initial notifications:', error);
        
        // Handle authentication errors gracefully
        if (error.response?.status === 401) {
          console.log('Authentication required for notifications');
          // Show a helpful message about authentication
          const authNotification: NotificationItem = {
            id: `auth-info-${Date.now()}`,
            type: 'system',
            title: 'Notifications Ready',
            message: 'Notification system is active and will show new bookings when they arrive.',
            timestamp: new Date().toISOString(),
            read: false
          };
          setNotifications([authNotification]);
          return;
        }
        
        // For other errors, show a system notification
        const errorNotification: NotificationItem = {
          id: `error-${Date.now()}`,
          type: 'system',
          title: 'Notification System Error',
          message: 'Unable to load recent notifications. Please check your connection.',
          timestamp: new Date().toISOString(),
          read: false
        };
        setNotifications([errorNotification]);
      }
    };

    loadInitialNotifications();
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (browser restrictions)
      });
    } catch (error) {
      // Ignore audio errors
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <FiCalendar className="text-blue-400" />;
      case 'cancellation':
        return <FiXCircle className="text-red-400" />;
      case 'confirmation':
        return <FiCheckCircle className="text-green-400" />;
      default:
        return <FiAlertCircle className="text-yellow-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FiBell className="text-blue-400" />
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEnabled(!isEnabled)}
                className={`p-1 rounded transition-colors ${
                  isEnabled ? 'text-green-400 hover:text-green-300' : 'text-slate-500 hover:text-slate-400'
                }`}
                title={isEnabled ? 'Disable notifications' : 'Enable notifications'}
              >
                <FiSettings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="p-3 border-b border-slate-700 bg-slate-700/30">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sound-enabled"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="sound-enabled" className="text-slate-300">
                  Sound notifications
                </label>
              </div>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={clearAllNotifications}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Clear all
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <FiBell className="mx-auto text-4xl text-slate-600 mb-2" />
                <p className="text-slate-400">No notifications yet</p>
                <p className="text-slate-500 text-sm mt-1">
                  New booking notifications will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-700/30 transition-colors ${
                      !notification.read ? 'bg-blue-900/20 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-white' : 'text-slate-300'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <FiClock className="w-3 h-3 text-slate-500" />
                              <span className="text-xs text-slate-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                                title="Mark as read"
                              >
                                <FiCheck className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                              title="Remove"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-700 bg-slate-700/30">
              <p className="text-xs text-slate-400 text-center">
                Checking for new bookings every 30 seconds
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationSystem;