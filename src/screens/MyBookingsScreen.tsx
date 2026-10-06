// // import { FlashList, ListRenderItem } from '@shopify/flash-list';
// // import { useCallback, useEffect, useState } from 'react';
// // import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // import { COLORS, SLOTS } from '../constants';
// // import { prettyDate } from '../lib/dates';
// // import { supabase } from '../lib/supabase';
// // import { BookingWithRoom } from '../types';

// // export default function MyBookingsScreen({ userId }: { userId: string }) {
// //   const [items, setItems] = useState<BookingWithRoom[]>([]);
// //   const [loading, setLoading] = useState<boolean>(true);

// //   const load = useCallback(async () => {
// //     const { data, error } = await supabase
// //       .from('bookings')
// //       .select('id, booking_date, slot, status, rooms(name, location, image_url)')
// //       .eq('user_id', userId)
// //       .order('booking_date', { ascending: false });
// //     if (error) Alert.alert('Lỗi', error.message);
// //     else setItems((data ?? []) as unknown as BookingWithRoom[]);
// //     setLoading(false);
// //   }, [userId]);

// //   useEffect(() => {
// //     load();
// //   }, [load]);

// //   const cancel = (id: string) => {
// //     Alert.alert('Hủy đặt phòng?', 'Bạn chắc chắn muốn hủy?', [
// //       { text: 'Không', style: 'cancel' },
// //       {
// //         text: 'Hủy phòng',
// //         style: 'destructive',
// //         onPress: async () => {
// //           const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
// //           if (error) Alert.alert('Lỗi', error.message);
// //           load();
// //         },
// //       },
// //     ]);
// //   };

// //   const renderItem: ListRenderItem<BookingWithRoom> = ({ item }) => {
// //     const s = SLOTS.find((x) => x.id === item.slot);
// //     const cancelled = item.status === 'cancelled';
// //     return (
// //       <View style={styles.card}>
// //         <Image source={{ uri: item.rooms?.image_url ?? undefined }} style={styles.img} />
// //         <View style={{ flex: 1, padding: 10 }}>
// //           <Text style={styles.name}>{item.rooms?.name}</Text>
// //           <Text style={styles.sub}>📍 {item.rooms?.location}</Text>
// //           <Text style={styles.sub}>📅 {prettyDate(item.booking_date)} · {s?.label} ({s?.time})</Text>
// //           {cancelled ? (
// //             <Text style={[styles.sub, { color: COLORS.red, fontWeight: '700' }]}>Đã hủy</Text>
// //           ) : (
// //             <TouchableOpacity onPress={() => cancel(item.id)}>
// //               <Text style={styles.cancel}>Hủy đặt phòng</Text>
// //             </TouchableOpacity>
// //           )}
// //         </View>
// //       </View>
// //     );
// //   };

// //   if (loading) {
// //     return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />;
// //   }

// //   return (
// //     <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
// //       <FlashList
// //         data={items}
// //         keyExtractor={(i) => i.id}
// //         renderItem={renderItem}
// //         refreshing={false}
// //         onRefresh={load}
// //         contentContainerStyle={{ padding: 14 }}
// //         ListEmptyComponent={<Text style={styles.empty}>Bạn chưa đặt phòng nào.</Text>}
// //       />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   card: {
// //     flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
// //     shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
// //   },
// //   img: { width: 100, backgroundColor: '#e5e7eb', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
// //   name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
// //   sub: { color: COLORS.sub, marginTop: 2 },
// //   cancel: { color: COLORS.red, fontWeight: '700', marginTop: 8 },
// //   empty: { textAlign: 'center', color: COLORS.sub, marginTop: 40 },
// // });

// import { FlashList, ListRenderItem } from '@shopify/flash-list';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { COLORS, SLOTS } from '../constants';
// import { isBookingPast, prettyDate, toYMD } from '../lib/dates';
// import { cancelErrorMessage } from '../lib/errors';
// import { supabase } from '../lib/supabase';
// import { BookingWithRoom } from '../types';

