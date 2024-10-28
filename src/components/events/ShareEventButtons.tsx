import React from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FacebookShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";

interface ShareEventButtonsProps {
  event: {
    id: string;
    eventName: string;
    description?: string;
    imageUrl: string;
  };
  className?: string;
}

export function ShareEventButtons({
  event,
  className,
}: ShareEventButtonsProps) {
  const url = `${process.env.NEXT_PUBLIC_URL}/events/${event.id}`;
  const title = event.eventName;
  const description = event.description || `Check out ${event.eventName}!`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <FacebookShareButton
            url={url}
            hashtag={`#YourHashtag ${event.eventName}`}
            className="w-full"
          >
            <div className="flex items-center gap-2">
              <FacebookIcon size={20} round />
              <span>Share on Facebook</span>
            </div>
          </FacebookShareButton>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <TwitterShareButton url={url} title={title} className="w-full">
            <div className="flex items-center gap-2">
              <TwitterIcon size={20} round />
              <span>Share on Twitter</span>
            </div>
          </TwitterShareButton>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <TelegramShareButton url={url} title={title} className="w-full">
            <div className="flex items-center gap-2">
              <TelegramIcon size={20} round />
              <span>Share on Telegram</span>
            </div>
          </TelegramShareButton>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <WhatsappShareButton url={url} title={title} className="w-full">
            <div className="flex items-center gap-2">
              <WhatsappIcon size={20} round />
              <span>Share on WhatsApp</span>
            </div>
          </WhatsappShareButton>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <LinkedinShareButton
            url={url}
            title={title}
            summary={description}
            className="w-full"
          >
            <div className="flex items-center gap-2">
              <LinkedinIcon size={20} round />
              <span>Share on LinkedIn</span>
            </div>
          </LinkedinShareButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
