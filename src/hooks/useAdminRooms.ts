import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Room } from '../types';

export function useAdminRooms() {
  return useQuery<Room[], Error>({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return (data ?? []) as Room[];
    },
  });
}