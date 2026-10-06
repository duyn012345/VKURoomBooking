import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAdminCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
        })
        .eq('id', bookingId)
        .select('id');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        const error = new Error(
          'Bạn không có quyền hủy lượt đặt này.'
        );

        error.name = 'ADMIN_BOOKING_NOT_FOUND';

        throw error;
      }

      return data[0];
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['admin-bookings'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['my-bookings'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['bookings'],
      });
    },
  });
}