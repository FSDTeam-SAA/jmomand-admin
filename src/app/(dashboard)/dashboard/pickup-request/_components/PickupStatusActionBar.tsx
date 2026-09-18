'use client';

import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PickupScheduleStatus } from './pickup-requests';

const statusOptionsConfig: Record<
  PickupScheduleStatus,
  { label: string; dotColor: string; description: string }
> = {
  requested: {
    label: 'Requested',
    dotColor: 'bg-amber-500',
    description: 'Pending initial review',
  },
  approved: {
    label: 'Approved',
    dotColor: 'bg-emerald-500',
    description: 'Ready for warehouse pickup',
  },
  rejected: {
    label: 'Rejected',
    dotColor: 'bg-rose-500',
    description: 'Declined or needs change',
  },
  completed: {
    label: 'Completed',
    dotColor: 'bg-blue-500',
    description: 'Item handed over to winner',
  },
  cancelled: {
    label: 'Cancelled',
    dotColor: 'bg-slate-400',
    description: 'Voided by user or admin',
  },
};

type ActionBarProps = {
  currentStatus: PickupScheduleStatus;
  selectedStatus: PickupScheduleStatus;
  isUpdating: boolean;
  onStatusChange: (status: PickupScheduleStatus) => void;
  onUpdateStatus: () => void;
};

export function PickupStatusActionBar({
  currentStatus,
  selectedStatus,
  isUpdating,
  onStatusChange,
  onUpdateStatus,
}: ActionBarProps) {
  const hasStatusChanged = selectedStatus !== currentStatus;

  return (
    <div className="border-t border-slate-200/80 bg-slate-50/90 px-6 py-3.5 transition-all">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Status Selector + Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Fulfillment Status:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="h-10 w-[220px] rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs transition-all hover:border-slate-300 focus:ring-2 focus:ring-[#FF5A1F]/20">
                <SelectValue placeholder="Select status">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        statusOptionsConfig[selectedStatus]?.dotColor || 'bg-slate-400'
                      }`}
                    />
                    <span className="font-semibold text-slate-900">
                      {statusOptionsConfig[selectedStatus]?.label}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" className="rounded-xl border-slate-200 p-1 shadow-xl">
                {(Object.keys(statusOptionsConfig) as PickupScheduleStatus[]).map((status) => {
                  const option = statusOptionsConfig[status];
                  return (
                    <SelectItem
                      key={status}
                      value={status}
                      className="cursor-pointer rounded-lg py-2 text-xs font-medium focus:bg-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${option.dotColor}`} />
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{option.label}</span>
                          <span className="text-[10px] text-slate-400">{option.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {hasStatusChanged && (
              <span className="hidden items-center gap-1.5 text-xs text-amber-700 md:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved ({statusOptionsConfig[currentStatus]?.label} →{' '}
                {statusOptionsConfig[selectedStatus]?.label})
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            disabled={!hasStatusChanged || isUpdating}
            onClick={onUpdateStatus}
            className={`h-10 px-5 text-xs font-bold tracking-wide transition-all rounded-xl flex items-center gap-2 ${
              hasStatusChanged
                ? 'bg-[#FF5A1F] hover:bg-[#e04f1a] text-white shadow-sm hover:shadow active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating...
              </>
            ) : hasStatusChanged ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Save Status
              </>
            ) : (
              'Status Saved'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
