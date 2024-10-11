"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { Textarea } from "@/components/ui/textarea";
import { add, format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePickerDemo } from "@/components/ui/time-picker-demo";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import Popup from "@/components/popup/Popup";
import QRCodePreview from "@/components/QRCodePreview";
import prisma from "@/lib/db";
import { set } from "lodash";
import { ticketsSold } from "@/app/actions";

const EventUpdateForm = ({ event, refreshCallback }: any) => {
  const [showPopup, setShowPopup] = useState(false);
  const [pStyle, setPStyle] = useState<"success" | "fail">("success");
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [ticketAmount, setTicketAmount] = useState(100);
  const [ticketPrice, setTicketPrice] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any>([]);
  const [qrCodeTheme, setQrCodeTheme] = useState("modern");
  const [isOpen, setIsOpen] = useState(false);
  const [minTicketAmount, setMinticketAmount] = useState(0);
  const [ticketsSoldCount, setTicketsSoldCount] = useState(0);
  const [isEventExpired, setIsEventExpired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission status
  const [guests, setGuests] = useState<any>([]);
  const [highlights, setHighlights] = useState<any>([]);
  const [sponsors, setSponsors] = useState<any>([]);
  const addGuest = () => {
    setGuests([...guests, { name: "", subtitle: "" }]);
  };
  const addSponsor = () => {
    setSponsors([...sponsors, { name: "" }]);
  };
  const addHighlight = () => {
    setHighlights([...highlights, { highlight: "" }]);
  };
  const updateGuest = (index: number, field: "name" | "subtitle", value: string) => {
    const updatedGuests = [...guests];
    updatedGuests[index][field] = value;
    setGuests(updatedGuests);
  };
  // optional values
  const updateHighlight = (index: number, field: "highlight", value: string) => {
    const updatedHighlights = [...highlights];
    updatedHighlights[index][field] = value;
    setHighlights(updatedHighlights);
  };
  const updateSponsor = (index: number, field: "name", value: string) => {
    const updatedSponsors = [...sponsors];
    updatedSponsors[index][field] = value;
    setSponsors(updatedSponsors);
  };
  const deleteGuest = (index: number) => {
    const updatedGuests = [...guests];
    updatedGuests.splice(index, 1);
    setGuests(updatedGuests);
  };
  const deleteHighlight = (index: number) => {
    const updatedHighlights = [...highlights];
    updatedHighlights.splice(index, 1);
    setHighlights(updatedHighlights);
  };
  const deleteSponsor = (index: number) => {
    const updatedSponsors = [...sponsors];
    updatedSponsors.splice(index, 1);
    setSponsors(updatedSponsors);
  };
  const getCategories = async () => {
    const response = await fetch("/api/category");
    if (response.ok) {
      const data = await response.json();
      setCategories(data.categories);
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      setCategory(event.categoryName);
      setEventName(event.eventName);
      setDescription(event.description);
      setLocation(event.location);
      setTicketAmount(event.ticketAmount);
      setTicketPrice(event.ticketPrice);
      setQrCodeTheme(event.qrCodeTheme);
      setStartDate(new Date(event.startDate));
      setEndDate(new Date(event.endDate));
      const soldCount = await ticketsSold(event.id);
      setMinticketAmount(event.ticketAmount - soldCount);
      setTicketsSoldCount(soldCount);
      // optional values
      setGuests(event.featuredGuests);
      setHighlights(event.highlights);
      setSponsors(event.sponsors);
      // Check if the event is expired
      const currentDate = new Date();
      if (new Date(event.endDate) < currentDate) {
        setIsEventExpired(true);
      }
    };

    if (event) {
      getCategories();
      fetchEventDetails();
    }
  }, [event]);

  const handleEndTimeChange = (newTime: Date | undefined) => {
    if (!newTime || !startDate) return;
    const updatedEndDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      newTime.getHours(),
      newTime.getMinutes(),
      newTime.getSeconds()
    );
    setEndDate(updatedEndDate);
  };
  const handleSelect = (newDay: Date | undefined) => {
    if (!newDay) return;
    if (!startDate) {
      setStartDate(newDay);
      return;
    }
    const diff = newDay.getTime() - startDate.getTime();
    const diffInDays = diff / (1000 * 60 * 60 * 24);
    const newDateFull = add(startDate, { days: Math.ceil(diffInDays) });
    setStartDate(newDateFull);
    setEndDate(newDateFull);
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error("No file selected");
    }

    const storage = getStorage(app);
    const storageRef = ref(storage, "event_images/" + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };
  const handleUpdate = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true); // Set submitting state

    let imageUrl = "";
    if (file) {
      try {
        imageUrl = await uploadImage(file);
      } catch (error) {
        console.error("Error uploading image:", error);
        setShowPopup(true);
        setPStyle("fail");
        setIsSubmitting(false); // Reset submitting state
        return;
      }
    }

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName,
          ticketAmount,
          ticketPrice,
          location,
          startDate,
          endDate,
          description,
          imageUrl: imageUrl || undefined,
          categoryName: category,
          qrCodeTheme,
          featuredGuests: guests,
          highlights,
          sponsors,
        }),
      });

      if (response.ok) {
        setShowPopup(true);
        setPStyle("success");
        refreshCallback();
        setIsOpen(false);
      } else {
        throw new Error("Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setShowPopup(true);
      setPStyle("fail");
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex gap-2">
            <span>Edit Event</span>
            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update the details of the event.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-left">
                Event name
              </Label>
              <Input id="name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location" className="text-left">
                Location
              </Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-left">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category" className="text-left">
                Category
              </Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.category}>
                        {cat.category.charAt(0).toUpperCase() + cat.category.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ticketAmount" className="text-left">
                  Tickets amount
                </Label>
                <Input
                  type="number"
                  id="ticketAmount"
                  value={ticketAmount}
                  onChange={(e) => setTicketAmount(parseInt(e.target.value))}
                  min={minTicketAmount}
                  max={1000}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ticketPrice" className="text-left">
                  Tickets price ($)
                </Label>
                <Input
                  type="number"
                  id="ticketPrice"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(parseInt(e.target.value))}
                  min={1}
                  max={100}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate" className="text-left">
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP HH:mm:ss") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => handleSelect(d)}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border">
                    <TimePickerDemo setDate={setStartDate} date={startDate} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate" className="text-left">
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP HH:mm:ss") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="p-3 border-t border-border">
                    <TimePickerDemo setDate={handleEndTimeChange} date={endDate} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="picture" className="text-left">
                Image
              </Label>
              <Input
                type="file"
                id="picture"
                onChange={(e) => {
                  if (e.target.files) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="qrCodeTheme" className="text-left">
                QR Code Theme
              </Label>
              <div className="flex items-center gap-4">
                <Select onValueChange={setQrCodeTheme} value={qrCodeTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a QR code theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="modern">Modern Sleek</SelectItem>
                      <SelectItem value="neon">Neon Glow</SelectItem>
                      <SelectItem value="sunset">Sunset Vibes</SelectItem>
                      <SelectItem value="forest">Forest Breeze</SelectItem>
                      <SelectItem value="ocean">Ocean Depths</SelectItem>
                      <SelectItem value="galaxy">Cosmic Galaxy</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <QRCodePreview theme={qrCodeTheme} />
              </div>
              {/* Featured Guests Section */}
              <div className="flex flex-col gap-2">
                <Label className="text-left">Featured Guests</Label>
                {guests.map((guest: any, index: any) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 w-full">
                    <Input
                      placeholder="Guest Name"
                      value={guest.name}
                      onChange={(e) => updateGuest(index, "name", e.target.value)}
                      className="w-full"
                    />
                    <Input
                      placeholder="Subtitle"
                      value={guest.subtitle}
                      onChange={(e) => updateGuest(index, "subtitle", e.target.value)}
                      className="w-full"
                    />
                    <Button
                      className="w-10 h-10 p-0 flex items-center justify-center"
                      onClick={() => deleteGuest(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addGuest} variant="outline" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Add Guest
                </Button>
              </div>
              {/* Highlights Section */}
              <div className="flex flex-col gap-2">
                <Label className="text-left">Event Highlights</Label>
                {highlights.map((highlight: any, index: any) => (
                  <div key={index} className="grid grid-rows-1 grid-cols-[1fr_auto] gap-2">
                    <Input
                      className="w-full"
                      placeholder="Highlight"
                      value={highlight.highlight}
                      onChange={(e) => updateHighlight(index, "highlight", e.target.value)}
                    />
                    <Button
                      className="w-10 h-10 p-0 flex items-center justify-center"
                      onClick={() => deleteHighlight(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addHighlight} variant="outline" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Add Highlight
                </Button>
              </div>
              {/* Sponsors Section */}
              <div className="flex flex-col gap-2">
                <Label className="text-left">Event Sponsors</Label>
                {sponsors.map((sponsor: any, index: any) => (
                  <div key={index} className="grid grid-rows-1 grid-cols-[1fr_auto] gap-2">
                    <Input
                      placeholder="Sponsor Name"
                      value={sponsor.name}
                      onChange={(e) => updateSponsor(index, "name", e.target.value)}
                    />
                    <Button
                      className="w-10 h-10 p-0 flex items-center justify-center"
                      onClick={() => deleteSponsor(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addSponsor} variant="outline" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Add Sponsor
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleUpdate}
              disabled={ticketsSoldCount > 0 || isEventExpired || isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
            {ticketsSoldCount > 0 && (
              <p className="text-red-500">
                You cannot update this event because tickets have already been sold.
              </p>
            )}
            {isEventExpired && (
              <p className="text-red-500">
                You cannot update this event because it has already expired.
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showPopup && (
        <Popup
          message={pStyle === "success" ? "Event updated successfully" : "Failed to update event"}
          onClose={() => setShowPopup(false)}
          style={pStyle}
        />
      )}
    </div>
  );
};

export default EventUpdateForm;
