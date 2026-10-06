// import { FlashList, ListRenderItem } from '@shopify/flash-list';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   StyleSheet,
//   Switch,
//   Text,
//   TextInput, TouchableOpacity,
//   View,
// } from 'react-native';
// import RoomFormModal from '../components/RoomFormModal';
// import { COLORS, ROLE_LABEL, SLOTS } from '../constants';
// import { prettyDate, toYMD } from '../lib/dates';
// import { supabase } from '../lib/supabase';
// import { AdminBooking, Room } from '../types';

// type Section = 'rooms' | 'bookings';
// type BookingFilter = 'upcoming' | 'cancelled' | 'all';

// const BOOKING_FILTERS: { key: BookingFilter; label: string }[] = [
//   { key: 'upcoming', label: 'Sắp tới' },
//   { key: 'cancelled', label: 'Đã hủy' },
//   { key: 'all', label: 'Tất cả' },
// ];

// /* ---------------- QUẢN LÝ PHÒNG ---------------- */
// function RoomsAdmin() {
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [tick, setTick] = useState<number>(0);
//   const [editing, setEditing] = useState<Room | null>(null);
//   const [creating, setCreating] = useState<boolean>(false);

//   useEffect(() => {
//     let active = true;
//     (async () => {
//       const { data, error } = await supabase.from('rooms').select('*').order('name');
//       if (!active) return;
//       if (error) Alert.alert('Lỗi', error.message);
//       else setRooms((data ?? []) as Room[]);
//       setLoading(false);
//     })();
//     return () => {
//       active = false;
//     };
//   }, [tick]);

//   const reload = useCallback(() => setTick((t) => t + 1), []);

//   const setStatus = (room: Room, next: 'active' | 'maintenance') => {
//     const run = async () => {
//       const { data, error } = await supabase.rpc('admin_set_room_status', { p_room: room.id, p_status: next });
//       if (error) Alert.alert('Lỗi', error.message);
//       else if (next === 'maintenance') {
//         Alert.alert('Đã chuyển sang bảo trì', `Đã hủy ${data ?? 0} lượt đặt sắp tới của phòng này.`);
//       }
//       reload();
//     };
//     if (next === 'maintenance') {
//       Alert.alert('Chuyển sang bảo trì?', 'Mọi lượt đặt từ hôm nay trở đi của phòng này sẽ bị hủy.', [
//         { text: 'Không', style: 'cancel' },
//         { text: 'Bảo trì', style: 'destructive', onPress: run },
//       ]);
//     } else {
//       run();
//     }
//   };

//   const remove = (room: Room) => {
//     Alert.alert('Xóa phòng?', `Xóa "${room.name}" sẽ xóa luôn mọi lượt đặt của phòng này.`, [
//       { text: 'Không', style: 'cancel' },
//       {
//         text: 'Xóa',
//         style: 'destructive',
//         onPress: async () => {
//           const { data, error } = await supabase.from('rooms').delete().eq('id', room.id).select('id');
//           if (error) Alert.alert('Lỗi', error.message);
//           else if (!data || data.length === 0) Alert.alert('Không xóa được', 'Bạn không có quyền xóa phòng này.');
//           reload();
//         },
//       },
//     ]);
//   };

//   const renderItem: ListRenderItem<Room> = ({ item }) => {
//     const active = item.status === 'active';
//     return (
//       <View style={styles.card}>
//         <Image source={{ uri: item.image_url ?? undefined }} style={styles.thumb} />
//         <View style={{ flex: 1, padding: 10 }}>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.sub}>📍 {item.location} · 👥 {item.capacity}</Text>

//           <View style={styles.statusRow}>
//             <Switch
//               value={active}
//               onValueChange={(v) => setStatus(item, v ? 'active' : 'maintenance')}
//               trackColor={{ false: '#d1d5db', true: COLORS.green }}
//             />
//             <Text style={[styles.statusText, { color: active ? COLORS.green : COLORS.orange }]}>
//               {active ? 'Hoạt động' : 'Bảo trì'}
//             </Text>
//           </View>

