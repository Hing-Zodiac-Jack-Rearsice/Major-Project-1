import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsAndConditions = () => {
  const sections = [
    {
      title: "Introduction",
      content:
        "Sombot operates as an intermediary platform facilitating the sale and purchase of event tickets. Our role is limited to providing a platform for users to interact and transact. We do not hold any responsibility for the actual events or the transactions between users and event organizers.",
    },
    {
      title: "User Responsibilities",
      content:
        "Users are responsible for ensuring that their use of the platform complies with all applicable laws and regulations. Users must provide accurate and truthful information during the registration and transaction processes. Any fraudulent activity or misrepresentation will result in immediate termination of the user's account.",
    },
    {
      title: "Technical Issues",
      content:
        "If you encounter any technical issues while using our website, please contact our support team at bensey873@gmail.com. We will make reasonable efforts to resolve technical problems promptly but do not guarantee uninterrupted access to the website.",
    },
    {
      title: "Payment and Ticket Sales",
      content:
        "Sombot acts solely as a middleman in the ticket sales process. Any payment-related issues or disputes must be addressed directly with the event organizer. We are not responsible for any payment disputes between users and organizers. Users should verify the terms and conditions of the event organizer before making any transactions.",
    },
    {
      title: "Refunds and Cancellations",
      content:
        "Refunds and cancellations are subject to the policies of the event organizer. Sombot does not handle refunds or cancellations directly. Users must contact the event organizer for any refund or cancellation requests.",
    },
    {
      title: "Intellectual Property",
      content:
        "All content on this website, including text, graphics, logos, and images, is the property of Sombot or its content suppliers and is protected by international copyright laws. Unauthorized use of any content on this website is strictly prohibited.",
    },
    {
      title: "Limitation of Liability",
      content:
        "Sombot is not liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use our platform. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses.",
    },
    {
      title: "Changes to These Terms",
      content:
        "We reserve the right to amend these terms and conditions at any time. By continuing to use the website, you agree to be bound by the current version of these terms and conditions. It is your responsibility to review these terms periodically for any changes.",
    },
    {
      title: "Governing Law",
      content:
        "These terms and conditions are governed by and construed in accordance with the laws of [Your Country/State], and you irrevocably submit to the exclusive jurisdiction of the courts in that location.",
    },
    {
      title: "Contact Us",
      content:
        "If you have any questions about these terms and conditions, please contact us at bensey873@gmail.com.",
    },
  ];

  return (
    <div className="sm:px-6 px-4 mx-auto mb-10 mt-24">
      <Card>
        <CardHeader>
          <CardTitle className="sm:text-3xl text-2xlfont-bold">Terms and Conditions</CardTitle>
          <CardDescription>
            Welcome to Sombot. These terms and conditions outline the rules and regulations for the
            use of our website and services. By accessing this website, we assume you accept these
            terms and conditions in full. Do not continue to use Sombot if you do not agree to all
            of the terms and conditions stated on this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] pr-4">
            <Accordion type="single" collapsible className="w-full">
              {sections.map((section, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg text-left font-semibold">
                    {`${index + 1}. ${section.title}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{section.content}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAndConditions;
