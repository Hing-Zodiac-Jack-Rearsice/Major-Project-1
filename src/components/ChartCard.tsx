import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  ChartComponent: React.ComponentType<any>;
  data: any;
  icon?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, ChartComponent, data, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <ChartComponent data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </CardContent>
    </Card>
  );
};

export default ChartCard;
