"use client";
import React, { useEffect, useState } from "react";
import { Bar, Line, Scatter } from "react-chartjs-2";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import ChartCard from "@/components/ChartCard";
import { analyzeData } from "@/lib/analyticsService";
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
import { Loader2 } from "lucide-react";
import LoadingSpinner from "./ui/LoadingSpinner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

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

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/analytics");
      const data = await response.json();
      const analyzed = analyzeData(data.events, data.users);
      setAnalyticsData(analyzed);
    };

    fetchData();
  }, []);

  if (!analyticsData)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Cover Page
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(30);
    doc.text("Analytics Report", pageWidth / 2, pageHeight / 3, {
      align: "center",
    });
    doc.setFontSize(14);
    doc.text(`Generated on ${today}`, pageWidth / 2, pageHeight / 2, {
      align: "center",
    });

    // Executive Summary Page
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.text("Executive Summary", 14, 20);

    (doc as any).autoTable({
      startY: 30,
      head: [["Key Performance Indicators"]],
      body: [
        ["Total Revenue", `$${(analyticsData.totalRevenue || 0).toFixed(2)}`],
        ["Total Tickets Sold", analyticsData.totalTicketsSold || 0],
        [
          "Average Attendance Rate",
          `${(analyticsData.averageAttendanceRate || 0).toFixed(2)}%`,
        ],
        [
          "Top Performing Event",
          analyticsData.topSellingEvent?.eventName || "N/A",
        ],
        ["Top Event Sales", analyticsData.topSellingEvent?.ticketsSold || 0],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        fontSize: 12,
        fontStyle: "bold",
      },
      styles: { fontSize: 11, cellPadding: 5 },
    });

    // Event Performance Analysis Page
    doc.addPage();
    doc.setFontSize(24);
    doc.text("Event Performance Analysis", 14, 20);

    (doc as any).autoTable({
      startY: 30,
      head: [
        [
          "Event Name",
          "Tickets Sold",
          "Remaining",
          "Revenue ($)",
          "Attendance Rate",
        ],
      ],
      body: analyticsData.ticketsSoldPerEvent.map(
        (event: any, index: number) => [
          event.eventName,
          event.ticketsSold,
          analyticsData.remainingTicketsPerEvent[index].remainingTickets,
          analyticsData.salesOverTime[index].revenue.toFixed(2),
          `${(
            (event.ticketsSold /
              (event.ticketsSold +
                analyticsData.remainingTicketsPerEvent[index]
                  .remainingTickets)) *
            100
          ).toFixed(2)}%`,
        ]
      ),
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        fontSize: 12,
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    // Sales Analysis Page
    doc.addPage();
    doc.setFontSize(24);
    doc.text("Sales Analysis", 14, 20);

    // Add all charts
    const charts = document.querySelectorAll("canvas");
    let yPosition = 40;
    charts.forEach((canvas, index) => {
      if (index > 0 && index % 2 === 0) {
        doc.addPage();
        yPosition = 40;
      }
      const chartImage = canvas.toDataURL("image/png");
      doc.addImage(chartImage, "PNG", 14, yPosition, 180, 100);
      yPosition += 120;
    });

    // Add new sections
    doc.addPage();
    doc.setFontSize(24);
    doc.text("Customer Insights", 14, 20);

    (doc as any).autoTable({
      startY: 30,
      head: [["Metric", "Value"]],
      body: [
        [
          "Customer Retention Rate",
          `${analyticsData.customerRetentionRate.toFixed(2)}%`,
        ],
        [
          "Customer Lifetime Value",
          `$${analyticsData.customerLifetimeValue.toFixed(2)}`,
        ],
        [
          "Customer Acquisition Cost",
          `$${analyticsData.customerAcquisitionCost.toFixed(2)}`,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        fontSize: 12,
        fontStyle: "bold",
      },
      styles: { fontSize: 11, cellPadding: 5 },
    });

    doc.save("analytics_report.pdf");
  };

  const generateExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Executive Summary Sheet
    const summaryData = [
      ["Executive Summary"],
      ["Generated on", new Date().toLocaleDateString()],
      [],
      ["Key Performance Indicators", "Value", "Change from Previous Period"],
      ["Total Revenue", `$${(analyticsData.totalRevenue || 0).toFixed(2)}`, ""],
      ["Total Tickets Sold", analyticsData.totalTicketsSold || 0, ""],
      [
        "Average Attendance Rate",
        `${(analyticsData.averageAttendanceRate || 0).toFixed(2)}%`,
        "",
      ],
      [
        "Top Performing Event",
        analyticsData.topSellingEvent?.eventName || "N/A",
        "",
      ],
      ["Top Event Sales", analyticsData.topSellingEvent?.ticketsSold || 0, ""],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Executive Summary");

    // Event Performance Sheet
    const performanceData = [
      ["Event Performance Analysis"],
      [],
      ["Event Details"],
      [
        "Event Name",
        "Tickets Sold",
        "Remaining Tickets",
        "Revenue ($)",
        "Sales",
        "Attendance Rate",
        "Status",
      ],
      ...analyticsData.ticketsSoldPerEvent.map((event: any, index: number) => {
        const attendanceRate =
          (event.ticketsSold /
            (event.ticketsSold +
              analyticsData.remainingTicketsPerEvent[index].remainingTickets)) *
          100;
        return [
          event.eventName,
          event.ticketsSold,
          analyticsData.remainingTicketsPerEvent[index].remainingTickets,
          analyticsData.salesOverTime[index].revenue.toFixed(2),
          analyticsData.salesOverTime[index].sales,
          `${attendanceRate.toFixed(2)}%`,
          attendanceRate > 75
            ? "High Performing"
            : attendanceRate > 50
            ? "Moderate"
            : "Needs Attention",
        ];
      }),
    ];
    const performanceSheet = XLSX.utils.aoa_to_sheet(performanceData);
    XLSX.utils.book_append_sheet(
      workbook,
      performanceSheet,
      "Event Performance"
    );

    // Sales Analysis Sheet
    const salesData = [
      ["Sales Analysis"],
      [],
      ["Daily Sales Breakdown"],
      ["Date", "Number of Sales", "Revenue"],
      ...analyticsData.salesByEventDate.map((item: any) => [
        item.date,
        item.count,
        `$${(item.count * analyticsData.averageTicketPrice || 0).toFixed(2)}`,
      ]),
      [],
      ["Hourly Sales Distribution"],
      ["Hour", "Number of Sales", "Peak Time Status"],
      ...analyticsData.salesByEventStartTime.map((item: any) => [
        `${item.hour}:00`,
        item.count,
        item.count > (analyticsData.averageHourlySales || 0)
          ? "Peak Hour"
          : "Regular Hour",
      ]),
    ];
    const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales Analysis");

    // Attendance Analysis Sheet
    const attendanceData = [
      ["Attendance Analysis"],
      [],
      ["Event Attendance Breakdown"],
      [
        "Event Name",
        "Total Capacity",
        "Attended",
        "No Show",
        "Attendance Rate",
      ],
      ...analyticsData.ticketsSoldPerEvent.map((event: any) => [
        event.eventName,
        event.totalCapacity,
        event.attended,
        event.noShow,
        `${((event.attended / event.totalCapacity) * 100).toFixed(2)}%`,
      ]),
    ];
    const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(
      workbook,
      attendanceSheet,
      "Attendance Analysis"
    );

    // Set column widths and styling for all sheets
    const sheets = [
      "Executive Summary",
      "Event Performance",
      "Sales Analysis",
      "Attendance Analysis",
    ];
    sheets.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      worksheet["!cols"] = [
        { wch: 35 }, // Column A
        { wch: 20 }, // Column B
        { wch: 20 }, // Column C
        { wch: 20 }, // Column D
        { wch: 20 }, // Column E
        { wch: 20 }, // Column F
        { wch: 20 }, // Column G
      ];
    });

    XLSX.writeFile(workbook, "analytics_report.xlsx");
  };

  return (
    <div className="sm:pl-20 py-4 px-6">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Analytics Dashboard
      </motion.h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 items-stretch">
        {[
          { title: "Tickets Sold", value: analyticsData.totalTicketsSold || 0 },
          {
            title: "Total Revenue",
            value: `${(analyticsData.totalRevenue || 0).toFixed(2)} $`,
          },
          {
            title: "Top Selling Event",
            value: analyticsData.topSellingEvent?.eventName || "",
          },
          {
            title: "Top Event Sales",
            value: analyticsData.topSellingEvent?.ticketsSold || 0,
          },
          {
            title: "Avg Attendance",
            value: `${(analyticsData.averageAttendanceRate || 0).toFixed(2)}%`,
          },
          {
            title: "Capacity Utilization",
            value: `${analyticsData.capacityUtilization.toFixed(2)}%`,
          },
          {
            title: "Customer Retention",
            value: `${analyticsData.customerRetentionRate.toFixed(2)}%`,
          },
          {
            title: "Avg Ticket Price",
            value: `$${analyticsData.averageTicketPrice.toFixed(2)}`,
          },
        ].map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
            index={index}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Tickets Sold per Event"
          ChartComponent={Bar}
          data={{
            labels:
              analyticsData.ticketsSoldPerEvent?.map(
                (item: any) => item.eventName
              ) || [],
            datasets: [
              {
                label: "Tickets Sold",
                data:
                  analyticsData.ticketsSoldPerEvent?.map(
                    (item: any) => item.ticketsSold
                  ) || [],
                backgroundColor: "rgba(75, 192, 192, 0.8)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
              },
            ],
          }}
        />
        <ChartCard
          title="Remaining Tickets per Event"
          ChartComponent={Bar}
          data={{
            labels:
              analyticsData.remainingTicketsPerEvent?.map(
                (item: any) => item.eventName
              ) || [],
            datasets: [
              {
                label: "Remaining Tickets",
                data:
                  analyticsData.remainingTicketsPerEvent?.map(
                    (item: any) => item.remainingTickets
                  ) || [],
                backgroundColor: "rgba(255, 99, 132, 0.8)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 2,
              },
            ],
          }}
        />
        <ChartCard
          title="Sales by Event Start Time"
          ChartComponent={Line}
          data={{
            labels:
              analyticsData.salesByEventStartTime?.map(
                (item: any) => item.hour
              ) || [],
            datasets: [
              {
                label: "Sales",
                data:
                  analyticsData.salesByEventStartTime?.map(
                    (item: any) => item.count
                  ) || [],
                backgroundColor: "rgba(54, 162, 235, 0.8)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,
              },
            ],
          }}
        />
        <ChartCard
          title="Sales by Event Date"
          ChartComponent={Line}
          data={{
            labels:
              analyticsData.salesByEventDate?.map((item: any) => item.date) ||
              [],
            datasets: [
              {
                label: "Sales",
                data:
                  analyticsData.salesByEventDate?.map(
                    (item: any) => item.count
                  ) || [],
                backgroundColor: "rgba(255, 206, 86, 0.8)",
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 2,
              },
            ],
          }}
        />
        <ChartCard
          title="Sales and Revenue by Event"
          ChartComponent={Bar}
          data={{
            labels:
              analyticsData.salesOverTime?.map((item: any) => item.eventName) ||
              [],
            datasets: [
              {
                label: "Sales",
                data:
                  analyticsData.salesOverTime?.map((item: any) => item.sales) ||
                  [],
                backgroundColor: "rgba(255, 99, 132, 0.8)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 2,
              },
              {
                label: "Revenue",
                data:
                  analyticsData.salesOverTime?.map(
                    (item: any) => item.revenue
                  ) || [],
                backgroundColor: "rgba(54, 162, 235, 0.8)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,
              },
            ],
          }}
        />
        <ChartCard
          title="Ticket Sales vs Attendance"
          ChartComponent={Scatter}
          data={{
            datasets: [
              {
                label: "Engagement",
                data: analyticsData.engagementData || [],
                backgroundColor: "rgba(255, 206, 86, 0.8)",
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 2,
              },
            ],
          }}
        />
        <ChartCard
          title="Top-Selling Events"
          ChartComponent={Bar}
          data={{
            labels:
              analyticsData.ticketsSoldPerEvent?.map(
                (item: any) => item.eventName
              ) || [],
            datasets: [
              {
                label: "Tickets Sold",
                data:
                  analyticsData.ticketsSoldPerEvent?.map(
                    (item: any) => item.ticketsSold
                  ) || [],
                backgroundColor: "rgba(75, 192, 192, 0.8)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
              },
            ],
          }}
        />
        <ChartCard
          title="Monthly Revenue Trends"
          ChartComponent={Line}
          data={{
            labels:
              analyticsData.revenueByMonth?.map((item: any) => item.month) ||
              [],
            datasets: [
              {
                label: "Revenue",
                data:
                  analyticsData.revenueByMonth?.map(
                    (item: any) => item.revenue
                  ) || [],
                backgroundColor: "rgba(75, 192, 192, 0.8)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
              },
            ],
          }}
        />
        <ChartCard
          title="Event Popularity Scores"
          ChartComponent={Bar}
          data={{
            labels:
              analyticsData.eventPopularityScore?.map(
                (item: any) => item.eventName
              ) || [],
            datasets: [
              {
                label: "Popularity Score",
                data:
                  analyticsData.eventPopularityScore?.map(
                    (item: any) => item.popularity
                  ) || [],
                backgroundColor: "rgba(153, 102, 255, 0.8)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 2,
              },
            ],
          }}
        />
        <ChartCard
          title="Customer Retention Analysis"
          ChartComponent={Line}
          data={{
            labels:
              analyticsData.customerRetentionTrend?.map(
                (item: any) => item.period
              ) || [],
            datasets: [
              {
                label: "Retention Rate",
                data:
                  analyticsData.customerRetentionTrend?.map(
                    (item: any) => item.rate
                  ) || [],
                backgroundColor: "rgba(255, 159, 64, 0.8)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 2,
              },
            ],
          }}
        />
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Generate Full Report</h2>
        <div className="flex gap-4">
          <button
            onClick={generatePDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Generate PDF
          </button>
          <button
            onClick={generateExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Generate Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
