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
import { Instagram } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const handleInstagramShare = () => {
    // Create a caption with event details and URL
    const caption = `Check out ${event.eventName}! 🎉\n\n${description}\n\nGet your tickets at: ${url}`;

    // Instagram deep link with pre-filled caption
    // Note: This will only open Instagram, user needs to manually copy the image
    const instagramUrl = `instagram://library?AssetPath=${encodeURIComponent(
      event.imageUrl
    )}&InstagramCaption=${encodeURIComponent(caption)}`;

    // Fallback to Instagram website if app is not installed
    const webFallback = `https://instagram.com`;

    try {
      window.open(instagramUrl, "_blank");
      // If Instagram app doesn't open after a short delay, redirect to web
      setTimeout(() => {
        window.open(webFallback, "_blank");
      }, 2000);
    } catch {
      window.open(webFallback, "_blank");
    }
  };

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

        <DropdownMenuItem asChild>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleInstagramShare}
                  className="w-full flex items-center gap-2 hover:bg-transparent focus:bg-transparent"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-pink-600">
                      <Instagram size={12} className="text-white" />
                    </div>
                    <span>Share on Instagram</span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Opens Instagram - you&apos;ll need to select the image manually
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