//           <View style={styles.actions}>
//             <TouchableOpacity onPress={() => setEditing(item)}>
//               <Text style={styles.link}>Sửa</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => remove(item)}>
//               <Text style={[styles.link, { color: COLORS.red }]}>Xóa</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <TouchableOpacity style={styles.addBtn} onPress={() => setCreating(true)}>
//         <Text style={styles.addText}>＋ Thêm phòng</Text>
//       </TouchableOpacity>

//       {loading ? (
//         <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 30 }} />
//       ) : (
//         <FlashList
//           data={rooms}
//           keyExtractor={(r) => r.id}
//           renderItem={renderItem}
//           refreshing={false}
//           onRefresh={reload}
//           contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 20 }}
//           ListEmptyComponent={<Text style={styles.empty}>Chưa có phòng nào.</Text>}
//         />
//       )}

//       {(creating || editing) && (
//         <RoomFormModal
//           room={editing}
//           onClose={() => {
//             setCreating(false);
//             setEditing(null);
//           }}
//           onSaved={reload}
//         />
//       )}
//     </View>
//   );
// }

// /* ---------------- QUẢN LÝ LƯỢT ĐẶT ---------------- */
// function BookingsAdmin() {
//   const [items, setItems] = useState<AdminBooking[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [tick, setTick] = useState<number>(0);
//   const [filter, setFilter] = useState<BookingFilter>('upcoming');
//   const [search, setSearch] = useState<string>('');

//   useEffect(() => {
//     let active = true;
//     (async () => {
//       const { data, error } = await supabase
//         .from('bookings')
//         .select('id, booking_date, slot, status, user_id, rooms(name), profiles(full_name, role, email)')
//         .order('booking_date', { ascending: false })
//         .limit(300);
//       if (!active) return;
//       if (error) Alert.alert('Lỗi', error.message);
//       else setItems((data ?? []) as unknown as AdminBooking[]);
//       setLoading(false);
//     })();
//     return () => {
//       active = false;
//     };
//   }, [tick]);

//   useEffect(() => {
//     const channel = supabase
//       .channel('admin-bookings-live')
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () =>
//         setTick((t) => t + 1)
//       )
//       .subscribe();
//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   const filtered = useMemo<AdminBooking[]>(() => {
//     const today = toYMD(new Date());
//     const q = search.trim().toLowerCase();
//     const list = items.filter((b) => {
//       if (filter === 'upcoming' && !(b.status === 'confirmed' && b.booking_date >= today)) return false;
//       if (filter === 'cancelled' && b.status !== 'cancelled') return false;
//       if (q) {
//         const hay = `${b.profiles?.full_name ?? ''} ${b.profiles?.email ?? ''} ${b.rooms?.name ?? ''}`.toLowerCase();
//         if (!hay.includes(q)) return false;
//       }
//       return true;
//     });
//     if (filter === 'upcoming') {
//       list.sort((a, b) => (a.booking_date === b.booking_date ? a.slot - b.slot : a.booking_date < b.booking_date ? -1 : 1));
//     }
//     return list;
//   }, [items, filter, search]);

//   const cancel = (b: AdminBooking) => {
//     Alert.alert('Hủy lượt đặt?', `${b.rooms?.name} · ${b.profiles?.full_name ?? ''}`, [
//       { text: 'Không', style: 'cancel' },
//       {
//         text: 'Hủy lượt đặt',
//         style: 'destructive',
//         onPress: async () => {
//           const { data, error } = await supabase
//             .from('bookings')
//             .update({ status: 'cancelled' })
//             .eq('id', b.id)
//             .select('id');
//           if (error) Alert.alert('Lỗi', error.message);
//           else if (!data || data.length === 0) Alert.alert('Không hủy được', 'Bạn không có quyền.');
//           setTick((t) => t + 1);
//         },
//       },
//     ]);
//   };

