import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import notificationService from '../services/notificationService';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.off('new-notification');
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({ limit: 10 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
      }
    }

    if (notification.link) {
      navigate(notification.link);
      setShowPanel(false);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      const deleted = notifications.find(n => n._id === notificationId);
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification');
    }
  };

  const timeAgo = (dateString) => {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const NOTIFICATION_ICONS = {
    document_shared: '📄',
    collaborator_added: '👥',
    document_restored: '↩️',
    mention: '💬',
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button
        onClick={() => setShowPanel(prev => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        style={{
          position: "relative",
          background: "none",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          padding: "7px 10px",
          cursor: "pointer",
          fontSize: "16px",
          color: "#6B7280",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#C7D2FE'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
      >
        🔔
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#EF4444',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {showPanel && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          width: '360px',
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: '8px',
                  fontSize: '12px',
                  padding: '1px 7px',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  borderRadius: '10px',
                }}>
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: '#4F46E5',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {loading && (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: '#9CA3AF',
                fontSize: '14px',
              }}>
                Loading...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#9CA3AF',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                <p style={{ fontSize: '14px' }}>No notifications yet</p>
              </div>
            )}

            {notifications.map(notification => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: notification.link ? 'pointer' : 'default',
                  background: notification.read ? '#fff' : '#F5F3FF',
                  borderBottom: '1px solid #F3F4F6',
                  transition: 'background 0.1s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (notification.read) {
                    e.currentTarget.style.background = '#F9FAFB';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = notification.read
                    ? '#fff'
                    : '#F5F3FF';
                }}
              >
                {!notification.read && (
                  <div style={{
                    position: 'absolute',
                    left: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#4F46E5',
                  }} />
                )}

                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}>
                  {NOTIFICATION_ICONS[notification.type] || '📬'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: notification.read ? '400' : '500',
                    color: '#111827',
                    margin: 0,
                    lineHeight: '1.4',
                  }}>
                    {notification.message}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: '#9CA3AF',
                    marginTop: '3px',
                  }}>
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>

                <button
                  onClick={(e) => handleDelete(e, notification._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D1D5DB',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '2px',
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                  }}
                  onMouseEnter={e => e.target.style.color = '#9CA3AF'}
                  onMouseLeave={e => e.target.style.color = '#D1D5DB'}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;