// @/components/StatCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "./ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default StatCard;
