"use client";

import * as React from "react";
import { DollarSign } from "lucide-react";

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
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Sales and Revenue
        </CardTitle>
        <CardDescription>Total sales and revenue for this event</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div>
              <span className="text-4xl font-bold text-primary">{totalSales.toLocaleString()}</span>
              <p className="text-sm text-muted-foreground mt-1">Total Sales</p>
            </div>
            <div>
              <span className="text-4xl font-bold text-primary">
                ${totalRevenue.toLocaleString()}
              </span>
              <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleString()}
      </CardFooter>
    </Card>
  );
}
