'use client'
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Spinner from '@/components/Spinner';
import NotificationCard from '@/components/NotificationCard';
import { useGlobalContext } from '@/context/GlobalContext';

const NotificationsPage = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readClick , setReadClick] = useState(false)

  const { setNotificationCount } = useGlobalContext()

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session || !session?.user) {
        setLoading(false)
        return
      }
      const id = session?.user?.id
      try {
        const response = await fetch(`/api/notifications`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        toast.error('Failed to fetch notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session]);

  const markAsRead = async (notificationId) => {
    setReadClick(true)
    try {
      const response = await fetch(`/api/notifications/${notificationId}/mark-as-read`, {
        method: 'PUT',
      });
      const result = await response.json();
      if (result.ok) {
        setNotifications(notifications.map(notification =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        ));
        console.log(result.message);
        setNotificationCount((prevCount) => prevCount - 1)
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to mark as read.');
    }
    finally{
      setReadClick(false)
    }
  };

  return loading ? <Spinner loading={loading}/> : !session ? (
    <div className="container mx-auto px-4 py-8 bg-gray-50 border border-pink-50 mt-7 rounded-md shadow-md flex justify-center">
      <span className="text-3xl text-pink-700">Sign In to view notifications</span>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-8 bg-gray-50 border border-pink-50 mt-7 rounded-md shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-pink-700">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-center text-gray-500">No notifications available.</p>
      ) : (
        notifications.map(notification => (
          <NotificationCard key={notification._id} notification={notification} markAsRead={markAsRead} readClick = {readClick} />
        ))
      )}
    </div>
  );
};

export default NotificationsPage;