//   const renderItem: ListRenderItem<AdminBooking> = ({ item }) => {
//     const s = SLOTS.find((x) => x.id === item.slot);
//     const cancelled = item.status === 'cancelled';
//     return (
//       <View style={[styles.bookCard, cancelled && { opacity: 0.6 }]}>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.name}>{item.rooms?.name ?? '(phòng đã xóa)'}</Text>
//           <Text style={styles.sub}>📅 {prettyDate(item.booking_date)} · {s?.label} ({s?.time})</Text>
//           <Text style={styles.sub}>
//             👤 {item.profiles?.full_name ?? '—'}
//             {item.profiles ? ` · ${ROLE_LABEL[item.profiles.role]}` : ''}
//           </Text>
//           {!!item.profiles?.email && <Text style={styles.sub}>✉ {item.profiles.email}</Text>}
//         </View>
//         {cancelled ? (
//           <Text style={{ color: COLORS.red, fontWeight: '700' }}>Đã hủy</Text>
//         ) : (
//           <TouchableOpacity onPress={() => cancel(item)}>
//             <Text style={[styles.link, { color: COLORS.red }]}>Hủy</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={styles.filterWrap}>
//         <TextInput
//           style={styles.search}
//           placeholder="🔍 Tìm theo người đặt, email, phòng..."
//           value={search}
//           onChangeText={setSearch}
//         />
//         <View style={styles.chipRow}>
//           {BOOKING_FILTERS.map((f) => (
//             <TouchableOpacity
//               key={f.key}
//               style={[styles.chip, filter === f.key && styles.chipActive]}
//               onPress={() => setFilter(f.key)}
//             >
//               <Text style={[styles.chipText, filter === f.key && { color: '#fff' }]}>{f.label}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 30 }} />
//       ) : (
//         <FlashList
//           data={filtered}
//           keyExtractor={(b) => b.id}
//           renderItem={renderItem}
//           refreshing={false}
//           onRefresh={() => setTick((t) => t + 1)}
//           contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 20 }}
//           ListEmptyComponent={<Text style={styles.empty}>Không có lượt đặt nào.</Text>}
//         />
//       )}
//     </View>
//   );
// }

// /* ---------------- MÀN HÌNH ADMIN ---------------- */
// export default function AdminScreen() {
//   const [section, setSection] = useState<Section>('bookings');

//   return (
//     <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
//       <Text style={styles.title}>Quản trị</Text>
//       <View style={styles.segment}>
//         {([
//           { key: 'bookings', label: 'Lượt đặt' },
//           { key: 'rooms', label: 'Phòng' },
//         ] as { key: Section; label: string }[]).map((s) => (
//           <TouchableOpacity
//             key={s.key}
//             style={[styles.segBtn, section === s.key && styles.segActive]}
//             onPress={() => setSection(s.key)}
//           >
//             <Text style={[styles.segText, section === s.key && { color: '#fff' }]}>{s.label}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {section === 'rooms' ? <RoomsAdmin /> : <BookingsAdmin />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   title: { fontSize: 24, fontWeight: '800', color: COLORS.text, paddingHorizontal: 14, paddingTop: 10 },
//   segment: {
//     flexDirection: 'row', margin: 14, backgroundColor: '#e5e7eb', borderRadius: 12, padding: 3,
//   },
//   segBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
//   segActive: { backgroundColor: COLORS.primary },
//   segText: { fontWeight: '700', color: COLORS.text },
//   addBtn: {
//     marginHorizontal: 14, marginBottom: 10, backgroundColor: COLORS.primary,
//     paddingVertical: 11, borderRadius: 12, alignItems: 'center',
//   },
//   addText: { color: '#fff', fontWeight: '800' },
//   card: {
//     flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
//     shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
//   },
//   thumb: { width: 92, backgroundColor: '#e5e7eb', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
//   bookCard: {
//     flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12,
//     padding: 12, marginBottom: 10,
//     shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
//   },
//   name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
//   sub: { color: COLORS.sub, marginTop: 2 },
//   statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
//   statusText: { fontWeight: '700' },
//   actions: { flexDirection: 'row', gap: 22, marginTop: 6 },
//   link: { color: COLORS.primary, fontWeight: '800' },
//   filterWrap: { paddingHorizontal: 14, paddingBottom: 6 },
//   search: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' },
//   chipRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 6 },
//   chip: {
//     paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff',
//     borderWidth: 1, borderColor: '#d1d5db',
//   },
//   chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
//   chipText: { color: COLORS.text, fontWeight: '600' },
//   empty: { textAlign: 'center', color: COLORS.sub, marginTop: 30 },
// });
 // src/screens/AdminScreen.tsx

