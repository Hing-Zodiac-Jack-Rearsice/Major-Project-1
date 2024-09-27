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
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePickerDemo } from "@/components/ui/time-picker-demo";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import Popup from "@/components/popup/Popup";
import QRCodePreview from "@/components/QRCodePreview";

const EventUpdateForm = ({ event, refreshCallback }: any) => {
  //   const router = useRouter();
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
      setCategory(event.categoryName);
      setStartDate(new Date(event.startDate));
      setEndDate(new Date(event.endDate));
      setQrCodeTheme(event.qrCodeTheme);
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
    let imageUrl = "";
    if (file) {
      try {
        imageUrl = await uploadImage(file);
      } catch (error) {
        console.error("Error uploading image:", error);
        setShowPopup(true);
        setPStyle("fail");
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
                  min={1}
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
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdate}>
              Update
            </Button>
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
