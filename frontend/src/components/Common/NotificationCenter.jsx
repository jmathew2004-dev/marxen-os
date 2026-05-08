import React, { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [toastIds, setToastIds] = useState(new Set())

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read_at),
    [notifications]
  )

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unread_count)
      setToastIds((current) => {
        const next = new Set(current)
        res.data.notifications
          .filter((notification) => !notification.read_at)
          .slice(0, 3)
          .forEach((notification) => next.add(notification.id))
        return next
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = window.setInterval(fetchNotifications, 15000)
    return () => window.clearInterval(interval)
  }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setToastIds((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification read:', error)
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setToastIds(new Set())
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all notifications read:', error)
    }
  }

  return (
    <div className="notification-center">
      <button
        type="button"
        className="notification-button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        Alerts
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <strong>Messages</strong>
            {unreadCount > 0 && (
              <button type="button" className="link-button" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={notification.read_at ? 'notification-item' : 'notification-item unread'}
                onClick={() => markRead(notification.id)}
              >
                <span>{notification.title}</span>
                <small>{notification.message}</small>
              </button>
            ))
          ) : (
            <p className="notification-empty">No messages yet</p>
          )}
        </div>
      )}

      <div className="toast-stack">
        {unreadNotifications
          .filter((notification) => toastIds.has(notification.id))
          .slice(0, 3)
          .map((notification) => (
            <div key={notification.id} className={`toast-card ${notification.severity}`}>
              <button
                type="button"
                className="toast-close"
                onClick={() => markRead(notification.id)}
                aria-label="Dismiss notification"
              >
                x
              </button>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </div>
          ))}
      </div>
    </div>
  )
}

export default NotificationCenter
