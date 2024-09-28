"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

const SuperAdminDashboard = () => {
  const { data: session, status } = useSession();

  // Add this console log to check the session data
  console.log("Session data:", session);

  const [users, setUsers] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/userManagement");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else {
        const errorData = await res.json();
        console.error("Error fetching users:", errorData.error);
        toast({
          title: `Failed to fetch users: ${errorData.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "An error occurred while fetching users",
        variant: "destructive",
      });
    }
  }, []);

  const fetchPendingEvents = useCallback(async () => {
    const res = await fetch("/api/events/pendingEvent");
    const data = await res.json();
    setPendingEvents(data.events);
  }, []);

  useEffect(() => {
    if (session?.user?.role === "super_admin") {
      Promise.all([fetchUsers(), fetchPendingEvents()]).then(() =>
        setLoading(false)
      );
    }
  }, [session, fetchUsers, fetchPendingEvents]);

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    if (newRole === "super_admin") {
      toast({ title: "Cannot promote to super admin", variant: "destructive" });
      return;
    }

    const res = await fetch(`/api/userManagement/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      toast({ title: "User role updated successfully" });
      fetchUsers();
    } else {
      const errorData = await res.json();
      toast({
        title: `Failed to update user role: ${errorData.error}`,
        variant: "destructive",
      });
    }
  };

  const handleEventApproval = async (eventId: string, approved: boolean) => {
    const res = await fetch(`/api/events/${eventId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });

    if (res.ok) {
      toast({ title: approved ? "Event approved" : "Event rejected" });
      fetchPendingEvents();
    } else {
      toast({ title: "Failed to process event", variant: "destructive" });
    }
  };

  if (status === "loading") return <div>Loading session...</div>;
  if (!session) return <div>No session found. Please log in.</div>;
  if (session?.user?.role !== "super_admin")
    return <div>Access denied. You need to be a super admin.</div>;
  if (loading) return <div>Loading data...</div>;

  return (
    <div className="container mx-auto p-6 mt-20 bg-red-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
      <p>Session user role: {session.user.role}</p>
      <p>Number of users: {users.length}</p>
      <p>Number of pending events: {pendingEvents.length}</p>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Manage Users</TabsTrigger>
          <TabsTrigger value="events">Pending Events</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            handleUserRoleChange(user.id, value)
                          }
                          disabled={user.role === "super_admin"}
                        >
                          <SelectTrigger>
                            <SelectValue>{user.role}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              disabled={user.role === "super_admin"}
                            >
                              Ban User
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ban User</DialogTitle>
                            </DialogHeader>
                            <p>Are you sure you want to ban this user?</p>
                            <Button
                              onClick={() =>
                                handleUserRoleChange(user.id, "banned")
                              }
                              disabled={user.role === "super_admin"}
                            >
                              Confirm Ban
                            </Button>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Pending Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEvents.map((event: any) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.eventName}</TableCell>
                      <TableCell>{event.organizer}</TableCell>
                      <TableCell>
                        {new Date(event.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleEventApproval(event.id, true)}
                          className="mr-2"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleEventApproval(event.id, false)}
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminDashboard;
