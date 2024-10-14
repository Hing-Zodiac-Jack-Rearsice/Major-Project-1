"use client";

import * as React from "react";
import { DollarSign, TrendingUp, ShoppingCart } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SalesCard({ eventId }: any) {
  const [totalSales, setTotalSales] = React.useState(0);
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchSales = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sales/${eventId}`);
      const data = await res.json();
      setTotalSales(data.sales.length);

      let revenue = 0;
      data.sales.forEach((sale: { price: number }) => {
        revenue += sale.price;
      });
      setTotalRevenue(revenue);
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  React.useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return (
    <Card className="border-none bg-gradient-to-br from-primary/5 to-secondary/5 h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Sales Overview</CardTitle>
        <CardDescription>Total sales and revenue for this event</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Total Sales</span>
              </div>
              <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleString()}
      </CardFooter>
    </Card>
  );
}
