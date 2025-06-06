"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { UserCircle, CalendarClock, Users, AlertTriangle } from "lucide-react";
import { signIn } from "next-auth/react"; // Import signIn
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ConfirmationDialog from "@/components/ui/improved-confirmation-dialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast"; // Add this import

// Update the Event interface to include additional properties/
interface Event {
  id: string;
  eventName: string;
  organizer: string;
  startDate: string;
  endDate: string;
  description: string;
  ticketPrice: number;
  ticketAmount: number;
  ticketsSold: number;
  location: string; // New property added
  imageUrl: string; // New property added
}

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
    try {
      const res = await fetch("/api/events/pendingEvent");
      if (res.ok) {
        const data = await res.json();
        setPendingEvents(data.events);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error("Error fetching pending events:", error);
      toast({
        title: "Failed to fetch pending events",
        variant: "destructive",
      });
    }
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
    // try 
    try {
      const res = await fetch(`/api/userManagement/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        toast({
          title: "Role updated successfully",
          description: "The page will refresh to apply changes...",
        });

        // Add a slight delay before refreshing
        setTimeout(() => {
          router.refresh();
          fetchUsers();
        }, 1500);
      } else {
        const errorData = await res.json();
        toast({
          title: `Failed to update user role: ${errorData.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleEventApproval = async (eventId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/events/${eventId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });

      if (res.ok) {
        toast({ title: approved ? "Event approved" : "Event rejected" });
        fetchPendingEvents();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error("Error processing event:", error);
      toast({
        title: "Failed to process event",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const confirmApproval = async () => {
    if (selectedEvent) {
      await handleEventApproval(selectedEvent.id, true);
      setConfirmDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  if (status === "loading")
    return (
      <div className="flex items-center justify-center h-screen">
        Loading session...
      </div>
    );
  if (!session)
    return (
      <div className="flex items-center justify-center h-screen">
        No session found. Please log in.
      </div>
    );
  if (session?.user?.role !== "super_admin")
    return (
      <div className="flex items-center justify-center h-screen">
        Access denied. You need to be a super admin.
      </div>
    );
  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-6 mt-20 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Events
            </CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {session.user.role}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
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
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) =>
                            handleUserRoleChange(user.id, value)
                          }
                          disabled={user.role === "super_admin"}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="banned">Banned</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={
                                user.role === "super_admin" ||
                                user.role === "banned"
                              }
                            >
                              {user.role === "banned" ? "Banned" : "Ban User"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ban User</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-6 w-6 text-destructive" />
                              <p>Are you sure you want to ban this user?</p>
                            </div>
                            <Button
                              onClick={() =>
                                handleUserRoleChange(user.id, "banned")
                              }
                              disabled={
                                user.role === "super_admin" ||
                                user.role === "banned"
                              }
                              variant="destructive"
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
                      <TableCell className="font-medium">
                        {event.eventName}
                      </TableCell>
                      <TableCell>{event.organizer}</TableCell>
                      <TableCell>
                        {new Date(event.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setSelectedEvent(event);
                              setConfirmDialogOpen(true);
                            }}
                            size="sm"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleEventApproval(event.id, false)}
                            variant="destructive"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={confirmApproval}
          selectedEvent={selectedEvent}
        />
      </Tabs>
    </div>
  );
}
