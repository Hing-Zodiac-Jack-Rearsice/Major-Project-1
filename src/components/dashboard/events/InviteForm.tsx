import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Popup from "@/components/popup/Popup";

const InviteForm = ({ eventId, onInviteSuccess }: any) => {
  const [showPopup, setShowPopup] = useState(false);
  const [pStyle, setPStyle] = useState<"success" | "fail">("success");
  const [msg, setMsg] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);

  const invAttendees = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/mail/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail, userName: userName }),
      });
      if (res.status === 200) {
        setMsg(`Ticket sent to ${userEmail}`);
        setShowPopup(true);
        setPStyle("success");
        onInviteSuccess(); // Call the callback function to trigger a refresh
      } else {
        throw new Error("Failed to send ticket");
      }
    } catch (error) {
      setMsg(`Failed to send ticket to ${userEmail}`);
      setShowPopup(true);
      setPStyle("fail");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex gap-2">
            <span>Invite</span>
            <FontAwesomeIcon icon={faPlusSquare} className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] text-sm max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invite Attendees</DialogTitle>
            <DialogDescription>
              Enter user email to invite them.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-left">
              Email
            </Label>
            <Input
              id="name"
              value={userEmail}
              onChange={(e) => {
                setUserEmail(e.target.value);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-left">
              Attendee&apos name
            </Label>
            <Input
              id="name"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            />
          </div>
          <DialogFooter>
            <form onSubmit={invAttendees}>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Generate ticket & mail"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {showPopup && (
        <Popup
          message={msg}
          onClose={() => setShowPopup(false)}
          style={pStyle}
        />
      )}
    </div>
  );
};

export default InviteForm;