import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import RoomFormModal from '../components/RoomFormModal';
import { COLORS, ROLE_LABEL, SLOTS } from '../constants';
import { prettyDate, toYMD } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { AdminBooking, Room } from '../types';

import { useAdminBookings } from '../hooks/useAdminBookings';
import { useAdminCancelBooking } from '../hooks/useAdminCancelBooking';
import { useAdminRoomStatus } from '../hooks/useAdminRoomStatus';
import { useAdminRooms } from '../hooks/useAdminRooms';
import { useDeleteRoom } from '../hooks/useDeleteRoom';

type Section = 'rooms' | 'bookings';

type BookingFilter =
  | 'upcoming'
  | 'cancelled'
  | 'all';

const BOOKING_FILTERS: {
  key: BookingFilter;
  label: string;
}[] = [
  {
    key: 'upcoming',
    label: 'Sắp tới',
  },
  {
    key: 'cancelled',
    label: 'Đã hủy',
  },
  {
    key: 'all',
    label: 'Tất cả',
  },
];

function AnimatedPressable({
  children,
  onPress,
  style,
  disabled = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={disabled}
        onPressIn={() => {
          if (!disabled) {
            scale.value = withSpring(0.97);
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onPress}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* =====================================================
   QUẢN LÝ PHÒNG
===================================================== */

function RoomsAdmin() {
  const queryClient = useQueryClient();

  const {
    data: rooms = [],
    isLoading: loading,
    isError,
    error,
  } = useAdminRooms();

  const setRoomStatus = useAdminRoomStatus();

  const deleteRoom = useDeleteRoom();

  const [editing, setEditing] =
    useState<Room | null>(null);

  const [creating, setCreating] =
    useState<boolean>(false);

  useEffect(() => {
    if (isError) {
      Alert.alert(
        'Lỗi',
        error?.message ??
          'Không thể tải danh sách phòng.'
      );
    }
  }, [isError, error]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-rooms-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['admin-rooms'],
          });

          queryClient.invalidateQueries({
            queryKey: ['rooms'],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const reload = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin-rooms'],
    });
  };

  const setStatus = (
    room: Room,
    next: 'active' | 'maintenance'
  ) => {
    const run = async () => {
      try {
        const data =
          await setRoomStatus.mutateAsync({
            roomId: room.id,
            status: next,
          });

        if (next === 'maintenance') {
          Alert.alert(
            'Đã chuyển sang bảo trì',
            `Đã hủy ${
              data ?? 0
            } lượt đặt sắp tới của phòng này.`
          );
        }
      } catch (error) {
        Alert.alert(
          'Lỗi',
          (error as Error).message
        );
      }
    };

    if (next === 'maintenance') {
      Alert.alert(
        'Chuyển sang bảo trì?',
        'Mọi lượt đặt từ hôm nay trở đi của phòng này sẽ bị hủy.',
        [
          {
            text: 'Không',
            style: 'cancel',
          },
          {
            text: 'Bảo trì',
            style: 'destructive',
            onPress: run,
          },
        ]
      );
    } else {
      run();
    }
  };

  const remove = (room: Room) => {
    Alert.alert(
      'Xóa phòng?',
      `Xóa "${room.name}" sẽ xóa luôn mọi lượt đặt của phòng này.`,
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRoom.mutateAsync(
                room.id
              );
            } catch (error) {
              const err = error as Error;

              Alert.alert(
                'Không xóa được',
                err.message
              );
            }
          },
        },
      ]
    );
  };

  const renderItem: ListRenderItem<Room> = ({
    item,
  }) => {
    const active =
      item.status === 'active';

    const statusChanging =
      setRoomStatus.isPending;

    const deleting =
      deleteRoom.isPending;

    return (
      <Animated.View
        entering={FadeInDown.duration(350)}
      >
        <View style={styles.card}>
          <Image
            source={{
              uri:
                item.image_url ??
                undefined,
            }}
            style={styles.thumb}
          />

          <View style={styles.roomBody}>
            <View style={styles.roomHeader}>
              <View
                style={styles.roomTitleWrap}
              >
                <Text
                  style={styles.name}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <Text
                  style={styles.sub}
                  numberOfLines={2}
                >
                  📍 {item.location}
                </Text>

                <Text
                  style={styles.capacity}
                >
                  👥 {item.capacity} chỗ
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  active
                    ? styles.statusActive
                    : styles.statusMaintenance,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        active
                          ? COLORS.green
                          : COLORS.orange,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: active
                        ? COLORS.green
                        : COLORS.orange,
                    },
                  ]}
                >
                  {active
                    ? 'Hoạt động'
                    : 'Bảo trì'}
                </Text>
              </View>
            </View>

            <View
              style={styles.statusRow}
            >
              <Switch
                value={active}
                disabled={statusChanging}
                onValueChange={(value) =>
                  setStatus(
                    item,
                    value
                      ? 'active'
                      : 'maintenance'
                  )
                }
                trackColor={{
                  false: '#d1d5db',
                  true: COLORS.green,
                }}
                thumbColor="#fff"
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color: active
                      ? COLORS.green
                      : COLORS.orange,
                  },
                ]}
              >
                Cho phép đặt phòng
              </Text>
            </View>

            <View
              style={styles.actions}
            >
              <AnimatedPressable
                disabled={
                  statusChanging ||
                  deleting
                }
                onPress={() =>
                  setEditing(item)
                }
                style={
                  styles.actionEdit
                }
              >
                <Text
                  style={
                    styles.actionEditText
                  }
                >
                  ✏️ Sửa
                </Text>
              </AnimatedPressable>

              <AnimatedPressable
                disabled={
                  statusChanging ||
                  deleting
                }
                onPress={() =>
                  remove(item)
                }
                style={
                  styles.actionDelete
                }
              >
                <Text
                  style={
                    styles.actionDeleteText
                  }
                >
                  🗑 Xóa
                </Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.flex}>
      <Animated.View
        entering={FadeInDown.duration(350)}
        style={styles.addButtonWrap}
      >
        <AnimatedPressable
          disabled={
            setRoomStatus.isPending ||
            deleteRoom.isPending
          }
          onPress={() =>
            setCreating(true)
          }
          style={styles.addBtn}
        >
          <Text style={styles.addIcon}>
            ＋
          </Text>

          <Text style={styles.addText}>
            Thêm phòng
          </Text>
        </AnimatedPressable>
      </Animated.View>

      {loading ? (
        <View
          style={styles.loadingArea}
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
        </View>
      ) : (
        <FlashList
          data={rooms}
          keyExtractor={(room) =>
            room.id
          }
          renderItem={renderItem}
          refreshing={false}
          onRefresh={reload}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={
            false
          }
          ListEmptyComponent={
            <Animated.View
              entering={FadeInUp.duration(
                350
              )}
              style={styles.emptyBox}
            >
              <Text
                style={
                  styles.emptyIcon
                }
              >
                🏢
              </Text>

              <Text style={styles.empty}>
                Chưa có phòng nào.
              </Text>
            </Animated.View>
          }
        />
      )}

      {(creating || editing) && (
        <RoomFormModal
          room={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);

            queryClient.invalidateQueries(
              {
                queryKey: [
                  'admin-rooms',
                ],
              }
            );

            queryClient.invalidateQueries(
              {
                queryKey: ['rooms'],
              }
            );
          }}
        />
      )}
    </View>
  );
}

