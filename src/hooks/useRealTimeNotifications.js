import { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';
// import { toast } from 'react-hot-toast';

const useRealTimeNotifications = () => {
  // const [socket, setSocket] = useState(null);
  const [socket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // TODO: Enable socket connection when backend server is running
    // For now, simulating connection without actual socket to prevent errors
    console.log('Real-time notifications initialized (mock mode)');
    setIsConnected(false); // Set to false since no actual connection
    
    // Simulate some mock notifications for demo (can be removed)
    // setNotifications([]);
    
    // Uncomment below when backend server is ready:
    /*
    // Initialize socket connection
    const newSocket = io('http://localhost:5001', {
      withCredentials: true
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
      
      // Join admin room for notifications
      newSocket.emit('join-admin');
      
      toast.success('Real-time notifications enabled', {
        position: 'bottom-right',
        duration: 3000
      });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
      
      toast.error('Real-time notifications disconnected', {
        position: 'bottom-right',
        duration: 3000
      });
    });

    // Listen for donation requests
    newSocket.on('new_donation_request', (notification) => {
      console.log('📋 New donation request:', notification);
      
      setNotifications(prev => [notification, ...prev]);
      
      toast.success(
        `New Donation Request!\n${notification.data.donorName} - ${notification.data.bloodType}`,
        {
          position: 'top-right',
          duration: 5000,
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: 'bold'
          }
        }
      );
    });

    // Listen for urgent blood requests
    newSocket.on('urgent_blood_request', (notification) => {
      console.log('🚨 Urgent blood request:', notification);
      
      setNotifications(prev => [notification, ...prev]);
      
      toast.error(
        `🚨 URGENT BLOOD REQUEST!\n${notification.data.bloodType} - ${notification.data.unitsNeeded} units needed`,
        {
          position: 'top-center',
          duration: 8000,
          style: {
            background: '#EF4444',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }
        }
      );
      
      // Play notification sound for urgent requests
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Could not play notification sound'));
      } catch (e) {
        console.log('Audio not available');
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
    */
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.data._id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    socket,
    notifications,
    isConnected,
    markAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  };
};

export default useRealTimeNotifications;
