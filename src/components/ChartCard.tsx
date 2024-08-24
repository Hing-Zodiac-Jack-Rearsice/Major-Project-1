// @/components/ChartCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "./ui/card";
import { ChartComponentProps } from "../custom/ChartComponentProps";

interface ChartCardProps {
  title: string;
  ChartComponent: React.ComponentType<ChartComponentProps>;
  data: any;
  className?: string; // Add className to the props
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  ChartComponent,
  data,
}) => (
  <motion.div
    initial={{
      opacity: 0,
      x: title.includes("Sales") || title.includes("Revenue") ? -50 : 50,
    }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardContent>
        <ChartComponent
          data={data}
          options={{
            animation: {
              duration: 2000,
            },
          }}
        />
      </CardContent>
    </Card>
  </motion.div>
);

export default ChartCard;