// type Tab = 'upcoming' | 'past' | 'cancelled';

// const TABS: { key: Tab; label: string }[] = [
//   { key: 'upcoming', label: 'Sắp tới' },
//   { key: 'past', label: 'Đã qua' },
//   { key: 'cancelled', label: 'Đã hủy' },
// ];

// const EMPTY_TEXT: Record<Tab, string> = {
//   upcoming: 'Bạn chưa có lượt đặt nào sắp tới.',
//   past: 'Chưa có lượt đặt nào đã qua.',
//   cancelled: 'Bạn chưa hủy lượt đặt nào.',
// };

// const compareAsc = (a: BookingWithRoom, b: BookingWithRoom): number =>
//   a.booking_date === b.booking_date ? a.slot - b.slot : a.booking_date < b.booking_date ? -1 : 1;

// export default function MyBookingsScreen({ userId }: { userId: string }) {
//   const [items, setItems] = useState<BookingWithRoom[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [tab, setTab] = useState<Tab>('upcoming');
//   const [tick, setTick] = useState<number>(0);
//   const [minute, setMinute] = useState<number>(0); // để lượt đặt tự chuyển sang "Đã qua" khi hết ca

//   const load = useCallback(async () => {
//     const { data, error } = await supabase
//       .from('bookings')
//       .select('id, booking_date, slot, status, rooms(name, location, image_url)')
//       .eq('user_id', userId)
//       .order('booking_date', { ascending: false });
//     if (error) Alert.alert('Lỗi', error.message);
//     else setItems((data ?? []) as unknown as BookingWithRoom[]);
//     setLoading(false);
//   }, [userId]);

//   useEffect(() => {
//     load();
//   }, [load, tick]);

//   // Cập nhật khi admin hủy lượt đặt của mình, hoặc đặt/hủy ở nơi khác
//   useEffect(() => {
//     const channel = supabase
//       .channel(`my-bookings-${userId}`)
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () =>
//         setTick((t) => t + 1)
//       )
//       .subscribe();
//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [userId]);

//   // Mỗi phút kiểm tra lại giờ
//   useEffect(() => {
//     const id = setInterval(() => setMinute((m) => m + 1), 60000);
//     return () => clearInterval(id);
//   }, []);

//   const groups = useMemo<Record<Tab, BookingWithRoom[]>>(() => {
//     const upcoming: BookingWithRoom[] = [];
//     const past: BookingWithRoom[] = [];
//     const cancelled: BookingWithRoom[] = [];
//     items.forEach((b) => {
//       if (b.status === 'cancelled') cancelled.push(b);
//       else if (isBookingPast(b.booking_date, b.slot)) past.push(b);
//       else upcoming.push(b);
//     });
//     upcoming.sort(compareAsc); // gần nhất lên đầu
//     past.sort((a, b) => compareAsc(b, a)); // mới nhất lên đầu
//     cancelled.sort((a, b) => compareAsc(b, a));
//     return { upcoming, past, cancelled };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [items, minute]);

//   const cancel = useCallback(
//     (b: BookingWithRoom) => {
//       Alert.alert('Hủy đặt phòng?', `${b.rooms?.name ?? ''}\n${prettyDate(b.booking_date)}`, [
//         { text: 'Không', style: 'cancel' },
//         {
//           text: 'Hủy phòng',
//           style: 'destructive',
//           onPress: async () => {
//             const { data, error } = await supabase
//               .from('bookings')
//               .update({ status: 'cancelled' })
//               .eq('id', b.id)
//               .select('id');
//             if (error) Alert.alert('Không hủy được', cancelErrorMessage(error));
//             else if (!data || data.length === 0) Alert.alert('Không hủy được', 'Không tìm thấy lượt đặt.');
//             setTick((t) => t + 1);
//           },
//         },
//       ]);
//     },
//     []
//   );

//   const today = toYMD(new Date());

