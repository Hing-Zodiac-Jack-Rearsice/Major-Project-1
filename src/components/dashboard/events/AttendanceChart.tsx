"use client";

import * as React from "react";
import {
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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

export function AttendanceChart({ eventId }: { eventId: string }) {
  const [attendance, setAttendance] = React.useState<{
    attended: number;
    absent: number;
  } | null>(null);
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
        attended: data.attendance.filter((a: any) => a.status === "attended")
          .length,
        absent: data.attendance.filter((a: any) => a.status === "absent")
          .length,
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

  const formatTooltipValue = (value: number, total: number) => {
    const percentage = ((value / total) * 100).toFixed(1);
    return `${value} (${percentage}%)`;
  };

  const chartData = attendance
    ? [
        {
          status: "Attended",
          value: attendance.attended,
          fill: chartConfig.attended.color,
        },
        {
          status: "Absent",
          value: attendance.absent,
          fill: chartConfig.absent.color,
        },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>
          Track attendance statistics for this event
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : attendance && getTotalAttendees() > 0 ? (
          <div className="space-y-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const total = getTotalAttendees();
                        const value = payload[0].value as number;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold">
                                {payload[0].name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">
                                  {value}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ({percentage}%)
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                of {total} total attendees
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Added Legend */}
            <div className="flex justify-center items-center gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chartConfig.attended.color }}
                />
                <span className="text-sm font-medium">
                  Attended ({attendance.attended})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chartConfig.absent.color }}
                />
                <span className="text-sm font-medium">
                  Absent ({attendance.absent})
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Attendance Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {(
                      (attendance.attended / getTotalAttendees()) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Attendees
                  </p>
                  <p className="text-2xl font-bold">{getTotalAttendees()}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No attendance data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
