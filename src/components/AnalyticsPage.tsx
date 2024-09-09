// @/components/AnalyticsPage.tsx

"use client";
import React from "react";
import { Bar, Scatter, Line, Pie } from "react-chartjs-2";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import ChartCard from "@/components/ChartCard";
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

// Constants
const TOTAL_TIME_TO_SELL_OUT = 10; // in days
const NUMBER_OF_TICKETS_SOLD = 500;
const AVERAGE_TICKET_SALES_TIME =
  TOTAL_TIME_TO_SELL_OUT / NUMBER_OF_TICKETS_SOLD;

// Chart Data
const barData = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Total Sales",
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: "rgba(255, 99, 132, 0.8)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 2,
      hoverBackgroundColor: "rgba(255, 99, 132, 1)",
      hoverBorderColor: "rgba(255, 99, 132, 1)",
    },
  ],
};

const scatterData = {
  datasets: [
    {
      label: "Engagement",
      data: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 4 },
        { x: 4, y: 5 },
        { x: 5, y: 6 },
      ],
      backgroundColor: "rgba(54, 162, 235, 0.8)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 2,
      hoverBackgroundColor: "rgba(54, 162, 235, 1)",
      hoverBorderColor: "rgba(54, 162, 235, 1)",
    },
  ],
};

const lineData = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Revenue",
      data: [12000, 15000, 18000, 20000, 22000, 25000, 27000],
      fill: false,
      backgroundColor: "rgba(255, 206, 86, 0.8)",
      borderColor: "rgba(255, 206, 86, 1)",
      borderWidth: 2,
      hoverBackgroundColor: "rgba(255, 206, 86, 1)",
      hoverBorderColor: "rgba(255, 206, 86, 1)",
    },
  ],
};

const pieData = {
  labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  datasets: [
    {
      label: "Attendee Demographics",
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        "rgba(255, 99, 132, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(255, 206, 86, 0.8)",
        "rgba(75, 192, 192, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(255, 159, 64, 0.8)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
      hoverBorderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ],
    },
  ],
};

// Card Data
const cardData = [
  { title: "Tickets Sold", value: 567 },
  {
    title: "Average Ticket Sales Time",
    value: `${AVERAGE_TICKET_SALES_TIME.toFixed(2)} days/ticket`,
  },
  { title: "Average Attendance Rate", value: "75%" },
  { title: "Revenue per Attendee", value: "$45" },
  { title: "Event Duration", value: "3 hours" },
  { title: "Feedback Score", value: "4.5/5" },
];

const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-6 pl-20">
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Analytics Dashboard
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {cardData.map((item, index) => (
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
          title="Sales Over Time"
          ChartComponent={Bar}
          data={barData}
        />
        <ChartCard
          title="Engagement Scatter Plot"
          ChartComponent={Scatter}
          data={scatterData}
        />
        <ChartCard
          title="Revenue Over Time"
          ChartComponent={Line}
          data={lineData}
        />
        <ChartCard
          title="Attendee Demographics"
          ChartComponent={Pie}
          data={pieData}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
