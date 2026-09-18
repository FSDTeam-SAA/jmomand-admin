'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calculator,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Clock3,
  Copy,
  Gavel,
  Info,
  Mail,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge, currencyFormatter, formatDate, formatTime, fullName } from '@/lib/helper';
import type { PickupSchedule, PickupScheduleStatus } from './pickup-requests';
import { PickupStatusActionBar } from './PickupStatusActionBar';

export function parseDateSafe(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function calculatePickupHoldingFee(
  schedule: PickupSchedule,
  overrideDays?: number | null,
) {
  const basePrice =
    schedule.auctionProductId?.soldPrice ??
    schedule.auctionProductId?.highestBid?.amount ??
    schedule.auctionProductId?.productId?.price ??
    0;

  const pickupDateObj = parseDateSafe(schedule.pickupDate);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isCompleted = schedule.status === 'completed';
  const isCancelled = schedule.status === 'cancelled' || schedule.status === 'rejected';

  let autoOverdueDays = 0;
  if (pickupDateObj && !isCompleted && !isCancelled) {
    const diffMs = todayMidnight.getTime() - pickupDateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      autoOverdueDays = diffDays;
    }
  }

  const effectiveDays =
    typeof overrideDays === 'number' && overrideDays >= 0
      ? overrideDays
      : autoOverdueDays;

  const isOverdue = effectiveDays > 0;
  const dailyRatePercent = 10; // 10% daily holding fee
  const dailyFeeAmount = Math.round(((basePrice * dailyRatePercent) / 100) * 100) / 100;
  const totalFeePercent = effectiveDays * dailyRatePercent;
  const totalHoldingFee = Math.round(effectiveDays * dailyFeeAmount * 100) / 100;
  const totalWithFee = Math.round((basePrice + totalHoldingFee) * 100) / 100;

  return {
    isOverdue,
    overdueDays: effectiveDays,
    autoOverdueDays,
    effectiveDays,
    isManualOverride: typeof overrideDays === 'number' && overrideDays !== autoOverdueDays,
    dailyRatePercent,
    dailyFeeAmount,
    totalFeePercent,
    totalHoldingFee,
    basePrice,
    totalWithFee,
    pickupDateObj,
    isCompleted,
    isCancelled,
  };
}

type PickupRequestDetailsProps = {
  schedule: PickupSchedule;
  selectedStatus: PickupScheduleStatus;
  isUpdating: boolean;
  onStatusChange: (status: PickupScheduleStatus) => void;
  onUpdateStatus: () => void;
};

