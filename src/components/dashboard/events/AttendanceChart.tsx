"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const chartConfig = {
  attended: {
    label: "Attended",
    color: "hsl(var(--chart-1))",
  },
  absent: {
    label: "Absent",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function AttendanceChart({ eventId }: any) {
  const [attendance, setAttendance] = React.useState<{ attended: number; absent: number } | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchAttendance();
  }, [eventId]);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/attendance/events/${eventId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch attendance data");
      }
      const data = await res.json();
      setAttendance({
        attended: data.attendance.filter((a: any) => a.status === "attended").length,
        absent: data.attendance.filter((a: any) => a.status === "absent").length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalAttendees = () => {
    return attendance ? attendance.attended + attendance.absent : 0;
  };

  const chartData = attendance
    ? [
        { status: "attended", value: attendance.attended, fill: chartConfig.attended.color },
        { status: "absent", value: attendance.absent, fill: chartConfig.absent.color },
      ]
    : [];

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <Card className="border-none">
        <CardContent>Error: {error}</CardContent>
      </Card>
    );

  return (
    <Card className="flex flex-col border-none">
      <CardHeader className="items-center pb-0">
        <CardTitle>Attendance</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="status" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {getTotalAttendees().toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Attendees
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing difference between attendees who were absent and attended
        </div>
      </CardFooter>
    </Card>
  );
}
