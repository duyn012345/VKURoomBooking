import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface CancelBookingInput {
  bookingId: string;
}

export function useCancelBooking(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
    }: CancelBookingInput) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select('id');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        const error = new Error(
          'Không tìm thấy lượt đặt.'
        );

        error.name = 'BOOKING_NOT_FOUND';

        throw error;
      }

      return data[0];
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['my-bookings', userId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['bookings'],
      });
    },
  });
}