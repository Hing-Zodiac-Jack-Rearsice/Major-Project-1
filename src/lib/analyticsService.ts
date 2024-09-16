// // lib/analyticsService.ts
// import { Event, User, Ticket, Attendance, Sale } from '@prisma/client';

// type EventWithRelations = Event & {
//     tickets: Ticket[];
//     attendances: Attendance[];
//     sales: Sale[];
// };

// export function analyzeData(events: EventWithRelations[], users: User[]) {
//     const totalTicketsSold = events.reduce((sum, event) => sum + event.tickets.length, 0);
//     const totalRevenue = events.reduce((sum, event) => sum + event.sales.reduce((eventSum, sale) => eventSum + sale.price, 0), 0);
//     const averageAttendanceRate = events.reduce((sum, event) => sum + (event.attendances.length / event.ticketAmount), 0) / events.length * 100;

//     // new added data

//     const salesOverTime = events.map(event => ({
//         eventName: event.eventName,
//         sales: event.sales.length,
//         revenue: event.sales.reduce((sum, sale) => sum + sale.price, 0),
//     }));

//     const engagementData = events.map(event => ({
//         x: event.tickets.length,
//         y: event.attendances.length
//     }));

//     const attendeeDemographics = calculateAttendeeDemographics(events, users);

//     return {
//         totalTicketsSold,
//         totalRevenue,
//         averageAttendanceRate,
//         salesOverTime,
//         engagementData,
//         attendeeDemographics,
//     };
// }

// function calculateAttendeeDemographics(events: EventWithRelations[], users: User[]) {
//     const attendeeEmails = new Set(events.flatMap(event => event.attendances.map(attendance => attendance.userEmail)));
//     const attendees = users.filter(user => attendeeEmails.has(user.email || ''));

//     // This is a simplified demographics calculation. In a real-world scenario, you'd have more user data to work with.
//     const demographics = {
//         withImage: attendees.filter(user => user.image).length,
//         withoutImage: attendees.filter(user => !user.image).length,
//     };

//     return demographics;
// }



import { Event, User, Ticket, Attendance, Sale } from '@prisma/client';

type EventWithRelations = Event & {
    tickets: Ticket[];
    attendances: Attendance[];
    sales: Sale[];
};

export function analyzeData(events: EventWithRelations[], users: User[]) {
    const totalRevenue = events.reduce((sum, event) => sum + event.sales.reduce((eventSum, sale) => eventSum + sale.price, 0), 0);
    const totalTicketsSold = events.reduce((sum, event) => sum + event.tickets.length, 0);
    const averageAttendanceRate = events.reduce((sum, event) => sum + (event.attendances.length / event.ticketAmount), 0) / events.length * 100;

    const ticketsSoldPerEvent = events.map(event => ({
        eventName: event.eventName,
        ticketsSold: event.tickets.length,
    }));

    const topSellingEvent = [...ticketsSoldPerEvent].sort((a, b) => b.ticketsSold - a.ticketsSold)[0];

    const remainingTicketsPerEvent = events.map(event => ({
        eventName: event.eventName,
        remainingTickets: event.ticketAmount - event.tickets.length,
    }));

    // We'll use event start dates for time-based analysis instead of sale creation dates
    const salesByEventStartTime = analyzeSalesByEventStartTime(events);

    const salesByEventDate = analyzeSalesByEventDate(events);

    const salesOverTime = events.map(event => ({
        eventName: event.eventName,
        sales: event.sales.length,
        revenue: event.sales.reduce((sum, sale) => sum + sale.price, 0),
    }));

    const engagementData = events.map(event => ({
        x: event.tickets.length,
        y: event.attendances.length
    }));

    return {
        salesOverTime,
        totalRevenue,
        ticketsSoldPerEvent,
        topSellingEvent,
        remainingTicketsPerEvent,
        salesByEventStartTime,
        salesByEventDate,
        averageAttendanceRate,
        totalTicketsSold,
        engagementData
    };
}

function analyzeSalesByEventStartTime(events: EventWithRelations[]) {
    const timeSlots = Array(24).fill(0);
    events.forEach(event => {
        const hour = new Date(event.startDate).getHours();
        timeSlots[hour] += event.sales.length;
    });
    return timeSlots.map((count, hour) => ({ hour, count }));
}

function analyzeSalesByEventDate(events: EventWithRelations[]) {
    const salesByDate = new Map();
    events.forEach(event => {
        const date = new Date(event.startDate).toISOString().split('T')[0];
        salesByDate.set(date, (salesByDate.get(date) || 0) + event.sales.length);
    });
    return Array.from(salesByDate, ([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}