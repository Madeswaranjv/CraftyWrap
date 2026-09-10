'use client';

import React from "react";
import TrackingTimeline, { TimelineItem } from "@/components/ui/order-history";
import {
  Home,
  Package,
  Ship,
  Warehouse,
  ClipboardCheck,
  PackageCheck,
} from "lucide-react";

const orderHistoryItems: TimelineItem[] = [
  {
    id: 1,
    status: "completed",
    title: "Order Placed",
    date: "20 Jun 2024, 08:45",
    icon: <ClipboardCheck className="h-4 w-4 text-white" />,
  },
  {
    id: 2,
    status: "completed",
    title: "Order Processed",
    date: "21 Jun 2024, 02:30",
    icon: <Package className="h-4 w-4 text-white" />,
  },
  {
    id: 3,
    status: "completed",
    title: "Pick up",
    date: "22 Jun 2024, 12:34",
    icon: <Warehouse className="h-4 w-4 text-white" />,
  },
  {
    id: 4,
    status: "in-progress",
    title: "Out for shipment",
    date: "Today",
    icon: <Ship className="h-4 w-4 text-warmbrown-800 dark:text-peach-100" />,
  },
  {
    id: 5,
    status: "pending",
    title: "Out for Delivery",
    date: "24 Jun 2024",
    icon: <PackageCheck className="h-4 w-4 text-warmbrown-400/60" />,
  },
  {
    id: 6,
    status: "pending",
    title: "Delivered",
    date: "24 Jun 2024",
    icon: <Home className="h-4 w-4 text-warmbrown-400/60" />,
  },
];

const TrackingTimelineDemo = () => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-peach-50 dark:bg-[#140E0A] p-6 sm:p-10">
      <div className="w-full max-w-md rounded-3xl border border-peach-200 dark:border-warmbrown-800 bg-white dark:bg-[#1F1610] p-6 shadow-soft">
        <h2 className="mb-6 text-xl font-extrabold text-warmbrown-900 dark:text-peach-100">
          Order History & Timeline
        </h2>
        <TrackingTimeline items={orderHistoryItems} />
      </div>
    </div>
  );
};

export default TrackingTimelineDemo;
