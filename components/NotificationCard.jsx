'use client'
import React from 'react';

const NotificationCard = ({ notification, markAsRead , readClick }) => {
  return (
    <div className="border p-4 mb-4 rounded-md relative">
      {!notification.read && (
        <span className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-bl-md">New</span>
      )}
      <p className="text-sm text-gray-800">{notification.body}</p>
      <span className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
      {!notification.read && (
        <button
          onClick={() => markAsRead(notification._id)}
          className="block mt-2 text-blue-500 hover:text-blue-700"
        >
          {!readClick ? 'Mark as Read' : 'Wait...'}
        </button>
      )}
    </div>
  );
};

export default NotificationCard;
