"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react"; // Import the ChevronLeft icon

type Notification = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean; // Add read property
};

const NotificationsPage = () => {
  const { data: session } = useSession();
  const router = useRouter(); // Initialize router
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0); // State for unread notifications count

  const fetchNotifications = async () => {
    const res = await fetch("/api/events/notifications");
    const data = await res.json();
    setNotifications(data.notifications);
    updateUnreadCount(data.notifications); // Update unread count after fetching
  };

  const updateUnreadCount = (notifications: Notification[]) => {
    const count = notifications.filter(
      (notification) => !notification.read
    ).length;
    setUnreadCount(count);
  };

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/events/notifications`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
    updateUnreadCount(
      notifications.filter((notification) => notification.id !== id)
    ); // Update count after deletion
  };

  const handleMarkAsRead = async (id: string) => {
    await fetch(`/api/events/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications); // Update count after marking as read
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(); // Poll for notifications every few seconds
    }, 5000); // Adjust the interval as needed (e.g., every 5 seconds)

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="container mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> {/* Icon added here */}
        Back
      </button>
      <Card>
        <CardHeader>
          <CardTitle>Notifications ({unreadCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((notification: Notification) => (
              <div key={notification.id} className="mb-2">
                <p
                  className={notification.read ? "text-gray-500" : "font-bold"}
                >
                  {notification.message}
                </p>
                <small>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
                <div className="flex space-x-2">
                  <button onClick={() => handleMarkAsRead(notification.id)}>
                    Mark as Read
                  </button>
                  <button onClick={() => handleDelete(notification.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
