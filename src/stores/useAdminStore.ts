// import { create } from 'zustand';
// import { supabase } from '../lib/supabase';
// import { Room } from '../types';

// interface AdminState {
//   rooms: Room[];
//   loadingRooms: boolean;
//   fetchRooms: () => Promise<void>;
// }

// export const useAdminStore = create<AdminState>((set) => ({
//   rooms: [],
//   loadingRooms: false,
//   fetchRooms: async () => {
//     set({ loadingRooms: true });
//     const { data } = await supabase.from('rooms').select('*').order('name');
//     set({ rooms: (data ?? []) as Room[], loadingRooms: false });
//   },
// }));