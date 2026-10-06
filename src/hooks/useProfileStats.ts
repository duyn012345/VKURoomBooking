import { useQuery } from '@tanstack/react-query';
import { SLOTS } from '../constants';
import { isSlotPast, toYMD } from '../lib/dates';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

export interface BookingLite {
  id: string;
  booking_date: string;
  slot: number;
  status: 'confirmed' | 'cancelled';
  rooms: {
    name: string;
    location: string;
  } | null;
}

export interface UserStats {
  upcoming: number;
  done: number;
  cancelled: number;
  next: BookingLite | null;
}

export interface AdminStats {
  rooms: number;
  maintenance: number;
  upcoming: number;
  users: number;
}

const isPastBooking = (booking: BookingLite): boolean => {
  const today = toYMD(new Date());

  if (booking.booking_date < today) {
    return true;
  }

  if (booking.booking_date > today) {
    return false;
  }

  const slot = SLOTS.find((item) => item.id === booking.slot);

  return slot ? isSlotPast(booking.booking_date, slot) : false;
};

export function useProfileStats(
  userId: string,
  role: Profile['role'] | undefined
) {
  return useQuery<UserStats | AdminStats, Error>({
    queryKey: ['profile-stats', userId, role],

    enabled: Boolean(userId && role),

    queryFn: async () => {
      if (role === 'admin') {
        const today = toYMD(new Date());

        const [roomsResult, bookingsResult, usersResult] =
          await Promise.all([
            supabase
              .from('rooms')
              .select('id, status'),

            supabase
              .from('bookings')
              .select('id', {
                count: 'exact',
                head: true,
              })
              .eq('status', 'confirmed')
              .gte('booking_date', today),

            supabase
              .from('profiles')
              .select('id', {
                count: 'exact',
                head: true,
              }),
          ]);

        if (roomsResult.error) {
          throw roomsResult.error;
        }

        if (bookingsResult.error) {
          throw bookingsResult.error;
        }

        if (usersResult.error) {
          throw usersResult.error;
        }

        const rooms = (roomsResult.data ?? []) as {
          id: string;
          status: string;
        }[];

        return {
          rooms: rooms.length,
          maintenance: rooms.filter(
            (room) => room.status === 'maintenance'
          ).length,
          upcoming: bookingsResult.count ?? 0,
          users: usersResult.count ?? 0,
        };
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(
          'id, booking_date, slot, status, rooms(name, location)'
        )
        .eq('user_id', userId)
        .order('booking_date', {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      const list = (data ?? []) as unknown as BookingLite[];

      const confirmed = list.filter(
        (booking) => booking.status === 'confirmed'
      );

      const upcomingList = confirmed
        .filter((booking) => !isPastBooking(booking))
        .sort((a, b) => {
          if (a.booking_date === b.booking_date) {
            return a.slot - b.slot;
          }

          return a.booking_date < b.booking_date ? -1 : 1;
        });

      return {
        upcoming: upcomingList.length,
        done: confirmed.length - upcomingList.length,
        cancelled: list.length - confirmed.length,
        next: upcomingList[0] ?? null,
      };
    },
  });
}