/* =====================================================
   QUẢN LÝ LƯỢT ĐẶT
===================================================== */

function BookingsAdmin() {
  const queryClient =
    useQueryClient();

  const {
    data: items = [],
    isLoading: loading,
    isError,
    error,
  } = useAdminBookings();

  const cancelBooking =
    useAdminCancelBooking();

  const [filter, setFilter] =
    useState<BookingFilter>(
      'upcoming'
    );

  const [search, setSearch] =
    useState<string>('');

  useEffect(() => {
    if (isError) {
      Alert.alert(
        'Lỗi',
        error?.message ??
          'Không thể tải danh sách lượt đặt.'
      );
    }
  }, [isError, error]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-bookings-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          queryClient.invalidateQueries(
            {
              queryKey: [
                'admin-bookings',
              ],
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [queryClient]);

  const filtered =
    useMemo<AdminBooking[]>(() => {
      const today = toYMD(
        new Date()
      );

      const q = search
        .trim()
        .toLowerCase();

      const list = items.filter(
        (booking) => {
          if (
            filter === 'upcoming' &&
            !(
              booking.status ===
                'confirmed' &&
              booking.booking_date >=
                today
            )
          ) {
            return false;
          }

          if (
            filter === 'cancelled' &&
            booking.status !==
              'cancelled'
          ) {
            return false;
          }

          if (q) {
            const hay =
              `${booking.profiles?.full_name ?? ''} ` +
              `${booking.profiles?.email ?? ''} ` +
              `${booking.rooms?.name ?? ''}`
                .toLowerCase();

            if (!hay.includes(q)) {
              return false;
            }
          }

          return true;
        }
      );

      if (
        filter === 'upcoming'
      ) {
        list.sort((a, b) =>
          a.booking_date ===
          b.booking_date
            ? a.slot - b.slot
            : a.booking_date <
                b.booking_date
              ? -1
              : 1
        );
      } else {
        list.sort((a, b) =>
          a.booking_date ===
          b.booking_date
            ? b.slot - a.slot
            : a.booking_date <
                b.booking_date
              ? 1
              : -1
        );
      }

      return list;
    }, [items, filter, search]);

  const cancel = (
    booking: AdminBooking
  ) => {
    if (cancelBooking.isPending) {
      return;
    }

    Alert.alert(
      'Hủy lượt đặt?',
      `${booking.rooms?.name ?? ''} · ${
        booking.profiles
          ?.full_name ?? ''
      }`,
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Hủy lượt đặt',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking.mutateAsync(
                booking.id
              );
            } catch (error) {
              Alert.alert(
                'Không hủy được',
                (error as Error).message
              );
            }
          },
        },
      ]
    );
  };

  const renderItem: ListRenderItem<AdminBooking> =
    ({ item }) => {
      const slot = SLOTS.find(
        (value) =>
          value.id === item.slot
      );

      const cancelled =
        item.status ===
        'cancelled';

      return (
        <Animated.View
          entering={FadeInDown.duration(
            320
          )}
        >
          <View
            style={[
              styles.bookCard,
              cancelled &&
                styles.cancelledCard,
            ]}
          >
            <View
              style={
                styles.bookingIcon
              }
            >
              <Text
                style={
                  styles.bookingIconText
                }
              >
                {cancelled
                  ? '✕'
                  : '📅'}
              </Text>
            </View>

            <View
              style={
                styles.bookingContent
              }
            >
              <Text
                style={styles.name}
                numberOfLines={1}
              >
                {item.rooms?.name ??
                  '(phòng đã xóa)'}
              </Text>

              <Text
                style={styles.sub}
              >
                📅{' '}
                {prettyDate(
                  item.booking_date
                )}{' '}
                · {slot?.label} (
                {slot?.time})
              </Text>

              <Text
                style={styles.sub}
              >
                👤{' '}
                {item.profiles
                  ?.full_name ??
                  '—'}

                {item.profiles
                  ? ` · ${
                      ROLE_LABEL[
                        item
                          .profiles
                          .role
                      ]
                    }`
                  : ''}
              </Text>

              {!!item.profiles
                ?.email && (
                <Text
                  style={styles.sub}
                  numberOfLines={1}
                >
                  ✉{' '}
                  {
                    item
                      .profiles
                      .email
                  }
                </Text>
              )}
            </View>

            <View
              style={
                styles.bookingAction
              }
            >
              {cancelled ? (
                <View
                  style={
                    styles.cancelledBadge
                  }
                >
                  <Text
                    style={
                      styles.cancelledText
                    }
                  >
                    Đã hủy
                  </Text>
                </View>
              ) : (
                <AnimatedPressable
                  disabled={
                    cancelBooking.isPending
                  }
                  onPress={() =>
                    cancel(item)
                  }
                  style={
                    styles.cancelButton
                  }
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    {cancelBooking.isPending
                      ? '...'
                      : 'Hủy'}
                  </Text>
                </AnimatedPressable>
              )}
            </View>
          </View>
        </Animated.View>
      );
    };

  return (
    <View style={styles.flex}>
      <Animated.View
        entering={FadeInDown.duration(
          350
        )}
        style={styles.filterWrap}
      >
        <View
          style={styles.searchBox}
        >
          <Text
            style={styles.searchIcon}
          >
            ⌕
          </Text>

          <TextInput
            style={styles.search}
            placeholder="Tìm người đặt, email, phòng..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />

          {!!search && (
            <Pressable
              onPress={() =>
                setSearch('')
              }
              style={
                styles.clearSearch
              }
            >
              <Text
                style={
                  styles.clearSearchText
                }
              >
                ×
              </Text>
            </Pressable>
          )}
        </View>

        <View
          style={styles.chipRow}
        >
          {BOOKING_FILTERS.map(
            (item) => (
              <AnimatedPressable
                key={item.key}
                onPress={() =>
                  setFilter(
                    item.key
                  )
                }
                style={[
                  styles.chip,
                  filter ===
                    item.key &&
                    styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    filter ===
                      item.key &&
                      styles.chipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </AnimatedPressable>
            )
          )}
        </View>
      </Animated.View>

      {loading ? (
        <View
          style={styles.loadingArea}
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
        </View>
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(booking) =>
            booking.id
          }
          renderItem={renderItem}
          refreshing={false}
          onRefresh={() => {
            queryClient.invalidateQueries(
              {
                queryKey: [
                  'admin-bookings',
                ],
              }
            );
          }}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={
            false
          }
          ListEmptyComponent={
            <Animated.View
              entering={FadeInUp.duration(
                350
              )}
              style={styles.emptyBox}
            >
              <Text
                style={
                  styles.emptyIcon
                }
              >
                📋
              </Text>

              <Text
                style={styles.empty}
              >
                Không có lượt đặt nào.
              </Text>
            </Animated.View>
          }
        />
      )}
    </View>
  );
}