//   const renderItem: ListRenderItem<BookingWithRoom> = ({ item }) => {
//     const s = SLOTS.find((x) => x.id === item.slot);
//     const cancelled = item.status === 'cancelled';
//     const past = !cancelled && isBookingPast(item.booking_date, item.slot);
//     const isToday = !cancelled && !past && item.booking_date === today;

//     return (
//       <View style={[styles.card, (cancelled || past) && { opacity: 0.85 }]}>
//         <Image source={{ uri: item.rooms?.image_url ?? undefined }} style={styles.img} />
//         <View style={{ flex: 1, padding: 10 }}>
//           <View style={styles.nameRow}>
//             <Text style={styles.name} numberOfLines={1}>{item.rooms?.name}</Text>
//             {isToday && (
//               <View style={styles.todayTag}>
//                 <Text style={styles.todayText}>Hôm nay</Text>
//               </View>
//             )}
//           </View>
//           <Text style={styles.sub}>📍 {item.rooms?.location}</Text>
//           <Text style={styles.sub}>📅 {prettyDate(item.booking_date)} · {s?.label} ({s?.time})</Text>

//           {cancelled ? (
//             <Text style={[styles.state, { color: COLORS.red }]}>Đã hủy</Text>
//           ) : past ? (
//             <Text style={[styles.state, { color: COLORS.green }]}>✔ Đã sử dụng</Text>
//           ) : (
//             <TouchableOpacity onPress={() => cancel(item)}>
//               <Text style={styles.cancel}>Hủy đặt phòng</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />;
//   }

//   const list = groups[tab];

//   return (
//     <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
//       <Text style={styles.title}>Phòng đã đặt</Text>

//       <View style={styles.segment}>
//         {TABS.map((t) => (
//           <TouchableOpacity
//             key={t.key}
//             style={[styles.segBtn, tab === t.key && styles.segActive]}
//             onPress={() => setTab(t.key)}
//           >
//             <Text style={[styles.segText, tab === t.key && { color: '#fff' }]}>
//               {t.label} ({groups[t.key].length})
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <FlashList
//         data={list}
//         extraData={minute}
//         keyExtractor={(i) => i.id}
//         renderItem={renderItem}
//         refreshing={false}
//         onRefresh={() => setTick((t) => t + 1)}
//         contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 20 }}
//         ListEmptyComponent={<Text style={styles.empty}>{EMPTY_TEXT[tab]}</Text>}
//       />
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
//   segText: { fontWeight: '700', color: COLORS.text, fontSize: 13 },
//   card: {
//     flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
//     shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
//   },
//   img: { width: 100, backgroundColor: '#e5e7eb', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
//   nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   name: { fontSize: 16, fontWeight: '700', color: COLORS.text, flexShrink: 1 },
//   todayTag: { backgroundColor: COLORS.orangeSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
//   todayText: { color: COLORS.orange, fontSize: 11, fontWeight: '800' },
//   sub: { color: COLORS.sub, marginTop: 2 },
//   state: { fontWeight: '700', marginTop: 8 },
//   cancel: { color: COLORS.red, fontWeight: '700', marginTop: 8 },
//   empty: { textAlign: 'center', color: COLORS.sub, marginTop: 40 },
// });
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, SLOTS } from '../constants';
import { useCancelBooking } from '../hooks/useCancelBooking';
import { useMyBookings } from '../hooks/useMyBookings';
import { isBookingPast, prettyDate, toYMD } from '../lib/dates';
import { cancelErrorMessage } from '../lib/errors';
import { supabase } from '../lib/supabase';
import { BookingWithRoom } from '../types';

type Tab = 'upcoming' | 'past' | 'cancelled';

