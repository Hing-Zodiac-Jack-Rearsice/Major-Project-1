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

    // New metrics
    const averageTicketPrice = events.reduce((sum, event) => sum + event.ticketPrice, 0) / events.length;
    const totalCapacity = events.reduce((sum, event) => sum + event.ticketAmount, 0);
    const capacityUtilization = (totalTicketsSold / totalCapacity) * 100;

    // Revenue trends
    const revenueByMonth = analyzeRevenueByMonth(events);
    const projectedRevenue = calculateProjectedRevenue(events);

    // Customer insights
    const customerRetentionRate = calculateCustomerRetention(events);
    const customerAcquisitionCost = calculateCAC(events);
    const customerLifetimeValue = calculateCLTV(events);

    // Event performance metrics
    const eventPopularityScore = calculateEventPopularity(events);
    const peakBookingPeriods = analyzePeakBookingPeriods(events);
    const seasonalTrends = analyzeSeasonalTrends(events);

    // Marketing effectiveness
    const conversionRates = calculateConversionRates(events);
    const marketingROI = calculateMarketingROI(events);

    // Geographic analysis
    const locationBasedPerformance = analyzeLocationPerformance(events);

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
        engagementData,
        averageTicketPrice,
        totalCapacity,
        capacityUtilization,
        revenueByMonth,
        projectedRevenue,
        customerRetentionRate,
        customerAcquisitionCost,
        customerLifetimeValue,
        eventPopularityScore,
        peakBookingPeriods,
        seasonalTrends,
        conversionRates,
        marketingROI,
        locationBasedPerformance,
    };
}

function analyzeRevenueByMonth(events: EventWithRelations[]) {
    const monthlyRevenue = new Map();
    events.forEach(event => {
        const month = new Date(event.startDate).toLocaleString('default', { month: 'long', year: 'numeric' });
        const revenue = event.sales.reduce((sum, sale) => sum + sale.price, 0);
        monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + revenue);
    });
    return Array.from(monthlyRevenue, ([month, revenue]) => ({ month, revenue }));
}

