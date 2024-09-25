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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { uploadImageToFirebase } from "@/lib/uploadImageToFirebase";

interface UpdateEventProps {
  event: any;
  onUpdate: (updatedEvent: any) => void;
}

const UpdateEventModal: React.FC<UpdateEventProps> = ({ event, onUpdate }) => {
  const [updatedEvent, setUpdatedEvent] = useState(event);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    event.imageUrl
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUpdatedEvent({ ...updatedEvent, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!allowedTypes.includes(file.type)) {
        setErrorMessage("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      setImageFile(file);
      setImagePreview(null); // Remove the old image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrorMessage(null);
    }
  };

  const handleDateChange = (
    date: Date | null,
    field: "startDate" | "endDate"
  ) => {
    if (date) {
      setUpdatedEvent({ ...updatedEvent, [field]: date.toISOString() });
    }
  };

  const handleSubmit = async () => {
    try {
      let imageUrl = updatedEvent.imageUrl;

      if (imageFile) {
        // Upload image to Firebase Storage and get the URL
        imageUrl = await uploadImageToFirebase(imageFile);
      }

      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...updatedEvent, imageUrl }),
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">
              Event Image
            </Label>
            <div className="col-span-3">
              <Input
                id="imageUrl"
                name="imageUrl"
                type="file"
                onChange={handleImageChange}
                className="mb-2"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="mt-2 max-w-full h-auto rounded-md"
                  style={{ maxHeight: "200px" }}
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-6">
            <Label htmlFor="startDate" className="text-right font-medium">
              Start Date & Time
            </Label>
            <div className="col-span-3">
              <DatePicker
                selected={new Date(updatedEvent.startDate)}
                onChange={(date) => handleDateChange(date, "startDate")}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-6 mt-4">
            <Label htmlFor="endDate" className="text-right font-medium">
              End Date & Time
            </Label>
            <div className="col-span-3">
              <DatePicker
                selected={new Date(updatedEvent.endDate)}
                onChange={(date) => handleDateChange(date, "endDate")}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
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
