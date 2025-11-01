import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

const Notifications = () => {
    const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const handleMarkAsRead = (notificationId) => {
        markAsRead(notificationId);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - (date?.toDate?.() || new Date(date));
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const getNotificationIcon = (notification) => {
        if (notification.icon) return notification.icon;
        
        switch (notification.type) {
            case 'urgent': return 'bi-exclamation-triangle-fill';
            case 'info': return 'bi-info-circle-fill';
            case 'success': return 'bi-check-circle-fill';
            case 'warning': return 'bi-exclamation-circle-fill';
            default: return 'bi-bell-fill';
        }
    };

    const getNotificationColor = (notification) => {
        switch (notification.type) {
            case 'urgent': return '#dc3545';
            case 'info': return '#0dcaf0';
            case 'success': return '#198754';
            case 'warning': return '#ffc107';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="container-fluid px-4 py-3">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="text-black mb-0">Notifications</h4>
                </div>
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-4 py-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-black mb-0">Notifications</h4>
                {unreadCount > 0 && (
                    <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleMarkAllAsRead}
                    >
                        <i className="bi bi-check-all me-2"></i>
                        Mark All as Read ({unreadCount})
                    </button>
                )}
            </div>

            {notifications.length === 0 && !loading ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <div style={{fontSize: '4rem'}} className="mb-3">🔔</div>
                        <h5 className="text-muted mb-2">No notifications</h5>
                        <p className="text-muted mb-0">You're all caught up! New notifications will appear here.</p>
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`p-3 border-bottom ${notification.read ? '' : 'bg-light'}`}
                                >
                                    <div className="d-flex align-items-start">
                                        <div className="flex-shrink-0 me-3">
                                            <div 
                                                className={`rounded-circle d-flex align-items-center justify-content-center`}
                                                style={{
                                                    width: '40px', 
                                                    height: '40px', 
                                                    backgroundColor: notification.read ? '#f8f9fa' : getNotificationColor(notification),
                                                    color: notification.read ? '#6c757d' : 'white'
                                                }}
                                            >
                                                <i className={getNotificationIcon(notification)}></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className={`mb-1 ${notification.read ? 'text-muted' : 'text-black'}`}>
                                                {notification.title}
                                            </h6>
                                            <p className={`mb-2 ${notification.read ? 'text-muted' : 'text-dark'}`}>
                                                {notification.message}
                                            </p>
                                            <small className="text-muted">
                                                {getTimeAgo(notification.createdAt)}
                                            </small>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="dropdown">
                                                <button 
                                                    className="btn btn-sm btn-link text-muted" 
                                                    type="button" 
                                                    data-bs-toggle="dropdown"
                                                >
                                                    <i className="bi bi-three-dots-vertical"></i>
                                                </button>
                                                <ul className="dropdown-menu">
                                                    {!notification.read && (
                                                        <li>
                                                            <button 
                                                                className="dropdown-item"
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                            >
                                                                <i className="bi bi-check2 me-2"></i>
                                                                Mark as Read
                                                            </button>
                                                        </li>
                                                    )}
                                                    <li>
                                                        <button className="dropdown-item text-danger">
                                                            <i className="bi bi-trash me-2"></i>
                                                            Delete
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;