function calculateProjectedRevenue(events: EventWithRelations[]) {
    // Simple linear projection based on current sales trend
    const revenueData = events.map(event => ({
        date: new Date(event.startDate),
        revenue: event.sales.reduce((sum, sale) => sum + sale.price, 0)
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    if (revenueData.length < 2) return null;

    const firstRevenue = revenueData[0].revenue;
    const lastRevenue = revenueData[revenueData.length - 1].revenue;
    const growthRate = (lastRevenue - firstRevenue) / firstRevenue;

    return {
        currentRevenue: lastRevenue,
        projectedGrowth: growthRate,
        projectedNextMonth: lastRevenue * (1 + growthRate)
    };
}

function calculateCustomerRetention(events: EventWithRelations[]) {
    const userPurchases = new Map();
    events.forEach(event => {
        event.sales.forEach(sale => {
            const purchases = userPurchases.get(sale.userEmail) || [];
            purchases.push(event.startDate);
            userPurchases.set(sale.userEmail, purchases);
        });
    });

    const repeatCustomers = Array.from(userPurchases.values()).filter(purchases => purchases.length > 1).length;
    const totalCustomers = userPurchases.size;

    return (repeatCustomers / totalCustomers) * 100;
}

function calculateEventPopularity(events: EventWithRelations[]) {
    return events.map(event => ({
        eventName: event.eventName,
        popularity: calculatePopularityScore(event)
    })).sort((a, b) => b.popularity - a.popularity);
}

function calculatePopularityScore(event: EventWithRelations) {
    const salesRate = event.sales.length / event.ticketAmount;
    const attendanceRate = event.attendances.length / event.tickets.length;
    return (salesRate * 0.6 + attendanceRate * 0.4) * 100; // Weighted score
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

function calculateCAC(events: EventWithRelations[]) {
    // Simplified CAC calculation
    // Assuming a fixed marketing cost per event of $100 for demonstration
    const marketingCostPerEvent = 100;
    const totalMarketingCost = events.length * marketingCostPerEvent;

    // Total number of unique customers
    const uniqueCustomers = new Set(
        events.flatMap(event => event.sales.map(sale => sale.userEmail))
    ).size;

    return uniqueCustomers ? totalMarketingCost / uniqueCustomers : 0;
}

function calculateCLTV(events: EventWithRelations[]) {
    // Calculate average revenue per customer
    const customerRevenue = new Map<string, number>();

    events.forEach(event => {
        event.sales.forEach(sale => {
            const currentRevenue = customerRevenue.get(sale.userEmail) || 0;
            customerRevenue.set(sale.userEmail, currentRevenue + sale.price);
        });
    });

    const totalRevenue = Array.from(customerRevenue.values()).reduce((sum, rev) => sum + rev, 0);
    const averageRevenue = totalRevenue / customerRevenue.size;

    // Assuming average customer lifespan of 2 years
    const averageLifespan = 2;
    return averageRevenue * averageLifespan;
}

function analyzePeakBookingPeriods(events: EventWithRelations[]) {
    const bookingPeriods = new Map<string, number>();

    events.forEach(event => {
        // Use the event's start date to determine the booking period
        const startDate = new Date(event.startDate);
        const month = startDate.toLocaleString('default', { month: 'long' });
        const dayOfWeek = startDate.toLocaleString('default', { weekday: 'long' });
        const timeOfDay = getTimeOfDay(startDate.getHours());

        // Track sales by month
        bookingPeriods.set(month, (bookingPeriods.get(month) || 0) + event.sales.length);
        // Track sales by day of week
        bookingPeriods.set(dayOfWeek, (bookingPeriods.get(dayOfWeek) || 0) + event.sales.length);
        // Track sales by time of day
        bookingPeriods.set(timeOfDay, (bookingPeriods.get(timeOfDay) || 0) + event.sales.length);
    });

    return Array.from(bookingPeriods, ([period, count]) => ({ period, count }))
        .sort((a, b) => b.count - a.count);
}

function getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
}

function analyzeSeasonalTrends(events: EventWithRelations[]) {
    const seasonalData = new Map<string, number>();

    events.forEach(event => {
        const date = new Date(event.startDate);
        const season = getSeason(date);
        const year = date.getFullYear();
        const period = `${season} ${year}`;

        const revenue = event.sales.reduce((sum, sale) => sum + sale.price, 0);
        seasonalData.set(period, (seasonalData.get(period) || 0) + revenue);
    });

    return Array.from(seasonalData, ([period, revenue]) => ({ period, revenue }))
        .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
}

function getSeason(date: Date): string {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
}

function calculateConversionRates(events: EventWithRelations[]) {
    return events.map(event => {
        const ticketConversionRate = (event.sales.length / event.ticketAmount) * 100;
        const attendanceConversionRate = event.attendances.length > 0 ?
            (event.attendances.length / event.tickets.length) * 100 : 0;

        return {
            eventName: event.eventName,
            ticketConversionRate,
            attendanceConversionRate,
            totalSales: event.sales.length,
            totalAttendance: event.attendances.length
        };
    });
}

function calculateMarketingROI(events: EventWithRelations[]) {
    // Assuming a fixed marketing cost per event of $100 for demonstration
    const marketingCostPerEvent = 100;

    return events.map(event => {
        const revenue = event.sales.reduce((sum, sale) => sum + sale.price, 0);
        const marketingCost = marketingCostPerEvent;
        const roi = ((revenue - marketingCost) / marketingCost) * 100;

        return {
            eventName: event.eventName,
            revenue,
            marketingCost,
            roi
        };
    });
}

function analyzeLocationPerformance(events: EventWithRelations[]) {
    const locationData = new Map<string, {
        totalRevenue: number,
        totalSales: number,
        events: number
    }>();

    events.forEach(event => {
        const location = event.location;
        const currentData = locationData.get(location) || {
            totalRevenue: 0,
            totalSales: 0,
            events: 0
        };

        const revenue = event.sales.reduce((sum, sale) => sum + sale.price, 0);

        locationData.set(location, {
            totalRevenue: currentData.totalRevenue + revenue,
            totalSales: currentData.totalSales + event.sales.length,
            events: currentData.events + 1
        });
    });

    return Array.from(locationData, ([location, data]) => ({
        location,
        totalRevenue: data.totalRevenue,
        totalSales: data.totalSales,
        averageRevenuePerEvent: data.totalRevenue / data.events,
        numberOfEvents: data.events
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
}
