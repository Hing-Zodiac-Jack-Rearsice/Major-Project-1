"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import ChartCard from "@/components/ChartCard";
import { SalesCard } from "./SalesCard";
import { AttendanceChart } from "./AttendanceChart";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Ticket,
  DollarSign,
  UserCheck,
  TrendingDown,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Activity,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Sale {
  price: number;
  createdAt?: string;
  userEmail: string;
}

interface EventAnalyticsProps {
  event: any;
  ticketsLeft: number;
}

// Add these helper functions at the top of the component
function getAttendanceStatus(attendances: any[]) {
  return {
    attended:
      attendances.filter((a: any) => a.status === "attended").length || 0,
    absent: attendances.filter((a: any) => a.status === "absent").length || 0,
    pending: attendances.filter((a: any) => a.status === "pending").length || 0,
  };
}

function getDaysUntilEvent(startDate: string) {
  if (!startDate) return 0;
  try {
    return Math.max(
      0,
      Math.ceil(
        (new Date(startDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  } catch (error) {
    console.error("Invalid date:", startDate);
    return 0;
  }
}

export function EventAnalytics({ event, ticketsLeft }: EventAnalyticsProps) {
  const [salesData, setSalesData] = React.useState<{
    sales: Sale[];
    totalRevenue: number;
  } | null>(null);
  const [attendanceData, setAttendanceData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch sales data
  React.useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/sales/${event?.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch sales data");
        }
        const data = await res.json();
        setSalesData({
          sales: data.sales || [],
          totalRevenue: data.totalRevenue || 0,
        });
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
        setSalesData({ sales: [], totalRevenue: 0 });
      }
    };

    if (event?.id) {
      fetchSales();
    }
  }, [event?.id]);

  // Fetch attendance data
  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`/api/attendance/events/${event?.id}`);
        const data = await res.json();
        setAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (event?.id) {
      fetchAttendance();
    }
  }, [event?.id]);

  // Use the fetched data instead of event prop data
  const sales: Sale[] = salesData?.sales || [];
  const revenue = salesData?.totalRevenue || 0;
  const attendances = attendanceData?.attendance || [];
  const tickets = event?.tickets || [];

  const attendanceRate =
    tickets.length > 0
      ? (attendances.filter((a: any) => a.status === "attended").length /
          tickets.length) *
        100
      : 0;

  const ticketsSold = event?.ticketAmount
    ? event.ticketAmount - ticketsLeft
    : 0;
  const ticketPercentage = event?.ticketAmount
    ? (ticketsSold / event.ticketAmount) * 100
    : 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return "0%";
    return `${value.toFixed(1)}%`;
  };

  // Format number
  const formatNumber = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return "0";
    return value.toFixed(1);
  };

  // Calculate sales by hour of day with validation
  const salesByHour = Array(24).fill(0);
  sales.forEach((sale: Sale) => {
    if (sale.createdAt) {
      try {
        const hour = new Date(sale.createdAt).getHours();
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          salesByHour[hour]++;
        }
      } catch (error) {
        console.error("Invalid date:", sale.createdAt);
      }
    }
  });

  // Calculate daily sales trend with validation
  const dailySales = new Map();
  sales.forEach((sale: Sale) => {
    if (sale.createdAt) {
      try {
        const date = new Date(sale.createdAt);
        if (!isNaN(date.getTime())) {
          const dateStr = date.toISOString().split("T")[0];
          dailySales.set(dateStr, (dailySales.get(dateStr) || 0) + 1);
        }
      } catch (error) {
        console.error("Invalid date:", sale.createdAt);
      }
    }
  });
  const sortedDailySales = Array.from(dailySales.entries()).sort();

  // New metrics calculations with validation
  const averageTicketPrice = ticketsSold > 0 ? revenue / ticketsSold : 0;
  const peakSalesHour = salesByHour.indexOf(Math.max(...salesByHour));

  // Sales velocity calculation with validation
  const daysSinceCreation = Math.max(
    1,
    Math.ceil(
      (new Date().getTime() -
        new Date(event?.createdAt || new Date()).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
  const salesVelocity = ticketsSold / daysSinceCreation;

  // Sales momentum calculation
  const recentSales = sales.filter((sale: Sale) => {
    if (!sale.createdAt) return false;
    try {
      const saleDate = new Date(sale.createdAt);
      return (
        !isNaN(saleDate.getTime()) &&
        saleDate.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      );
    } catch {
      return false;
    }
  }).length;

  const weeklyAverage = ticketsSold / (daysSinceCreation / 7);
  const salesMomentum = recentSales - weeklyAverage;

  // Projected sellout date calculation
  const remainingDays =
    salesVelocity > 0 ? ticketsLeft / salesVelocity : Infinity;
  const projectedSelloutDate = new Date();
  projectedSelloutDate.setDate(projectedSelloutDate.getDate() + remainingDays);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg. {formatCurrency(averageTicketPrice)} per ticket
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Tickets Sold
                </CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ticketsSold}</div>
                <Progress value={ticketPercentage} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {ticketPercentage.toFixed(1)}% of capacity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Attendance Rate
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attendanceRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {attendances.length} of {tickets.length} attended
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Time Until Event
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <TimeUntilEvent startDate={event?.startDate} />
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Sales Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Hourly Sales Distribution"
              ChartComponent={Bar}
              data={{
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                datasets: [
                  {
                    label: "Sales",
                    data: salesByHour,
                    backgroundColor: "rgba(75, 192, 192, 0.8)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                  },
                ],
              }}
            />

            <ChartCard
              title="Daily Sales Trend"
              ChartComponent={Line}
              data={{
                labels: sortedDailySales.map(([date]) => date),
                datasets: [
                  {
                    label: "Sales",
                    data: sortedDailySales.map(([, count]) => count),
                    borderColor: "rgba(54, 162, 235, 1)",
                    tension: 0.1,
                  },
                ],
              }}
            />

            <ChartCard
              title="Ticket Status Distribution"
              ChartComponent={Doughnut}
              data={{
                labels: ["Sold", "Available"],
                datasets: [
                  {
                    data: [ticketsSold, ticketsLeft],
                    backgroundColor: [
                      "rgba(75, 192, 192, 0.8)",
                      "rgba(255, 99, 132, 0.8)",
                    ],
                  },
                ],
              }}
            />

            <ChartCard
              title="Attendance Status"
              ChartComponent={Doughnut}
              data={{
                labels: ["Attended", "Not Attended", "Pending"],
                datasets: [
                  {
                    data: Object.values(getAttendanceStatus(attendances)),
                    backgroundColor: [
                      "rgba(75, 192, 192, 0.8)",
                      "rgba(255, 99, 132, 0.8)",
                      "rgba(255, 206, 86, 0.8)",
                    ],
                  },
                ],
              }}
            />
          </div>

          <Separator />

          {/* Performance Indicators */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Capacity Utilization</span>
                      <span className="font-medium">
                        {ticketPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={ticketPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Attendance Rate</span>
                      <span className="font-medium">
                        {attendanceRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={attendanceRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* New Sales Insights Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sales Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sales Velocity
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(salesVelocity)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {salesVelocity > 0
                      ? "Tickets sold per day"
                      : "No sales yet"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sales Momentum
                  </CardTitle>
                  {salesMomentum >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {salesMomentum >= 0 ? "+" : ""}
                    {salesMomentum.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compared to weekly average
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Projected Sellout
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {ticketsLeft === 0
                      ? "Sold Out!"
                      : salesVelocity > 0
                      ? projectedSelloutDate.toLocaleDateString()
                      : "Insufficient data"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ticketsLeft > 0 ? "At current sales velocity" : ""}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Peak Times Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Peak Times Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Peak Sales Hour</span>
                      <span className="font-medium">
                        {salesByHour.some((count) => count > 0)
                          ? `${peakSalesHour}:00`
                          : "No sales data"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {salesByHour.some((count) => count > 0)
                        ? "Best time for promotional activities"
                        : "Insufficient data for analysis"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Days Until Event</span>
                      <span className="font-medium">
                        {getDaysUntilEvent(event?.startDate)} days
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        100,
                        (ticketsSold / (event?.ticketAmount || 1)) * 100
                      )}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sales Target Progress</span>
                      <span className="font-medium">
                        {formatPercentage(
                          (ticketsSold / (event?.ticketAmount || 1)) * 100
                        )}
                      </span>
                    </div>
                    <Progress
                      value={(ticketsSold / (event?.ticketAmount || 1)) * 100}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {ticketsSold} of {event?.ticketAmount || 0} tickets sold
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* New Revenue Analysis Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Revenue Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Average Revenue per Ticket</span>
                      <span className="font-medium">
                        {formatCurrency(averageTicketPrice)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ticket price: {formatCurrency(event?.ticketPrice || 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Projected Total Revenue</span>
                      <span className="font-medium">
                        {formatCurrency(
                          (event?.ticketPrice || 0) * (event?.ticketAmount || 0)
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current: {formatCurrency(revenue)}
                    </div>
                    <Progress
                      value={
                        (revenue /
                          ((event?.ticketPrice || 0) *
                            (event?.ticketAmount || 1))) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Existing Analytics Components */}
          <div className="grid grid-cols-1 gap-6">
            <SalesCard eventId={event?.id} />
            <AttendanceChart eventId={event?.id} />
          </div>
        </>
      )}
    </div>
  );
}

function TimeUntilEvent({ startDate }: { startDate?: string }) {
  const [timeLeft, setTimeLeft] = React.useState<string>("");

  React.useEffect(() => {
    if (!startDate) {
      setTimeLeft("Date not set");
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(startDate).getTime() - new Date().getTime();

      if (difference < 0) {
        setTimeLeft("Event has ended");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <>
      <div className="text-2xl font-bold">{timeLeft}</div>
      <p className="text-xs text-muted-foreground">Until event starts</p>
    </>
  );
}
