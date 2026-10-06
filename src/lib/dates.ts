import { SLOTS } from '../constants';
import { Slot } from '../types';

const WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const toYMD = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const nextDays = (n: number = 14): Date[] =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

export const weekday = (d: Date): string => WD[d.getDay()];

// "T3, 29/09/2026"
export const prettyDate = (ymd: string): string => {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${weekday(new Date(y, m - 1, d))}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
};

// ca đã kết thúc (chỉ áp dụng khi chọn ngày hôm nay)
export const isSlotPast = (ymd: string, slot: Slot): boolean => {
  const now = new Date();
  if (ymd !== toYMD(now)) return false;
  return now.getHours() * 60 + now.getMinutes() >= slot.endMin;
};

// ngày + ca mặc định khi mở app
export const defaultSelection = (): { date: string; slotId: number } => {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const slot = SLOTS.find((s) => s.endMin > mins);
  if (slot) return { date: toYMD(now), slotId: slot.id };
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { date: toYMD(tomorrow), slotId: 1 };
};

//new
// Lượt đặt (theo ngày + ca) đã kết thúc chưa
export const isBookingPast = (ymd: string, slotId: number): boolean => {
  const today = toYMD(new Date());
  if (ymd < today) return true;
  if (ymd > today) return false;
  const slot = SLOTS.find((s) => s.id === slotId);
  return slot ? isSlotPast(ymd, slot) : false;
};