/* =====================================================
   ADMIN SCREEN
===================================================== */

export default function AdminScreen() {
  const [section, setSection] =
    useState<Section>('bookings');

  return (
    <View
      style={styles.container}
    >
      <Animated.View
        entering={FadeInDown.duration(
          400
        )}
        style={styles.header}
      >
        <View>
          <Text
            style={styles.title}
          >
            Quản trị
          </Text>

          <Text
            style={styles.subtitle}
          >
            Quản lý phòng và lượt đặt
          </Text>
        </View>

        <View
          style={styles.headerIcon}
        >
          <Text
            style={
              styles.headerIconText
            }
          >
            ⚙️
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(
          80
        ).duration(350)}
        style={styles.segment}
      >
        {[
          {
            key: 'bookings' as Section,
            label: 'Lượt đặt',
            icon: '📅',
          },
          {
            key: 'rooms' as Section,
            label: 'Phòng',
            icon: '🏢',
          },
        ].map((item) => (
          <AnimatedPressable
            key={item.key}
            onPress={() =>
              setSection(
                item.key
              )
            }
            style={[
              styles.segBtn,
              section ===
                item.key &&
                styles.segActive,
            ]}
          >
            <Text
              style={[
                styles.segIcon,
                section ===
                  item.key &&
                  styles.segIconActive,
              ]}
            >
              {item.icon}
            </Text>

            <Text
              style={[
                styles.segText,
                section ===
                  item.key &&
                  styles.segTextActive,
              ]}
            >
              {item.label}
            </Text>
          </AnimatedPressable>
        ))}
      </Animated.View>

      {section === 'rooms' ? (
        <RoomsAdmin />
      ) : (
        <BookingsAdmin />
      )}
    </View>
  );
}