export function PickupRequestDetails({
  schedule,
  selectedStatus,
  isUpdating,
  onStatusChange,
  onUpdateStatus,
}: PickupRequestDetailsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [manualDays, setManualDays] = useState<number | null>(null);

  const product = schedule.auctionProductId?.productId;
  const auctionProduct = schedule.auctionProductId;
  const productImage = getProductImage(product);
  const requestId = schedule._id ? `REQ-${schedule._id.slice(-6).toUpperCase()}` : 'REQUEST';

  const holdingFee = calculatePickupHoldingFee(schedule, manualDays);

  const handleCopy = (text: string, key: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const statusBanner = getStatusBanner(schedule.status);

  return (
    <div className="mx-auto flex max-h-[calc(90vh-88px)] w-full flex-col overflow-hidden bg-white text-slate-950">
      {/* Top Meta Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-semibold text-slate-500">Reference:</span>
          <button
            type="button"
            onClick={() => handleCopy(requestId, 'reqId', 'Request ID')}
            className="group flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono font-bold text-slate-800 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50"
            title="Click to copy Request ID"
          >
            <span>{requestId}</span>
            {copiedKey === 'reqId' ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />
            )}
          </button>
          <span className="hidden text-slate-300 sm:inline">•</span>
          <span className="hidden text-slate-500 sm:inline">
            Requested on{' '}
            <strong className="font-medium text-slate-700">
              {formatDate(schedule.createdAt, true)}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {holdingFee.isOverdue && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              {holdingFee.effectiveDays}d Overdue (+{currencyFormatter.format(holdingFee.totalHoldingFee)})
            </span>
          )}
          <span className="text-slate-500">Status:</span>
          <Badge value={schedule.status} />
        </div>
      </div>

      {/* Main Scrollable Content (2 Columns Layout) */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* LEFT COLUMN (5 Cols): Product & Winning Bid */}
          <div className="space-y-4 lg:col-span-5">
            {/* Product Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt={product?.title || 'Product image'}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                    <Package className="h-12 w-12" />
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                  {product?.condition && (
                    <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs backdrop-blur-xs">
                      {formatCondition(product.condition)}
                    </span>
                  )}
                  {product?.category && (
                    <span className="rounded-full border border-slate-200/60 bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800 shadow-xs backdrop-blur-xs">
                      {product.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3.5 space-y-2">
                <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">
                  {product?.title || 'Auction Product'}
                </h3>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-500">Inventory ID:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(product?.inventoryId || '', 'sku', 'Inventory ID')}
                    className="group inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-800 transition hover:text-[#FF5A1F]"
                  >
                    <span>{product?.inventoryId || '-'}</span>
                    {product?.inventoryId && (
                      copiedKey === 'sku' ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />
                      )
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Winning Bid & Auction Card */}
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50/60 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <Gavel className="h-3.5 w-3.5 text-emerald-600" />
                  Winning Bid (Sold Price)
                </span>
                <Badge value={auctionProduct?.paymentStatus || 'paid'} />
              </div>

              <p className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-700">
                {currencyFormatter.format(
                  auctionProduct?.soldPrice ?? auctionProduct?.highestBid?.amount ?? 0,
                )}
              </p>

              <div className="mt-3.5 divide-y divide-slate-100 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500">Auction Title:</span>
                  <span className="max-w-[200px] truncate font-semibold text-slate-800">
                    {schedule.auctionId?.title || schedule.auctionId?.auctionId || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500">Starting Bid:</span>
                  <span className="font-semibold text-slate-800">
                    {currencyFormatter.format(auctionProduct?.startingBid ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500">Fulfillment Status:</span>
                  <Badge value={auctionProduct?.pickupStatus ?? schedule.status} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 Cols): Scheduled Pickup Logistics & Late Holding Fee & Customer Info */}
          <div className="space-y-4 lg:col-span-7">
            {/* Scheduled Pickup Card (Hero Logistics Card) */}
            <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100/90 text-[#FF5A1F] shadow-2xs">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Scheduled Pickup Window</h4>
                    <p className="text-[11px] text-slate-500">
                      Customer appointment for item collection
                    </p>
                  </div>
                </div>

                <Badge value={schedule.status} />
              </div>

              {/* Date & Time Highlight Boxes */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5 text-[#FF5A1F]" />
                    <span>Pickup Date</span>
                  </div>
                  <p className="mt-1.5 text-base font-bold text-slate-900">
                    {formatDate(schedule.pickupDate)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Clock3 className="h-3.5 w-3.5 text-[#FF5A1F]" />
                    <span>Time Window</span>
                  </div>
                  <p className="mt-1.5 font-mono text-base font-bold text-slate-900">
                    {formatTime(schedule.pickupTime)}
                  </p>
                </div>
              </div>

              {/* Status Context Banner */}
              {statusBanner && (
                <div
                  className={`mt-3.5 flex items-start gap-2.5 rounded-xl border p-3 text-xs ${statusBanner.bg}`}
                >
                  {statusBanner.icon}
                  <span className="font-medium">{statusBanner.text}</span>
                </div>
              )}

              {/* Warehouse Location Note */}
              <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-slate-100/80 px-3.5 py-2.5 text-xs text-slate-700">
                <MapPin className="h-4 w-4 shrink-0 text-[#FF5A1F]" />
                <span className="truncate">
                  Location:{' '}
                  <strong className="text-slate-900">
                    JMomand Central Distribution Warehouse
                  </strong>{' '}
                  (Pickup Bay)
                </span>
              </div>
            </div>

            {/* 10% DAILY LATE HOLDING FEE CARD */}
            <div
              className={`overflow-hidden rounded-2xl border p-5 shadow-2xs transition-all ${
                holdingFee.isOverdue
                  ? 'border-amber-300/90 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white'
                  : 'border-slate-200/80 bg-white'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-2xs ${
                      holdingFee.isOverdue
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Late Holding Fee (10%/Day)
                      </h4>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        10% Daily
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Charge for storing uncollected items past the scheduled date
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {holdingFee.isOverdue ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 shadow-2xs">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                      {holdingFee.effectiveDays}{' '}
                      {holdingFee.effectiveDays === 1 ? 'Day' : 'Days'} Overdue
                    </span>
                  ) : holdingFee.isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Pickup Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      On Schedule (0d Late)
                    </span>
                  )}
                </div>
              </div>

              {/* Fee Calculation Metric Boxes */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 text-xs">
                {/* Base Item Price */}
                <div className="rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Base Item Price
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {currencyFormatter.format(holdingFee.basePrice)}
                  </p>
                </div>

                {/* Daily Rate */}
                <div className="rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Daily Rate (10%)
                  </span>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    +{currencyFormatter.format(holdingFee.dailyFeeAmount)}
                    <span className="text-[10px] font-normal text-slate-400"> /day</span>
                  </p>
                </div>

                {/* Overdue Days */}
                <div className="rounded-xl border border-slate-200/80 bg-white/90 p-2.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Overdue Days
                  </span>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      holdingFee.isOverdue ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {holdingFee.effectiveDays}{' '}
                    {holdingFee.effectiveDays === 1 ? 'Day' : 'Days'}
                    {holdingFee.isOverdue && (
                      <span className="text-[10px] font-normal text-rose-500">
                        {' '}(+{holdingFee.totalFeePercent}%)
                      </span>
                    )}
                  </p>
                </div>

                {/* Total Holding Fee */}
                <div
                  className={`rounded-xl border p-2.5 shadow-2xs ${
                    holdingFee.isOverdue
                      ? 'border-rose-300 bg-rose-50/80 text-rose-950'
                      : 'border-slate-200/80 bg-white/90'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                    Late Fee Due
                  </span>
                  <p
                    className={`mt-1 text-sm font-black ${
                      holdingFee.isOverdue ? 'text-rose-600' : 'text-slate-700'
                    }`}
                  >
                    +{currencyFormatter.format(holdingFee.totalHoldingFee)}
                  </p>
                </div>
              </div>

              {/* Overdue Collection Alert & Instructions */}
              {holdingFee.isOverdue ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="font-bold text-amber-900">
                        Manual Counter Collection Required:
                      </span>
                      <p className="mt-0.5 text-[11px] text-amber-800">
                        Collect late fee from winner customer before handing over product
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <span className="block text-[10px] font-bold uppercase text-amber-800">
                        Late Holding Fee to Collect:
                      </span>
                      <span className="text-xl font-black text-rose-600">
                        +{currencyFormatter.format(holdingFee.totalHoldingFee)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2 border-t border-amber-200/80 pt-2.5 text-[11px] text-amber-900">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <span>
                      <strong>Admin Note:</strong> This fee is <u>not</u> automatically charged to
                      the customer&apos;s credit card. The admin must manually collect this fee at
                      the warehouse pickup counter when the customer arrives to receive the product.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>
                    <strong>Pickup Policy:</strong> Customer scheduled pickup for{' '}
                    <strong>{formatDate(schedule.pickupDate)}</strong>. If not collected by that date,
                    a 10% daily holding fee ({currencyFormatter.format(holdingFee.dailyFeeAmount)}
                    /day) will automatically apply for each calendar day delayed.
                  </span>
                </div>
              )}

              {/* Interactive Simulation / Adjustment Stepper */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-500">
                  <Calculator className="h-3.5 w-3.5 text-slate-400" />
                  Simulate / Adjust Days:
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setManualDays(Math.max(0, holdingFee.effectiveDays - 1))}
                      className="rounded-l-lg px-2.5 py-1 font-bold text-slate-600 transition hover:bg-slate-100 active:scale-95"
                      title="Decrease days"
                    >
                      -
                    </button>
                    <span className="min-w-[48px] border-x border-slate-100 px-2.5 py-1 text-center font-mono font-bold text-slate-900">
                      {holdingFee.effectiveDays}d
                    </span>
                    <button
                      type="button"
                      onClick={() => setManualDays(holdingFee.effectiveDays + 1)}
                      className="rounded-r-lg px-2.5 py-1 font-bold text-slate-600 transition hover:bg-slate-100 active:scale-95"
                      title="Increase days"
                    >
                      +
                    </button>
                  </div>

                  {manualDays !== null && (
                    <button
                      type="button"
                      onClick={() => setManualDays(null)}
                      className="flex items-center gap-1 text-[11px] text-slate-500 underline transition hover:text-[#FF5A1F]"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset to Auto ({holdingFee.autoOverdueDays}d)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <User className="h-3.5 w-3.5 text-slate-600" />
                <span>Winner Customer Details</span>
              </div>

              <div className="mt-4 flex items-center gap-3.5">
                <CustomerAvatar
                  name={fullName(schedule.userId)}
                  imageUrl={schedule.userId?.image?.url}
                />
                <div className="min-w-0">
                  <h4 className="truncate text-base font-bold text-slate-900">
                    {fullName(schedule.userId)}
                  </h4>
                  {schedule.userId?._id && (
                    <p className="truncate font-mono text-xs text-slate-400">
                      Customer ID: {schedule.userId._id}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-slate-100 pt-3 sm:grid-cols-2">
                {/* Email */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <a
                      href={`mailto:${schedule.userId?.email || ''}`}
                      className="truncate font-medium text-slate-700 hover:text-[#FF5A1F] hover:underline"
                    >
                      {schedule.userId?.email || 'No email provided'}
                    </a>
                  </div>
                  {schedule.userId?.email && (
                    <button
                      type="button"
                      onClick={() => handleCopy(schedule.userId?.email || '', 'email', 'Email')}
                      className="ml-2 shrink-0 text-slate-400 transition hover:text-slate-600"
                      title="Copy Email"
                    >
                      {copiedKey === 'email' ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <a
                      href={`tel:${schedule.userId?.phone || ''}`}
                      className="truncate font-medium text-slate-700 hover:text-[#FF5A1F] hover:underline"
                    >
                      {schedule.userId?.phone || 'No phone provided'}
                    </a>
                  </div>
                  {schedule.userId?.phone && (
                    <button
                      type="button"
                      onClick={() => handleCopy(schedule.userId?.phone || '', 'phone', 'Phone')}
                      className="ml-2 shrink-0 text-slate-400 transition hover:text-slate-600"
                      title="Copy Phone"
                    >
                      {copiedKey === 'phone' ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Audit Metadata Card */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-500">
              <span>
                Request Placed:{' '}
                <strong className="font-semibold text-slate-700">
                  {formatDate(schedule.createdAt, true)}
                </strong>
              </span>
              <span>
                Last Updated:{' '}
                <strong className="font-semibold text-slate-700">
                  {formatDate(schedule.updatedAt, true)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="shrink-0">
        <PickupStatusActionBar
          currentStatus={schedule.status}
          selectedStatus={selectedStatus}
          isUpdating={isUpdating}
          onStatusChange={onStatusChange}
          onUpdateStatus={onUpdateStatus}
        />
      </div>
    </div>
  );
}

function CustomerAvatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-sm font-bold text-white ring-2 ring-slate-100">
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill sizes="44px" className="object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

function getProductImage(product?: NonNullable<PickupSchedule['auctionProductId']>['productId']) {
  if (!product) return undefined;
  const image = product.image;
  if (typeof image === 'string') return image;
  return product.images?.[0]?.url || image?.url || product.categoryImage?.url;
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CU'
  );
}

function formatCondition(condition?: string) {
  if (!condition) return null;
  return condition
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getStatusBanner(status: PickupScheduleStatus) {
  switch (status) {
    case 'requested':
      return {
        bg: 'bg-amber-50 border-amber-200/80 text-amber-900',
        icon: <Clock className="h-4 w-4 shrink-0 text-amber-600" />,
        text: 'Awaiting admin review. Verify slot availability before approving.',
      };
    case 'approved':
      return {
        bg: 'bg-emerald-50 border-emerald-200/80 text-emerald-900',
        icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />,
        text: 'Approved & confirmed. Item is ready for customer warehouse pickup.',
      };
    case 'completed':
      return {
        bg: 'bg-blue-50 border-blue-200/80 text-blue-900',
        icon: <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />,
        text: 'Pickup completed. Item successfully verified and handed over.',
      };
    case 'rejected':
      return {
        bg: 'bg-rose-50 border-rose-200/80 text-rose-900',
        icon: <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />,
        text: 'Request rejected. Customer has been notified to pick an alternate slot.',
      };
    case 'cancelled':
      return {
        bg: 'bg-slate-50 border-slate-200/80 text-slate-700',
        icon: <XCircle className="h-4 w-4 shrink-0 text-slate-500" />,
        text: 'Request was cancelled.',
      };
    default:
      return null;
  }
}
