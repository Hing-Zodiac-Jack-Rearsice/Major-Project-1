import React, { useEffect, useState } from "react";
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
import { faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { Textarea } from "@/components/ui/textarea";
import { add, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePickerDemo } from "@/components/ui/time-picker-demo";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "@/lib/firebase";
import Popup from "@/components/popup/Popup";
const EventForm = ({ refreshCallback }: { refreshCallback: () => void }) => {
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
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTheme, setEmailTheme] = useState("");
  useEffect(() => {
    const getCategories = async () => {
      const response = await fetch("/api/category");
      const data = await response.json();
      console.log(data.categories);
      setCategories(data.categories);
    };
    getCategories();
    // console.log("categories: " + categories);
  }, []);
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
  const handleEndTimeChange = (newTime: Date | undefined) => {
    if (!newTime || !startDate) return;

    // Keep the date from `date` but change the time from `newTime`
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
  const uploadImage = async (file: File): Promise<string> => {
    console.log(file);
    if (!file) {
      throw new Error("No file selected");
    }

    const storage = getStorage(app);
    const metadata = {
      contentType: "image/jpg",
    };

    const storageRef = ref(storage, "event_images/" + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          switch (error.code) {
            case "storage/unauthorized":
              reject(
                new Error("User doesn't have permission to access the object")
              );
              break;
            case "storage/canceled":
              reject(new Error("User canceled the upload"));
              break;
            case "storage/unknown":
              reject(
                new Error(
                  "Unknown error occurred, inspect error.serverResponse"
                )
              );
              break;
          }
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            // console.log("File available at", downloadURL);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const handleUpload = async () => {
    if (file) {
      const imageUrl = await uploadImage(file);
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName: eventName,
          ticketAmount: ticketAmount,
          ticketPrice: ticketPrice,
          location: location,
          startDate: startDate,
          endDate: endDate,
          description: description,
          imageUrl: imageUrl,
          categoryName: category,
          emailTemplate: {
            subject: emailSubject,
            body: emailBody,
            theme: emailTheme,
          },
        }),
      });
      if (response.ok) {
        setShowPopup(true);
        setPStyle("success");
        refreshCallback();

        // Reset form fields
        // setEventName("");
        // setTicketAmount(100);
        // setTicketPrice(1);
        // setLocation("");
        // setStartDate(undefined);
        // setEndDate(undefined);
        // setDescription("");
        // setCategory("");
        // setFile(null);

        // alert("Event created successfully");
      }
    } else {
      setShowPopup(true);
      setPStyle("fail");
      // alert("Please select an image");
    }
  };
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <FontAwesomeIcon icon={faSquarePlus} className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] text-sm max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create event</DialogTitle>
            <DialogDescription>
              Fill the form below to create a new event.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-left">
                Event name
              </Label>
              <Input
                id="name"
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              <Label htmlFor="name" className="text-left">
                Location
              </Label>
              <Input
                id="name"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              <Label htmlFor="username" className="text-left">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              <Label htmlFor="username" className="text-left">
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
                        {/* capitalization of category names */}
                        {cat.category.charAt(0).toUpperCase() +
                          cat.category.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <Label htmlFor="ticketAmount" className="text-left">
                    Tickets amount
                  </Label>
                  <Input
                    type="number"
                    id="ticketAmount"
                    defaultValue={100}
                    max={1000}
                    min={1}
                    value={ticketAmount}
                    onChange={(e) => {
                      setTicketAmount(parseInt(e.target.value));
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="ticketPrice" className="text-left">
                    Tickets price
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      id="ticketPrice"
                      defaultValue={1}
                      max={100}
                      min={1}
                      value={ticketPrice}
                      className="w-full"
                      onChange={(e) => {
                        setTicketPrice(parseInt(e.target.value));
                      }}
                    />
                    <span className="currency-symbol">$</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              <Label htmlFor="username" className="text-left">
                Start Date
              </Label>
              {/* Date Time picker content */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      " justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP HH:mm:ss")
                    ) : (
                      <span>Pick a date</span>
                    )}
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
            <div className="flex flex-col gap-2 md:gap-3">
              <Label htmlFor="username" className="text-left">
                End Date
              </Label>
              {/* Date Time picker content */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      " justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP HH:mm:ss")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="p-3 border-t border-border">
                    <TimePickerDemo
                      setDate={handleEndTimeChange}
                      date={endDate}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              <Label htmlFor="picture" className="text-left">
                Image
              </Label>
              <Input
                type="file"
                id="picture"
                onChange={(e) => {
                  if (e.target.files) {
                    // console.log(e.target.files[0]);
                    setFile(e.target.files[0]);
                    // console.log(file);
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              <Label htmlFor="emailSubject" className="text-left">
                Email Subject
              </Label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              <Label htmlFor="emailBody" className="text-left">
                Email Body
              </Label>
              <Textarea
                id="emailBody"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 md:gap-3">
              <Label htmlFor="emailTheme" className="text-left">
                Email Theme
              </Label>
              <Select onValueChange={setEmailTheme} defaultValue={emailTheme}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="colorful">Colorful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => handleUpload()}>
              Create
            </Button>
            {/* BELOW: used to test firebase image upload function */}
            {/* <Button
          type="submit"
          onClick={() => {
            if (file) {
              uploadImage(file);
            }
          }}
        >
          test img
        </Button> */}
            {/* BELOW: in order to log datetime */}
            {/* <Button type="submit" onClick={() => console.log(date)}>
          Log datetime
        </Button> */}
            <Button onClick={() => console.log(category)}>
              Log out category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showPopup && (
        <Popup
          message="Event created successfully"
          onClose={() => setShowPopup(false)}
          style={pStyle}
        />
      )}
    </div>
  );
};

export default EventForm;
