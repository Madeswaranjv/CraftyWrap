import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  Sparkles,
  Scissors,
  CheckCheck,
  Send,
  AlertCircle,
} from 'lucide-react';
import { TimelineItem } from '@/components/ui/tracking-timeline';

export interface TimelineOrderInput {
  createdAt?: string | Date;
  orderStatus?: string;
  paymentStatus?: string;
  crafterAcceptedAt?: string | Date;
  prepDays?: number;
  packDays?: number;
  courierPartner?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string | Date;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatTimelineDate(dateInput?: string | Date): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatExactDeliveryDay(dateInput?: string | Date): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Calculates the exact expected delivery date based on order parameters.
 */
export function calculateEstimatedDeliveryDate(order: TimelineOrderInput): Date {
  if (order.estimatedDeliveryDate) {
    const customDate = new Date(order.estimatedDeliveryDate);
    if (!isNaN(customDate.getTime())) return customDate;
  }

  const baseDate = order.crafterAcceptedAt
    ? new Date(order.crafterAcceptedAt)
    : order.createdAt
    ? new Date(order.createdAt)
    : new Date();

  const prep = typeof order.prepDays === 'number' && order.prepDays >= 0 ? order.prepDays : 2;
  const pack = typeof order.packDays === 'number' && order.packDays >= 0 ? order.packDays : 1;
  const transitDays = 2; // Average transit days for courier in India

  return addDays(baseDate, prep + pack + transitDays);
}

/**
 * Builds the 5 timeline items for the TrackingTimeline component.
 */
export function buildOrderTimelineItems(order: TimelineOrderInput): TimelineItem[] {
  const baseDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const prepDays = typeof order.prepDays === 'number' && order.prepDays >= 0 ? order.prepDays : 2;
  const packDays = typeof order.packDays === 'number' && order.packDays >= 0 ? order.packDays : 1;

  const acceptedDate = order.crafterAcceptedAt ? new Date(order.crafterAcceptedAt) : baseDate;
  const prepEstDate = addDays(acceptedDate, prepDays);
  const packEstDate = addDays(prepEstDate, packDays);
  const deliveryEstDate = calculateEstimatedDeliveryDate(order);

  const status = order.orderStatus || 'payment_pending';
  const isCancelled = status === 'cancelled';

  // 1. Order Received By Crafter
  const isAccepted = Boolean(order.crafterAcceptedAt) || ['received_by_crafter', 'preparing', 'packed', 'shipped', 'delivered'].includes(status);
  const isAwaitingAcceptance = !isAccepted && !isCancelled;

  const item1: TimelineItem = {
    id: 'received_by_crafter',
    title: 'Order Received By Crafter',
    date: isAccepted
      ? order.crafterAcceptedAt
        ? `Accepted on ${formatTimelineDate(order.crafterAcceptedAt)}`
        : `Confirmed on ${formatTimelineDate(baseDate)}`
      : 'Waiting for crafter review & acceptance',
    status: isAccepted ? 'completed' : isAwaitingAcceptance ? 'in-progress' : 'pending',
    badge: isAccepted ? 'Crafter Confirmed' : 'Pending Crafter OK',
    description: isAccepted
      ? 'Crafter accepted your order. Custom handcrafting workflow initiated.'
      : 'Our artisans review your custom specifications and yarn requirements.',
    icon: isAccepted ? (
      <CheckCheck className="h-4 w-4 text-white" />
    ) : (
      <Clock className="h-4 w-4 text-warmbrown-800 dark:text-peach-200" />
    ),
  };

  // 2. Order Being Prepared
  const isPrepDone = ['packed', 'shipped', 'delivered'].includes(status);
  const isPrepActive = status === 'preparing' || (status === 'received_by_crafter' && isAccepted);

  const item2: TimelineItem = {
    id: 'preparing',
    title: 'Order Being Prepared',
    date: isPrepDone
      ? `Completed (~${formatTimelineDate(prepEstDate)})`
      : isPrepActive
      ? `In Progress • Estimated ready: ${formatTimelineDate(prepEstDate)} (${prepDays} ${prepDays === 1 ? 'day' : 'days'})`
      : `Estimated craft time: ${prepDays} ${prepDays === 1 ? 'day' : 'days'}`,
    status: isPrepDone ? 'completed' : isPrepActive ? 'in-progress' : 'pending',
    badge: isPrepDone ? 'Handcrafted' : isPrepActive ? 'On Crafter Loom' : `${prepDays} Days Prep`,
    description: isPrepActive
      ? 'Carefully hand-crocheting each stitch with soft hypoallergenic yarn.'
      : `Artisans dedicate approx. ${prepDays} days to weave and assemble your piece.`,
    icon: isPrepDone ? (
      <Sparkles className="h-4 w-4 text-white" />
    ) : isPrepActive ? (
      <Scissors className="h-4 w-4 text-warmbrown-800 dark:text-peach-100" />
    ) : undefined,
  };

  // 3. Order Being Packed
  const isPackDone = ['shipped', 'delivered'].includes(status);
  const isPackActive = status === 'packed';

  const item3: TimelineItem = {
    id: 'packed',
    title: 'Order Being Packed',
    date: isPackDone
      ? `Packed securely (~${formatTimelineDate(packEstDate)})`
      : isPackActive
      ? `In Progress • Dispatch ready: ${formatTimelineDate(packEstDate)} (${packDays} ${packDays === 1 ? 'day' : 'days'})`
      : `Packaging window: ~${packDays} ${packDays === 1 ? 'day' : 'days'}`,
    status: isPackDone ? 'completed' : isPackActive ? 'in-progress' : 'pending',
    badge: isPackDone ? 'Packed' : isPackActive ? 'Gift-Boxing' : `${packDays} Day Pack`,
    description: isPackActive
      ? 'Inspecting quality, adding fragrant tag & sealing in protective packaging.'
      : 'Carefully wrapped with eco-friendly protective packaging.',
    icon: isPackDone ? (
      <Package className="h-4 w-4 text-white" />
    ) : isPackActive ? (
      <Package className="h-4 w-4 text-warmbrown-800 dark:text-peach-100" />
    ) : undefined,
  };

  // 4. Out for Delivery
  const isShippedDone = status === 'delivered';
  const isShippedActive = status === 'shipped';

  let courierDescription = 'Courier tracking ID will be generated upon dispatch.';
  if (order.trackingNumber) {
    courierDescription = `Shipped via ${order.courierPartner || 'Courier'} (AWB: ${order.trackingNumber})`;
  }

  const item4: TimelineItem = {
    id: 'shipped',
    title: 'Out for Delivery',
    date: isShippedDone
      ? `Dispatched & in delivery history`
      : isShippedActive
      ? `En Route • Expected delivery: ${formatTimelineDate(deliveryEstDate)}`
      : `Expected dispatch after packing: ~${formatTimelineDate(packEstDate)}`,
    status: isShippedDone ? 'completed' : isShippedActive ? 'in-progress' : 'pending',
    badge: isShippedActive
      ? 'In Transit'
      : isShippedDone
      ? 'Transit Completed'
      : order.trackingNumber
      ? 'AWB Assigned'
      : 'Pending Courier',
    description: courierDescription,
    icon: isShippedDone ? (
      <CheckCircle2 className="h-4 w-4 text-white" />
    ) : isShippedActive ? (
      <Truck className="h-4 w-4 text-warmbrown-800 dark:text-peach-100" />
    ) : undefined,
  };

  // 5. Delivered
  const isDelivered = status === 'delivered';

  const item5: TimelineItem = {
    id: 'delivered',
    title: 'Delivered',
    date: isDelivered
      ? `Successfully delivered on ${formatTimelineDate(deliveryEstDate)}`
      : `Exact delivery day: ${formatExactDeliveryDay(deliveryEstDate)}`,
    status: isDelivered ? 'completed' : 'pending',
    badge: isDelivered ? 'Delivered' : 'Final Step',
    description: isDelivered
      ? 'Package received! Enjoy your handmade CraftyWrap treasure.'
      : 'Package will be handed directly to recipient at your shipping address.',
    icon: isDelivered ? (
      <Home className="h-4 w-4 text-white" />
    ) : undefined,
  };

  return [item1, item2, item3, item4, item5];
}
