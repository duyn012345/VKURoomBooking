import { Role, Slot } from './types';

export const SLOTS: Slot[] = [
  { id: 1, label: 'Ca 1', time: '07:00 - 09:30', endMin: 9 * 60 + 30 },
  { id: 2, label: 'Ca 2', time: '09:30 - 12:00', endMin: 12 * 60 },
  { id: 3, label: 'Ca 3', time: '13:00 - 15:30', endMin: 15 * 60 + 30 },
  { id: 4, label: 'Ca 4', time: '15:30 - 18:00', endMin: 18 * 60 },
  { id: 5, label: 'Ca 5', time: '18:00 - 20:30', endMin: 20 * 60 + 30 },
];

export const COLORS = {
  primary: '#2563eb',
  primarySoft: '#dbeafe',
  green: '#16a34a',
  greenSoft: '#dcfce7',
  red: '#dc2626',
  redSoft: '#fee2e2',
  orange: '#d97706',
  orangeSoft: '#fef3c7',
  gray: '#9ca3af',
  graySoft: '#f3f4f6',
  bg: '#f3f4f6',
  card: '#ffffff',
  text: '#111827',
  sub: '#6b7280',
} as const;

export const ROLE_LABEL: Record<Role, string> = {
  student: 'Sinh viên',
  lecturer: 'Giảng viên',
  admin: 'Quản trị viên',
};