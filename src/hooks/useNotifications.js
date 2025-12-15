import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { user, firebaseService } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!user || !firebaseService) return;

    try {
      setLoading(true);
      const result = await firebaseService.getNotifications(user.uid);
      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(result.unreadCount);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Create some sample notifications for demo purposes
      createSampleNotifications();
    } finally {
      setLoading(false);
    }
  }, [user, firebaseService]);

  const createSampleNotifications = () => {
    const sampleNotifications = [
      {
        id: 'sample-1',
        title: 'New Blood Donation Request',
        message: 'Emergency request for O+ blood type at City Hospital',
        type: 'urgent',
        icon: 'bi-droplet-fill',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isGlobal: true
      },
      {
        id: 'sample-2',
        title: 'New User Registration',
        message: 'John Doe has registered as a blood donor',
        type: 'info',
        icon: 'bi-person-plus',
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isGlobal: true
      },
      {
        id: 'sample-3',
        title: 'Blood Drive Scheduled',
        message: 'Community blood drive scheduled for next weekend',
        type: 'info',
        icon: 'bi-calendar-event',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isGlobal: true
      }
    ];
    
    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  };

  const markAsRead = async (notificationId) => {
    try {
      if (firebaseService) {
        await firebaseService.markNotificationAsRead(notificationId);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (firebaseService && user) {
        await firebaseService.markAllNotificationsAsRead(user.uid);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read: true, 
          readAt: new Date() 
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      if (firebaseService) {
        await firebaseService.deleteNotification(notificationId);
      }
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  };

  const refreshNotifications = () => {
    loadNotifications();
  };

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };
};
