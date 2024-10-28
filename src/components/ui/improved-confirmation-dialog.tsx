"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, TicketIcon, UserIcon, ClockIcon } from "lucide-react";

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
  location: string;
  imageUrl: string;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedEvent: Event | null;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedEvent,
}: ConfirmationDialogProps) {
  if (!selectedEvent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Review Event Details</DialogTitle>
          <DialogDescription>
            Please review the details of the event you are about to approve.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader className="p-4">
              <img
                src={selectedEvent.imageUrl}
                alt={selectedEvent.eventName}
                className="w-full h-48 object-cover rounded-md"
              />
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold mb-2">{selectedEvent.eventName}</h3>
              <p className="text-muted-foreground mb-4">{selectedEvent.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  {selectedEvent.organizer}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" />
                  {selectedEvent.location}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span>Start: {new Date(selectedEvent.startDate).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-muted-foreground" />
                <span>End: {new Date(selectedEvent.endDate).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <TicketIcon className="w-4 h-4 text-muted-foreground" />
                <span>Price: ${selectedEvent.ticketPrice}</span>
              </div>
              {/* <div className="flex items-center gap-2">
                <TicketIcon className="w-4 h-4 text-muted-foreground" />
                <span>Available: {selectedEvent.ticketAmount - selectedEvent.ticketsSold}</span>
              </div> */}
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="default">
            Confirm Approval
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
