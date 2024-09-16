// // components/AnalyticsPage.tsx
// "use client";
// import React, { useEffect, useState } from "react";
// import { Bar, Scatter, Line, Pie } from "react-chartjs-2";
// import { motion } from "framer-motion";
// import StatCard from "@/components/StatCard";
// import ChartCard from "@/components/ChartCard";
// import { analyzeData } from "@/lib/analyticsService";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// const AnalyticsPage: React.FC = () => {
//   const [analyticsData, setAnalyticsData] = useState<any>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       const response = await fetch("/api/analytics");
//       const data = await response.json();
//       const analyzed = analyzeData(data.events, data.users);
//       setAnalyticsData(analyzed);
//     };

//     fetchData();
//   }, []);

//   if (!analyticsData) return <div>Loading...</div>;

//   const cardData = [
//     { title: "Tickets Sold", value: analyticsData.totalTicketsSold },
//     { title: "Total Revenue", value: `$${analyticsData.totalRevenue}` },
//     {
//       title: "Average Attendance Rate",
//       value: `${analyticsData.averageAttendanceRate.toFixed(2)}%`,
//     },
//   ];

//   const barData = {
//     labels: analyticsData.salesOverTime.map((item: any) => item.eventName),
//     datasets: [
//       {
//         label: "Sales",
//         data: analyticsData.salesOverTime.map((item: any) => item.sales),
//         backgroundColor: "rgba(255, 99, 132, 0.8)",
//         borderColor: "rgba(255, 99, 132, 1)",
//         borderWidth: 2,
//       },
//       {
//         label: "Revenue",
//         data: analyticsData.salesOverTime.map((item: any) => item.revenue),
//         backgroundColor: "rgba(54, 162, 235, 0.8)",
//         borderColor: "rgba(54, 162, 235, 1)",
//         borderWidth: 2,
//       },
//     ],
//   };

//   const scatterData = {
//     datasets: [
//       {
//         label: "Engagement",
//         data: analyticsData.engagementData,
//         backgroundColor: "rgba(255, 206, 86, 0.8)",
//         borderColor: "rgba(255, 206, 86, 1)",
//         borderWidth: 2,
//       },
//     ],
//   };

//   const pieData = {
//     labels: ["Users with Profile Image", "Users without Profile Image"],
//     datasets: [
//       {
//         label: "Attendee Demographics",
//         data: [
//           analyticsData.attendeeDemographics.withImage,
//           analyticsData.attendeeDemographics.withoutImage,
//         ],
//         backgroundColor: [
//           "rgba(75, 192, 192, 0.8)",
//           "rgba(153, 102, 255, 0.8)",
//         ],
//         borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
//         borderWidth: 2,
//       },
//     ],
//   };

//   return (
//     <div className="p-6 pl-20">
//       <motion.h1
//         className="text-3xl font-bold mb-6"
//         initial={{ opacity: 0, y: -50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         Analytics Dashboard
//       </motion.h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
//         {cardData.map((item, index) => (
//           <StatCard
//             key={index}
//             title={item.title}
//             value={item.value}
//             index={index}
//           />
//         ))}
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <ChartCard
//           title="Sales and Revenue by Event"
//           ChartComponent={Bar}
//           data={barData}
//         />
//         <ChartCard
//           title="Ticket Sales vs Attendance"
//           ChartComponent={Scatter}
//           data={scatterData}
//         />
//         <ChartCard
//           title="Attendee Demographics"
//           ChartComponent={Pie}
//           data={pieData}
//         />
//       </div>
//     </div>
//   );
// };

// export default AnalyticsPage;

// second edition

"use client";
import React, { useEffect, useState } from "react";
import { Bar, Line, Scatter, Pie, Doughnut } from "react-chartjs-2";
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

  if (!analyticsData) return <div>Loading...</div>;

  const cardData = [
    { title: "Tickets Sold", value: analyticsData.totalTicketsSold },
    {
      title: "Total Revenue",
      value: `${analyticsData.totalRevenue.toFixed(2)} $`,
    },
    {
      title: "Top Selling Event",
      value: analyticsData.topSellingEvent.eventName,
    },
    {
      title: "Top Event Sales",
      value: analyticsData.topSellingEvent.ticketsSold,
    },
    {
      title: "Average Attendance Rate",
      value: `${analyticsData.averageAttendanceRate.toFixed(2)}%`,
    },
  ];

  const ticketsSoldData = {
    labels: analyticsData.ticketsSoldPerEvent.map(
      (item: any) => item.eventName
    ),
    datasets: [
      {
        label: "Tickets Sold",
        data: analyticsData.ticketsSoldPerEvent.map(
          (item: any) => item.ticketsSold
        ),
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const remainingTicketsData = {
    labels: analyticsData.remainingTicketsPerEvent.map(
      (item: any) => item.eventName
    ),
    datasets: [
      {
        label: "Remaining Tickets",
        data: analyticsData.remainingTicketsPerEvent.map(
          (item: any) => item.remainingTickets
        ),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
    ],
  };

  const salesByEventStartTimeData = {
    labels: analyticsData.salesByEventStartTime.map((item: any) => item.hour),
    datasets: [
      {
        label: "Sales",
        data: analyticsData.salesByEventStartTime.map(
          (item: any) => item.count
        ),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const salesByEventDateData = {
    labels: analyticsData.salesByEventDate.map((item: any) => item.date),
    datasets: [
      {
        label: "Sales",
        data: analyticsData.salesByEventDate.map((item: any) => item.count),
        backgroundColor: "rgba(255, 206, 86, 0.8)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: analyticsData.salesOverTime.map((item: any) => item.eventName),
    datasets: [
      {
        label: "Sales",
        data: analyticsData.salesOverTime.map((item: any) => item.sales),
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
      {
        label: "Revenue",
        data: analyticsData.salesOverTime.map((item: any) => item.revenue),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const scatterData = {
    datasets: [
      {
        label: "Engagement",
        data: analyticsData.engagementData,
        backgroundColor: "rgba(255, 206, 86, 0.8)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 2,
      },
    ],
  };

  const topSellingEventsData = {
    labels: analyticsData.ticketsSoldPerEvent.map(
      (item: any) => item.eventName
    ),
    datasets: [
      {
        label: "Tickets Sold",
        data: analyticsData.ticketsSoldPerEvent.map(
          (item: any) => item.ticketsSold
        ),
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

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
          title="Tickets Sold per Event"
          ChartComponent={Bar}
          data={ticketsSoldData}
        />
        <ChartCard
          title="Remaining Tickets per Event"
          ChartComponent={Bar}
          data={remainingTicketsData}
        />
        <ChartCard
          title="Sales by Event Start Time"
          ChartComponent={Line}
          data={salesByEventStartTimeData}
        />
        <ChartCard
          title="Sales by Event Date"
          ChartComponent={Line}
          data={salesByEventDateData}
        />
        <ChartCard
          title="Sales and Revenue by Event"
          ChartComponent={Bar}
          data={barData}
        />
        <ChartCard
          title="Ticket Sales vs Attendance"
          ChartComponent={Scatter}
          data={scatterData}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Selling Events Chart */}
        <ChartCard
          title="Top-Selling Events"
          ChartComponent={Bar}
          data={topSellingEventsData}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