const TABS: { key: Tab; label: string }[] = [
  { key: 'upcoming', label: 'Sắp tới' },
  { key: 'past', label: 'Đã qua' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const EMPTY_TEXT: Record<Tab, string> = {
  upcoming: 'Bạn chưa có lượt đặt nào sắp tới.',
  past: 'Chưa có lượt đặt nào đã qua.',
  cancelled: 'Bạn chưa hủy lượt đặt nào.',
};

const compareAsc = (
  a: BookingWithRoom,
  b: BookingWithRoom
): number =>
  a.booking_date === b.booking_date
    ? a.slot - b.slot
    : a.booking_date < b.booking_date
      ? -1
      : 1;

function TabButton({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.segWrapper, animatedStyle]}>
      <Pressable
        style={[styles.segBtn, active && styles.segActive]}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
      >
        <Text style={[styles.segText, active && styles.segTextActive]}>
          {label}
        </Text>

        <View
          style={[
            styles.countBadge,
            active && styles.countBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.countText,
              active && styles.countTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function MyBookingsScreen({
  userId,
}: {
  userId: string;
}) {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('upcoming');
  const [minute, setMinute] = useState<number>(0);

  const {
    data: items = [],
    isLoading: loading,
    isError,
    error,
  } = useMyBookings(userId);

  const cancelBooking = useCancelBooking(userId);

  useEffect(() => {
    if (isError) {
      Alert.alert(
        'Lỗi',
        error?.message ?? 'Không thể tải lịch đặt phòng.'
      );
    }
  }, [isError, error]);

  useEffect(() => {
    const channel = supabase
      .channel(`my-bookings-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['my-bookings', userId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  useEffect(() => {
    const id = setInterval(() => {
      setMinute((m) => m + 1);
    }, 60000);

    return () => clearInterval(id);
  }, []);

  const groups = useMemo<Record<Tab, BookingWithRoom[]>>(() => {
    const upcoming: BookingWithRoom[] = [];
    const past: BookingWithRoom[] = [];
    const cancelled: BookingWithRoom[] = [];

    items.forEach((b) => {
      if (b.status === 'cancelled') {
        cancelled.push(b);
      } else if (isBookingPast(b.booking_date, b.slot)) {
        past.push(b);
      } else {
        upcoming.push(b);
      }
    });

    upcoming.sort(compareAsc);
    past.sort((a, b) => compareAsc(b, a));
    cancelled.sort((a, b) => compareAsc(b, a));

    return {
      upcoming,
      past,
      cancelled,
    };
  }, [items, minute]);

  const cancel = useCallback(
    (b: BookingWithRoom) => {
      if (cancelBooking.isPending) {
        return;
      }

      Alert.alert(
        'Hủy đặt phòng?',
        `${b.rooms?.name ?? ''}\n${prettyDate(b.booking_date)}`,
        [
          {
            text: 'Không',
            style: 'cancel',
          },
          {
            text: 'Hủy phòng',
            style: 'destructive',
            onPress: async () => {
              try {
                await cancelBooking.mutateAsync({
                  bookingId: b.id,
                });
              } catch (error) {
                if (
                  (error as Error).name ===
                  'BOOKING_NOT_FOUND'
                ) {
                  Alert.alert(
                    'Không hủy được',
                    'Không tìm thấy lượt đặt.'
                  );
                  return;
                }

                Alert.alert(
                  'Không hủy được',
                  cancelErrorMessage(error as Error)
                );
              }
            },
          },
        ]
      );
    },
    [cancelBooking]
  );

  const today = toYMD(new Date());

  const renderItem: ListRenderItem<BookingWithRoom> = ({
    item,
    index,
  }) => {
    const s = SLOTS.find((x) => x.id === item.slot);

    const cancelled = item.status === 'cancelled';

    const past =
      !cancelled &&
      isBookingPast(item.booking_date, item.slot);

    const isToday =
      !cancelled &&
      !past &&
      item.booking_date === today;

    return (
      <Animated.View
        entering={FadeInUp.delay(
          Math.min(index * 50, 250)
        ).duration(350)}
      >
        <View
          style={[
            styles.card,
            (cancelled || past) && styles.cardMuted,
          ]}
        >
          <Image
            source={{
              uri: item.rooms?.image_url ?? undefined,
            }}
            style={styles.img}
          />

          <View style={styles.cardBody}>
            <View style={styles.nameRow}>
              <Text
                style={styles.name}
                numberOfLines={1}
              >
                {item.rooms?.name}
              </Text>

              {isToday && (
                <View style={styles.todayTag}>
                  <Text style={styles.todayText}>
                    Hôm nay
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.sub}>
              📍 {item.rooms?.location}
            </Text>

            <Text style={styles.sub}>
              📅 {prettyDate(item.booking_date)} ·{' '}
              {s?.label} ({s?.time})
            </Text>

            {cancelled ? (
              <View style={styles.stateRow}>
                <View style={styles.cancelledDot} />

                <Text
                  style={[
                    styles.state,
                    { color: COLORS.red },
                  ]}
                >
                  Đã hủy
                </Text>
              </View>
            ) : past ? (
              <View style={styles.stateRow}>
                <View style={styles.doneDot} />

                <Text
                  style={[
                    styles.state,
                    { color: COLORS.green },
                  ]}
                >
                  Đã sử dụng
                </Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed &&
                    styles.cancelBtnPressed,
                ]}
                onPress={() => cancel(item)}
                disabled={cancelBooking.isPending}
              >
                <Text style={styles.cancel}>
                  {cancelBooking.isPending
                    ? 'Đang hủy...'
                    : 'Hủy đặt phòng'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  const list = groups[tab];

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeInDown.duration(400)}
      >
        <Text style={styles.title}>
          Phòng đã đặt
        </Text>

        <Text style={styles.subtitle}>
          Theo dõi các lượt đặt phòng của bạn
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.segment}
      >
        {TABS.map((t) => (
          <TabButton
            key={t.key}
            label={t.label}
            count={groups[t.key].length}
            active={tab === t.key}
            onPress={() => setTab(t.key)}
          />
        ))}
      </Animated.View>

      <FlashList
        data={list}
        extraData={minute}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        refreshing={false}
        onRefresh={() => {
          queryClient.invalidateQueries({
            queryKey: ['my-bookings', userId],
          });
        }}
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>
              {tab === 'upcoming'
                ? '📅'
                : tab === 'past'
                  ? '🕘'
                  : '↩️'}
            </Text>

            <Text style={styles.emptyTitle}>
              {EMPTY_TEXT[tab]}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.text, paddingHorizontal: 14, paddingTop: 12 },
  subtitle: { color: COLORS.sub, paddingHorizontal: 14, marginTop: 3, marginBottom: 2 },
  segment: { flexDirection: 'row', margin: 14, padding: 4, backgroundColor: '#e5e7eb', borderRadius: 14 },
  segWrapper: { flex: 1 },
  segBtn: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 11, gap: 5 },
  segActive: { backgroundColor: COLORS.primary },
  segText: { fontWeight: '800', color: COLORS.text, fontSize: 12 },
  segTextActive: { color: '#fff' },
  countBadge: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#d1d5db' },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  countText: { color: COLORS.text, fontSize: 11, fontWeight: '800' },
  countTextActive: { color: '#fff' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  cardMuted: { opacity: 0.78 },
  img: { width: 105, minHeight: 145, backgroundColor: '#e5e7eb' },
  cardBody: { flex: 1, padding: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.text },
  todayTag: { backgroundColor: COLORS.orangeSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  todayText: { color: COLORS.orange, fontSize: 10, fontWeight: '900' },
  sub: { color: COLORS.sub, marginTop: 5, fontSize: 13 },
  stateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  state: { fontWeight: '800' },
  cancelledDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.red },
  doneDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green },
  cancelBtn: { alignSelf: 'flex-start', marginTop: 9, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.redSoft },
  cancelBtnPressed: { opacity: 0.7 },
  cancel: { color: COLORS.red, fontWeight: '800', fontSize: 12 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 70, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 38, marginBottom: 10 },
  emptyTitle: { textAlign: 'center', color: COLORS.sub, fontSize: 14, lineHeight: 20 },
});