const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  header: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 25, fontWeight: '800', color: COLORS.text },
  subtitle: { color: COLORS.sub, marginTop: 3, fontSize: 13 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow },
  headerIconText: { fontSize: 21 },
  segment: { flexDirection: 'row', marginHorizontal: 14, marginTop: 12, marginBottom: 12, backgroundColor: '#e5e7eb', borderRadius: 14, padding: 3 },
  segBtn: { flex: 1, minHeight: 42, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 11, flexDirection: 'row', gap: 6 },
  segActive: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.22, shadowRadius: 7, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  segIcon: { fontSize: 14 },
  segIconActive: { opacity: 1 },
  segText: { fontWeight: '700', color: COLORS.text },
  segTextActive: { color: '#fff' },
  addButtonWrap: { marginHorizontal: 14, marginBottom: 10 },
  addBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5, shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  addIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
  addText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', ...shadow },
  thumb: { width: 100, minHeight: 150, backgroundColor: '#e5e7eb' },
  roomBody: { flex: 1, padding: 11 },
  roomHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  roomTitleWrap: { flex: 1, paddingRight: 7 },
  name: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  sub: { color: COLORS.sub, marginTop: 3, fontSize: 12.5 },
  capacity: { color: COLORS.text, marginTop: 3, fontSize: 12.5, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  statusActive: { backgroundColor: COLORS.greenSoft },
  statusMaintenance: { backgroundColor: COLORS.orangeSoft },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusText: { fontWeight: '700', fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 7 },
  actionEdit: { flex: 1, backgroundColor: COLORS.primarySoft, borderRadius: 9, paddingVertical: 8, alignItems: 'center' },
  actionEditText: { color: COLORS.primary, fontWeight: '800', fontSize: 12 },
  actionDelete: { flex: 1, backgroundColor: COLORS.redSoft, borderRadius: 9, paddingVertical: 8, alignItems: 'center' },
  actionDeleteText: { color: COLORS.red, fontWeight: '800', fontSize: 12 },
  filterWrap: { paddingHorizontal: 14, paddingBottom: 7 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 13, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 11 },
  searchIcon: { fontSize: 24, color: COLORS.sub, marginRight: 5, transform: [{ rotate: '-20deg' }] },
  search: { flex: 1, paddingVertical: 12, color: COLORS.text, fontSize: 14 },
  clearSearch: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  clearSearchText: { color: COLORS.sub, fontSize: 20, lineHeight: 21 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db' },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.text, fontWeight: '600', fontSize: 12.5 },
  chipTextActive: { color: '#fff', fontWeight: '800' },
  bookCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 10, ...shadow },
  cancelledCard: { opacity: 0.6 },
  bookingIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  bookingIconText: { fontSize: 18 },
  bookingContent: { flex: 1, minWidth: 0 },
  bookingAction: { marginLeft: 8 },
  cancelledBadge: { backgroundColor: COLORS.redSoft, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9 },
  cancelledText: { color: COLORS.red, fontWeight: '800', fontSize: 11 },
  cancelButton: { backgroundColor: COLORS.redSoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9 },
  cancelButtonText: { color: COLORS.red, fontWeight: '800', fontSize: 12 },
  loadingArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 50 },
  emptyIcon: { fontSize: 38, marginBottom: 8 },
  empty: { textAlign: 'center', color: COLORS.sub, marginTop: 4, fontSize: 14 },
});