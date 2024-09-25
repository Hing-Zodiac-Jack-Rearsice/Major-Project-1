import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UpdateEventProps {
  event: any;
  onUpdate: (updatedEvent: any) => void;
}

const UpdateEventModal: React.FC<UpdateEventProps> = ({ event, onUpdate }) => {
  const [updatedEvent, setUpdatedEvent] = useState(event);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUpdatedEvent({ ...updatedEvent, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          `HTTP error! status: ${res.status}, message: ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const data = await res.json();
      onUpdate(data.data);
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        (document.getElementById("close-dialog") as HTMLButtonElement)?.click();
      }, 2000);
    } catch (error) {
      console.error("Failed to update event:", error);
      setUpdateSuccess(false);
      setErrorMessage(
        `Failed to update event: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Update Event</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Event</DialogTitle>
        </DialogHeader>
        {updateSuccess && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">Event updated successfully!</span>
          </div>
        )}
        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="eventName" className="text-right">
              Event Name
            </Label>
            <Input
              id="eventName"
              name="eventName"
              value={updatedEvent.eventName}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticketAmount" className="text-right">
              Ticket Amount
            </Label>
            <Input
              id="ticketAmount"
              name="ticketAmount"
              type="number"
              value={updatedEvent.ticketAmount}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticketPrice" className="text-right">
              Ticket Price
            </Label>
            <Input
              id="ticketPrice"
              name="ticketPrice"
              type="number"
              value={updatedEvent.ticketPrice}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={updatedEvent.location}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              value={updatedEvent.description}
              onChange={handleInputChange}
              className="col-span-3 flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save changes</Button>
          <DialogClose asChild>
            <Button id="closeDialog" type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateEventModal;
