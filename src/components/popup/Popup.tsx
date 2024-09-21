import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";

interface PopupProps {
  message: string;
  onClose?: () => void;
  style: "success" | "fail";
}

export default function Popup({ message, onClose, style }: PopupProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    setIsOpen(true);
  }, [message]);

  const getStyleConfig = () => {
    if (style === "success") {
      return {
        icon: <CheckCircle2 className="h-6 w-6" />,
        title: "Success!",
        titleColor: "text-green-400",
        buttonColor: "bg-green-500 hover:bg-green-600",
      };
    } else {
      return {
        icon: <XCircle className="h-6 w-6" />,
        title: "Error",
        titleColor: "text-red-400",
        buttonColor: "bg-red-500 hover:bg-red-600",
      };
    }
  };

  const { icon, title, titleColor, buttonColor } = getStyleConfig();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${titleColor}`}>
            {icon}
            {title}
          </DialogTitle>
          {/* <DialogDescription></DialogDescription> */}
        </DialogHeader>
        <div className="py-4">
          <p className="text-center">{message}</p>
        </div>
        <DialogFooter>
          <Button onClick={handleClose} className={`w-full text-white ${buttonColor}`}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
