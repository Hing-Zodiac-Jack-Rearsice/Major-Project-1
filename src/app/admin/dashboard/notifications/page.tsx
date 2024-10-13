"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, Bell, Trash2, CheckCircle } from "lucide-react";

type Notification = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const res = await fetch("/api/events/notifications");
    const data = await res.json();
    setNotifications(data.notifications);
    updateUnreadCount(data.notifications);
  };

  const updateUnreadCount = (notifications: Notification[]) => {
    const count = notifications.filter((notification) => !notification.read).length;
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
    setNotifications(notifications.filter((notification) => notification.id !== id));
    updateUnreadCount(notifications.filter((notification) => notification.id !== id));
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
    updateUnreadCount(updatedNotifications);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto sm:p-6 sm:pl-20 p-4">
      <Button
        onClick={() => router.back()}
        variant="outline"
        className="mb-6 inline-flex items-center"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card className="w-full mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Notifications</CardTitle>
          <Badge variant="secondary" className="text-sm font-medium">
            {unreadCount} unread
          </Badge>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: Notification) => (
                <div key={notification.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p
                        className={`text-sm ${
                          notification.read ? "text-muted-foreground" : "font-medium"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        {!notification.read && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark as Read</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
