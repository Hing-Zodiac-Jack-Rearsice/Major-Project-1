"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, CheckCircle2 } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ShareEventButtonsProps {
  event: {
    id: string;
    eventName: string;
    description?: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    location?: string;
  };
  className?: string;
}

export function ShareEventButtons({ event, className }: ShareEventButtonsProps) {
  const [copied, setCopied] = React.useState(false);
  const url = `${process.env.NEXT_PUBLIC_URL}/events/${event.id}`;
  
  // Format date for sharing
  const eventDate = new Date(event.startDate);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create formatted sharing text
  const title = `${event.eventName} - ${formattedDate}`;
  const description = `${event.description || `Join us for ${event.eventName}`}\n\n📅 ${formattedDate}\n📍 ${event.location || 'Location TBA'}\n\nGet your tickets now!`;
  
  // Create hashtags
  const hashtags = [`event`, `${event.eventName.replace(/\s+/g, '')}`, 'tickets'];

  const handleInstagramShare = () => {
    const caption = `Check out ${event.eventName}! 🎉\n\n${description}\n\nGet your tickets at: ${url}`;
    const instagramUrl = `instagram://library?AssetPath=${encodeURIComponent(
      event.imageUrl
    )}&InstagramCaption=${encodeURIComponent(caption)}`;
    const webFallback = `https://instagram.com`;

    try {
      window.open(instagramUrl, "_blank");
      setTimeout(() => {
        window.location.href = webFallback;
      }, 2000);
    } catch {
      window.location.href = webFallback;
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`${className} text-white dark:text-gray-200 hover:bg-gray-700/10 dark:hover:bg-gray-300/10 transition-colors`}
        >
          <Share2 className="h-4 w-4 text-black dark:text-white" />
          <span className="sr-only">Share Event</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-3 gap-2">
          <ShareButton
            Component={FacebookShareButton}
            Icon={FacebookIcon}
            color="#1877F2"
            url={url}
            title={title}
            description={description}
            hashtag={hashtags[0]} // Facebook only allows one hashtag
            quote={description}   // Facebook-specific quote
          >
            Facebook
          </ShareButton>
          <ShareButton
            Component={TwitterShareButton}
            Icon={TwitterIcon}
            color="#1DA1F2"
            url={url}
            title={title}
            hashtags={hashtags}
            via="YourTwitterHandle" // Add your platform's Twitter handle
          >
            Twitter
          </ShareButton>
          <ShareButton
            Component={LinkedinShareButton}
            Icon={LinkedinIcon}
            color="#0A66C2"
            url={url}
            title={title}
            summary={description}
            source={process.env.NEXT_PUBLIC_URL}
          >
            LinkedIn
          </ShareButton>
          <ShareButton
            Component={WhatsappShareButton}
            Icon={WhatsappIcon}
            color="#25D366"
            url={url}
            title={`${title}\n\n${description}`}
          >
            WhatsApp
          </ShareButton>
          <ShareButton
            Component={TelegramShareButton}
            Icon={TelegramIcon}
            color="#0088CC"
            url={url}
            title={`${title}\n\n${description}`}
          >
            Telegram
          </ShareButton>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleInstagramShare}
                  className="w-full h-auto flex flex-col items-center justify-center p-3 font-normal bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="rounded-full p-2 bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-700">
                    <Instagram size={24} className="text-white" />
                  </div>
                  <span className="mt-1 text-xs text-gray-800 dark:text-gray-200">Instagram</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Opens Instagram - you&apos;ll need to select the image manually</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <DropdownMenuItem asChild className="mt-2 p-0">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            onClick={handleCopyLink}
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copied ? "Link Copied!" : "Copy Link"}</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ShareButtonProps {
  Component: React.ComponentType<any>;
  Icon: React.ComponentType<any>;
  color: string;
  children: React.ReactNode;
  [key: string]: any;
}

function ShareButton({ Component, Icon, color, children, ...props }: ShareButtonProps) {
  return (
    <Component {...props} className="w-full">
      <Button
        variant="ghost"
        className="w-full h-auto flex flex-col items-center justify-center p-3 font-normal bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Icon size={32} round style={{ fill: color }} />
        <span className="mt-1 text-xs text-gray-800 dark:text-gray-200">{children}</span>
      </Button>
    </Component>
  );
}
