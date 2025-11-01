import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('/api/notifications');
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/notifications/${id}`);
            setNotifications(notifications.filter(notification => notification.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <div>
            <h2>Notification Center</h2>
            <ul>
                {notifications.map(notification => (
                    <li key={notification.id}>
                        <p>{notification.message}</p>
                        <button onClick={() => handleDelete(notification.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NotificationCenter;