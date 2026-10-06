// import type { User } from '@supabase/supabase-js';
// import { useCallback, useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView, Platform,
//   ScrollView, StyleSheet,
//   Text, TextInput, TouchableOpacity,
//   View,
// } from 'react-native';
// import { COLORS, ROLE_LABEL, SLOTS } from '../constants';
// import { isSlotPast, prettyDate, toYMD } from '../lib/dates';
// import { supabase } from '../lib/supabase';
// import { Profile } from '../types';

// interface Props {
//   user: User;
//   profile: Profile | null;
//   onProfileChange: (p: Profile) => void;
// }

// interface BookingLite {
//   id: string;
//   booking_date: string;
//   slot: number;
//   status: 'confirmed' | 'cancelled';
//   rooms: { name: string; location: string } | null;
// }

// interface UserStats {
//   upcoming: number;
//   done: number;
//   cancelled: number;
//   next: BookingLite | null;
// }

// interface AdminStats {
//   rooms: number;
//   maintenance: number;
//   upcoming: number;
//   users: number;
// }

// interface Form {
//   name: string;
//   phone: string;
//   code: string;
//   faculty: string;
//   className: string;
// }

// const isPastBooking = (b: BookingLite): boolean => {
//   const today = toYMD(new Date());
//   if (b.booking_date < today) return true;
//   if (b.booking_date > today) return false;
//   const s = SLOTS.find((x) => x.id === b.slot);
//   return s ? isSlotPast(b.booking_date, s) : false;
// };

// const codeLabel = (role: Profile['role']): string =>
//   role === 'student' ? 'MSSV' : role === 'lecturer' ? 'Mã giảng viên' : 'Mã nhân viên';

// const formatJoined = (iso: string): string => {
//   const d = new Date(iso);
//   return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
// };

// function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
//   return (
//     <View style={styles.infoRow}>
//       <Text style={styles.infoLabel}>{label}</Text>
//       {value ? (
//         <Text style={styles.infoValue}>{value}</Text>
//       ) : (
//         <Text style={styles.infoEmpty}>Chưa cập nhật</Text>
//       )}
//     </View>
//   );
// }

// function EditField({
//   label, value, onChange, keyboardType, maxLength,
// }: {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   keyboardType?: 'default' | 'phone-pad';
//   maxLength?: number;
// }) {
//   return (
//     <View style={{ marginBottom: 12 }}>
//       <Text style={styles.editLabel}>{label}</Text>
//       <TextInput
//         style={styles.input}
//         value={value}
//         onChangeText={onChange}
//         keyboardType={keyboardType}
//         maxLength={maxLength}
//         autoCapitalize="none"
//       />
//     </View>
//   );
// }

// function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
//   return (
//     <View style={styles.statBox}>
//       <Text style={[styles.statValue, { color }]}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </View>
//   );
// }

// export default function ProfileScreen({ user, profile, onProfileChange }: Props) {
//   const [stats, setStats] = useState<UserStats | null>(null);
//   const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
//   const [editing, setEditing] = useState<boolean>(false);
//   const [saving, setSaving] = useState<boolean>(false);
//   const [form, setForm] = useState<Form>({ name: '', phone: '', code: '', faculty: '', className: '' });
//   const [pwOpen, setPwOpen] = useState<boolean>(false);
//   const [newPw, setNewPw] = useState<string>('');
//   const [confirmPw, setConfirmPw] = useState<string>('');
//   const [pwSaving, setPwSaving] = useState<boolean>(false);

//   const role = profile?.role;

//   // Tải thống kê
//   const loadStats = useCallback(async () => {
//     if (!role) return;

//     if (role === 'admin') {
//       const today = toYMD(new Date());
//       const [r, b, u] = await Promise.all([
//         supabase.from('rooms').select('id, status'),
//         supabase
//           .from('bookings')
//           .select('id', { count: 'exact', head: true })
//           .eq('status', 'confirmed')
//           .gte('booking_date', today),
//         supabase.from('profiles').select('id', { count: 'exact', head: true }),
//       ]);
//       const rooms = (r.data ?? []) as { id: string; status: string }[];
//       setAdminStats({
//         rooms: rooms.length,
//         maintenance: rooms.filter((x) => x.status === 'maintenance').length,
//         upcoming: b.count ?? 0,
//         users: u.count ?? 0,
//       });
//       return;
//     }

//     const { data, error } = await supabase
//       .from('bookings')
//       .select('id, booking_date, slot, status, rooms(name, location)')
//       .eq('user_id', user.id)
//       .order('booking_date', { ascending: true });
//     if (error || !data) return;

//     const list = data as unknown as BookingLite[];
//     const confirmed = list.filter((b) => b.status === 'confirmed');
//     const upcomingList = confirmed
//       .filter((b) => !isPastBooking(b))
//       .sort((a, b) =>
//         a.booking_date === b.booking_date ? a.slot - b.slot : a.booking_date < b.booking_date ? -1 : 1
//       );

//     setStats({
//       upcoming: upcomingList.length,
//       done: confirmed.length - upcomingList.length,
//       cancelled: list.length - confirmed.length,
//       next: upcomingList[0] ?? null,
//     });
//   }, [role, user.id]);

//   useEffect(() => {
//     loadStats();
//   }, [loadStats]);

//   if (!profile) {
//     return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />;
//   }

//   const startEdit = () => {
//     setForm({
//       name: profile.full_name,
//       phone: profile.phone ?? '',
//       code: profile.student_code ?? '',
//       faculty: profile.faculty ?? '',
//       className: profile.class_name ?? '',
//     });
//     setEditing(true);
//   };

//   const save = async () => {
//     const name = form.name.trim();
//     const phone = form.phone.trim();
//     if (!name) {
//       Alert.alert('Thiếu thông tin', 'Họ tên không được để trống.');
//       return;
//     }
//     if (phone && !/^[0-9+ ]{9,15}$/.test(phone)) {
//       Alert.alert('Số điện thoại không hợp lệ', 'Chỉ gồm số, dấu + hoặc khoảng trắng (9-15 ký tự).');
//       return;
//     }

//     setSaving(true);
//     const { data, error } = await supabase
//       .from('profiles')
//       .update({
//         full_name: name,
//         phone: phone || null,
//         student_code: form.code.trim() || null,
//         faculty: form.faculty.trim() || null,
//         class_name: profile.role === 'student' ? form.className.trim() || null : null,
//       })
//       .eq('id', user.id)
//       .select()
//       .single();
//     setSaving(false);

//     if (error || !data) {
//       Alert.alert('Không lưu được', error?.message ?? 'Vui lòng thử lại.');
//       return;
//     }
//     onProfileChange(data as Profile);
//     setEditing(false);
//   };

//   const changePassword = async () => {
//     if (newPw.length < 6) {
//       Alert.alert('Mật khẩu quá ngắn', 'Mật khẩu mới cần tối thiểu 6 ký tự.');
//       return;
//     }
//     if (newPw !== confirmPw) {
//       Alert.alert('Không khớp', 'Mật khẩu nhập lại không giống mật khẩu mới.');
//       return;
//     }
//     setPwSaving(true);
//     const { error } = await supabase.auth.updateUser({ password: newPw });
//     setPwSaving(false);
//     if (error) {
//       Alert.alert('Không đổi được mật khẩu', error.message);
//       return;
//     }
//     setNewPw('');
//     setConfirmPw('');
//     setPwOpen(false);
//     Alert.alert('Thành công', 'Đã đổi mật khẩu.');
//   };

//   const logout = () => {
//     Alert.alert('Đăng xuất?', 'Bạn có chắc muốn đăng xuất?', [
//       { text: 'Không', style: 'cancel' },
//       { text: 'Đăng xuất', style: 'destructive', onPress: () => supabase.auth.signOut() },
//     ]);
//   };

//   const nextSlot = stats?.next ? SLOTS.find((s) => s.id === stats.next!.slot) : undefined;

//   return (
//     <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//       <ScrollView
//         style={{ backgroundColor: COLORS.bg }}
//         contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
//         keyboardShouldPersistTaps="handled"
//       >
//         {/* Thẻ đầu trang */}
//         <View style={styles.headerCard}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>{profile.full_name.charAt(0).toUpperCase()}</Text>
//           </View>
//           <Text style={styles.name}>{profile.full_name}</Text>
//           <View style={styles.roleTag}>
//             <Text style={styles.roleText}>{ROLE_LABEL[profile.role]}</Text>
//           </View>
//           <Text style={styles.email}>{user.email}</Text>
//         </View>

//         {/* Thống kê */}
//         {profile.role === 'admin' ? (
//           <>
//             <Text style={styles.sectionTitle}>Tổng quan hệ thống</Text>
//             {adminStats ? (
//               <View style={styles.statRow}>
//                 <StatBox value={adminStats.rooms} label="Phòng" color={COLORS.primary} />
//                 <StatBox value={adminStats.maintenance} label="Bảo trì" color={COLORS.orange} />
//                 <StatBox value={adminStats.upcoming} label="Lượt đặt sắp tới" color={COLORS.green} />
//                 <StatBox value={adminStats.users} label="Người dùng" color={COLORS.text} />
//               </View>
//             ) : (
//               <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 14 }} />
//             )}
//           </>
//         ) : (
//           <>
//             <Text style={styles.sectionTitle}>Hoạt động đặt phòng</Text>
//             {stats ? (
//               <>
//                 <View style={styles.statRow}>
//                   <StatBox value={stats.upcoming} label="Sắp tới" color={COLORS.primary} />
//                   <StatBox value={stats.done} label="Đã sử dụng" color={COLORS.green} />
//                   <StatBox value={stats.cancelled} label="Đã hủy" color={COLORS.red} />
//                 </View>
//                 <View style={styles.nextCard}>
//                   <Text style={styles.nextTitle}>Lượt đặt gần nhất</Text>
//                   {stats.next ? (
//                     <>
//                       <Text style={styles.nextRoom}>{stats.next.rooms?.name}</Text>
//                       <Text style={styles.nextSub}>📍 {stats.next.rooms?.location}</Text>
//                       <Text style={styles.nextSub}>
//                         📅 {prettyDate(stats.next.booking_date)} · {nextSlot?.label} ({nextSlot?.time})
//                       </Text>
//                     </>
//                   ) : (
//                     <Text style={styles.nextSub}>Bạn chưa có lượt đặt nào sắp tới.</Text>
//                   )}
//                 </View>
//               </>
//             ) : (
//               <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 14 }} />
//             )}
//           </>
//         )}

//         {/* Thông tin cá nhân */}
//         <View style={styles.sectionHead}>
//           <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
//           {!editing && (
//             <TouchableOpacity onPress={startEdit}>
//               <Text style={styles.link}>✏️ Sửa</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         <View style={styles.card}>
//           {editing ? (
//             <>
//               <EditField label="Họ và tên *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} maxLength={60} />
//               <EditField
//                 label="Số điện thoại"
//                 value={form.phone}
//                 onChange={(v) => setForm({ ...form, phone: v })}
//                 keyboardType="phone-pad"
//                 maxLength={15}
//               />
//               <EditField
//                 label={codeLabel(profile.role)}
//                 value={form.code}
//                 onChange={(v) => setForm({ ...form, code: v })}
//                 maxLength={20}
//               />
//               {profile.role === 'student' && (
//                 <EditField label="Lớp" value={form.className} onChange={(v) => setForm({ ...form, className: v })} maxLength={30} />
//               )}
//               <EditField
//                 label="Khoa / Bộ môn"
//                 value={form.faculty}
//                 onChange={(v) => setForm({ ...form, faculty: v })}
//                 maxLength={60}
//               />

//               <View style={styles.btnRow}>
//                 <TouchableOpacity style={styles.ghostBtn} onPress={() => setEditing(false)} disabled={saving}>
//                   <Text style={styles.ghostText}>Hủy</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.primaryBtn} onPress={save} disabled={saving}>
//                   {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Lưu thay đổi</Text>}
//                 </TouchableOpacity>
//               </View>
//             </>
//           ) : (
//             <>
//               <InfoRow label="Họ và tên" value={profile.full_name} />
//               <InfoRow label="Email" value={user.email} />
//               <InfoRow label="Số điện thoại" value={profile.phone} />
//               <InfoRow label={codeLabel(profile.role)} value={profile.student_code} />
//               {profile.role === 'student' && <InfoRow label="Lớp" value={profile.class_name} />}
//               <InfoRow label="Khoa / Bộ môn" value={profile.faculty} />
//               <InfoRow label="Vai trò" value={ROLE_LABEL[profile.role]} />
//               <InfoRow label="Ngày tham gia" value={formatJoined(profile.created_at)} />
//             </>
//           )}
//         </View>

//         {/* Bảo mật */}
//         <Text style={styles.sectionTitle}>Bảo mật</Text>
//         <View style={styles.card}>
//           {pwOpen ? (
//             <>
//               <View style={{ marginBottom: 12 }}>
//                 <Text style={styles.editLabel}>Mật khẩu mới</Text>
//                 <TextInput style={styles.input} secureTextEntry value={newPw} onChangeText={setNewPw} />
//               </View>
//               <View style={{ marginBottom: 12 }}>
//                 <Text style={styles.editLabel}>Nhập lại mật khẩu mới</Text>
//                 <TextInput style={styles.input} secureTextEntry value={confirmPw} onChangeText={setConfirmPw} />
//               </View>
//               <View style={styles.btnRow}>
//                 <TouchableOpacity
//                   style={styles.ghostBtn}
//                   onPress={() => {
//                     setPwOpen(false);
//                     setNewPw('');
//                     setConfirmPw('');
//                   }}
//                   disabled={pwSaving}
//                 >
//                   <Text style={styles.ghostText}>Hủy</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.primaryBtn} onPress={changePassword} disabled={pwSaving}>
//                   {pwSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Đổi mật khẩu</Text>}
//                 </TouchableOpacity>
//               </View>
//             </>
//           ) : (
//             <TouchableOpacity onPress={() => setPwOpen(true)}>
//               <Text style={styles.link}>🔒 Đổi mật khẩu</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         <TouchableOpacity style={styles.logout} onPress={logout}>
//           <Text style={styles.logoutText}>Đăng xuất</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const shadow = {
//   shadowColor: '#000',
//   shadowOpacity: 0.08,
//   shadowRadius: 6,
//   shadowOffset: { width: 0, height: 2 },
//   elevation: 2,
// } as const;

// const styles = StyleSheet.create({
//   headerCard: { backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', padding: 20, ...shadow },
//   avatar: {
//     width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primary,
//     alignItems: 'center', justifyContent: 'center',
//   },
//   avatarText: { color: '#fff', fontSize: 38, fontWeight: '800' },
//   name: { fontSize: 22, fontWeight: '800', marginTop: 12, color: COLORS.text, textAlign: 'center' },
//   roleTag: { marginTop: 8, backgroundColor: COLORS.primarySoft, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 14 },
//   roleText: { color: COLORS.primary, fontWeight: '700' },
//   email: { color: COLORS.sub, marginTop: 8 },

//   sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginTop: 18, marginBottom: 8 },

//   statRow: { flexDirection: 'row', gap: 8 },
//   statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, alignItems: 'center', ...shadow },
//   statValue: { fontSize: 24, fontWeight: '800' },
//   statLabel: { color: COLORS.sub, marginTop: 2, fontSize: 12, textAlign: 'center' },

//   nextCard: { backgroundColor: COLORS.primarySoft, borderRadius: 14, padding: 14, marginTop: 10 },
//   nextTitle: { color: COLORS.primary, fontWeight: '800', marginBottom: 6 },
//   nextRoom: { fontSize: 17, fontWeight: '800', color: COLORS.text },
//   nextSub: { color: COLORS.text, marginTop: 3 },

//   card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, ...shadow },
//   infoRow: {
//     flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
//     borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb',
//   },
//   infoLabel: { color: COLORS.sub, flex: 1 },
//   infoValue: { color: COLORS.text, fontWeight: '600', flex: 1.6, textAlign: 'right' },
//   infoEmpty: { color: COLORS.gray, flex: 1.6, textAlign: 'right', fontStyle: 'italic' },

//   editLabel: { fontWeight: '700', color: COLORS.text, marginBottom: 6 },
//   input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, backgroundColor: '#f9fafb' },
//   btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
//   ghostBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db' },
//   ghostText: { color: COLORS.text, fontWeight: '700' },
//   primaryBtn: { flex: 1.4, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.primary },
//   primaryText: { color: '#fff', fontWeight: '800' },
//   link: { color: COLORS.primary, fontWeight: '800' },

//   logout: { marginTop: 22, backgroundColor: COLORS.red, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
//   logoutText: { color: '#fff', fontWeight: '800', fontSize: 16 },
// });
// src/screens/ProfileScreen.tsx

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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

import { COLORS, ROLE_LABEL, SLOTS } from '../constants';
import { useProfileStats } from '../hooks/useProfileStats';
import { prettyDate } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { Profile } from '../types';

interface Props {
  user: User;
  profile: Profile | null;
  onProfileChange: (p: Profile) => void;
}

interface Form {
  name: string;
  phone: string;
  code: string;
  faculty: string;
  className: string;
}

interface BookingLite {
  id: string;
  booking_date: string;
  slot: number;
  status: 'confirmed' | 'cancelled';
  rooms: {
    name: string;
    location: string;
  } | null;
}

interface UserStats {
  upcoming: number;
  done: number;
  cancelled: number;
  next: BookingLite | null;
}

interface AdminStats {
  rooms: number;
  maintenance: number;
  upcoming: number;
  users: number;
}

const codeLabel = (role: Profile['role']): string => {
  if (role === 'student') {
    return 'MSSV';
  }

  if (role === 'lecturer') {
    return 'Mã giảng viên';
  }

  return 'Mã nhân viên';
};

const formatJoined = (iso: string): string => {
  const d = new Date(iso);

  return `${String(d.getDate()).padStart(2, '0')}/${String(
    d.getMonth() + 1
  ).padStart(2, '0')}/${d.getFullYear()}`;
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      {value ? (
        <Text style={styles.infoValue}>{value}</Text>
      ) : (
        <Text style={styles.infoEmpty}>Chưa cập nhật</Text>
      )}
    </View>
  );
}

function EditField({
  label,
  value,
  onChange,
  keyboardType,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: 'default' | 'phone-pad';
  maxLength?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.editLabel}>{label}</Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize="none"
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
}

function StatBox({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.statBox, animatedStyle]}>
      <Text style={[styles.statValue, { color }]}>
        {value}
      </Text>

      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[styles.actionButtonWrap, animatedStyle]}
    >
      <Pressable
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onPress}
        style={[
          styles.actionButton,
          variant === 'ghost'
            ? styles.ghostBtn
            : styles.primaryBtn,
          disabled && styles.disabledBtn,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={
              variant === 'ghost'
                ? COLORS.primary
                : '#fff'
            }
          />
        ) : (
          <Text
            style={
              variant === 'ghost'
                ? styles.ghostText
                : styles.primaryText
            }
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function ProfileScreen({
  user,
  profile,
  onProfileChange,
}: Props) {
  const updateProfile = useAuthStore(
    (state) => state.updateProfile
  );

  const logoutStore = useAuthStore(
    (state) => state.logout
  );

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Form>({
    name: '',
    phone: '',
    code: '',
    faculty: '',
    className: '',
  });

  const [pwOpen, setPwOpen] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const role = profile?.role;

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useProfileStats(user.id, role);

  const stats =
    role !== 'admin'
      ? (statsData as UserStats | undefined)
      : undefined;

  const adminStats =
    role === 'admin'
      ? (statsData as AdminStats | undefined)
      : undefined;

  useEffect(() => {
    if (statsError) {
      Alert.alert(
        'Không tải được thống kê',
        'Vui lòng thử lại.'
      );
    }
  }, [statsError]);

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  const startEdit = () => {
    setForm({
      name: profile.full_name,
      phone: profile.phone ?? '',
      code: profile.student_code ?? '',
      faculty: profile.faculty ?? '',
      className: profile.class_name ?? '',
    });

    setEditing(true);
  };

  const save = async () => {
    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!name) {
      Alert.alert(
        'Thiếu thông tin',
        'Họ tên không được để trống.'
      );
      return;
    }

    if (phone && !/^[0-9+ ]{9,15}$/.test(phone)) {
      Alert.alert(
        'Số điện thoại không hợp lệ',
        'Chỉ gồm số, dấu + hoặc khoảng trắng (9-15 ký tự).'
      );
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        phone: phone || null,
        student_code: form.code.trim() || null,
        faculty: form.faculty.trim() || null,
        class_name:
          profile.role === 'student'
            ? form.className.trim() || null
            : null,
      })
      .eq('id', user.id)
      .select()
      .single();

    setSaving(false);

    if (error || !data) {
      Alert.alert(
        'Không lưu được',
        error?.message ?? 'Vui lòng thử lại.'
      );
      return;
    }

    const updatedProfile = data as Profile;

    updateProfile(updatedProfile);
    onProfileChange(updatedProfile);

    await refetchStats();

    setEditing(false);

    Alert.alert(
      'Thành công',
      'Thông tin cá nhân đã được cập nhật.'
    );
  };

  const changePassword = async () => {
    if (newPw.length < 6) {
      Alert.alert(
        'Mật khẩu quá ngắn',
        'Mật khẩu mới cần tối thiểu 6 ký tự.'
      );
      return;
    }

    if (newPw !== confirmPw) {
      Alert.alert(
        'Không khớp',
        'Mật khẩu nhập lại không giống mật khẩu mới.'
      );
      return;
    }

    setPwSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: newPw,
    });

    setPwSaving(false);

    if (error) {
      Alert.alert(
        'Không đổi được mật khẩu',
        error.message
      );
      return;
    }

    setNewPw('');
    setConfirmPw('');
    setPwOpen(false);

    Alert.alert(
      'Thành công',
      'Đã đổi mật khẩu.'
    );
  };

  const logout = () => {
    Alert.alert(
      'Đăng xuất?',
      'Bạn có chắc muốn đăng xuất?',
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            logoutStore();

            const { error } =
              await supabase.auth.signOut();

            if (error) {
              Alert.alert(
                'Đăng xuất thất bại',
                error.message
              );
            }
          },
        },
      ]
    );
  };

  const nextSlot = stats?.next
    ? SLOTS.find(
        (s) => s.id === stats.next?.slot
      )
    : undefined;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(450)}
        >
          <View style={styles.headerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.full_name
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <Text style={styles.name}>
              {profile.full_name}
            </Text>

            <View style={styles.roleTag}>
              <Text style={styles.roleText}>
                {ROLE_LABEL[profile.role]}
              </Text>
            </View>

            <Text style={styles.email}>
              {user.email}
            </Text>
          </View>
        </Animated.View>

        {profile.role === 'admin' ? (
          <Animated.View
            entering={FadeInUp.delay(80).duration(400)}
          >
            <Text style={styles.sectionTitle}>
              Tổng quan hệ thống
            </Text>

            {statsLoading ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={styles.loader}
              />
            ) : adminStats ? (
              <View style={styles.statRow}>
                <StatBox
                  value={adminStats.rooms}
                  label="Phòng"
                  color={COLORS.primary}
                />

                <StatBox
                  value={adminStats.maintenance}
                  label="Bảo trì"
                  color={COLORS.orange}
                />

                <StatBox
                  value={adminStats.upcoming}
                  label="Lượt đặt sắp tới"
                  color={COLORS.green}
                />

                <StatBox
                  value={adminStats.users}
                  label="Người dùng"
                  color={COLORS.text}
                />
              </View>
            ) : null}
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInUp.delay(80).duration(400)}
          >
            <Text style={styles.sectionTitle}>
              Hoạt động đặt phòng
            </Text>

            {statsLoading ? (
              <ActivityIndicator
                color={COLORS.primary}
                style={styles.loader}
              />
            ) : stats ? (
              <>
                <View style={styles.statRow}>
                  <StatBox
                    value={stats.upcoming}
                    label="Sắp tới"
                    color={COLORS.primary}
                  />

                  <StatBox
                    value={stats.done}
                    label="Đã sử dụng"
                    color={COLORS.green}
                  />

                  <StatBox
                    value={stats.cancelled}
                    label="Đã hủy"
                    color={COLORS.red}
                  />
                </View>

                <View style={styles.nextCard}>
                  <View style={styles.nextIcon}>
                    <Text style={styles.nextIconText}>
                      📅
                    </Text>
                  </View>

                  <View style={styles.nextContent}>
                    <Text style={styles.nextTitle}>
                      Lượt đặt gần nhất
                    </Text>

                    {stats.next ? (
                      <>
                        <Text style={styles.nextRoom}>
                          {stats.next.rooms?.name ??
                            'Phòng không xác định'}
                        </Text>

                        <Text style={styles.nextSub}>
                          📍{' '}
                          {stats.next.rooms?.location ??
                            'Chưa có vị trí'}
                        </Text>

                        <Text style={styles.nextSub}>
                          📅{' '}
                          {prettyDate(
                            stats.next.booking_date
                          )}{' '}
                          · {nextSlot?.label ?? 'Ca'} (
                          {nextSlot?.time ?? '---'})
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.nextSub}>
                        Bạn chưa có lượt đặt nào
                        sắp tới.
                      </Text>
                    )}
                  </View>
                </View>
              </>
            ) : null}
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInUp.delay(140).duration(400)}
        >
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              Thông tin cá nhân
            </Text>

            {!editing && (
              <Pressable
                onPress={startEdit}
                style={({ pressed }) => [
                  styles.editAction,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.link}>
                  ✏️ Sửa
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.card}>
            {editing ? (
              <>
                <EditField
                  label="Họ và tên *"
                  value={form.name}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      name: v,
                    })
                  }
                  maxLength={60}
                />

                <EditField
                  label="Số điện thoại"
                  value={form.phone}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      phone: v,
                    })
                  }
                  keyboardType="phone-pad"
                  maxLength={15}
                />

                <EditField
                  label={codeLabel(profile.role)}
                  value={form.code}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      code: v,
                    })
                  }
                  maxLength={20}
                />

                {profile.role === 'student' && (
                  <EditField
                    label="Lớp"
                    value={form.className}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        className: v,
                      })
                    }
                    maxLength={30}
                  />
                )}

                <EditField
                  label="Khoa / Bộ môn"
                  value={form.faculty}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      faculty: v,
                    })
                  }
                  maxLength={60}
                />

                <View style={styles.btnRow}>
                  <ActionButton
                    label="Hủy"
                    variant="ghost"
                    onPress={() =>
                      setEditing(false)
                    }
                    disabled={saving}
                  />

                  <ActionButton
                    label="Lưu thay đổi"
                    onPress={save}
                    disabled={saving}
                    loading={saving}
                  />
                </View>
              </>
            ) : (
              <>
                <InfoRow
                  label="Họ và tên"
                  value={profile.full_name}
                />

                <InfoRow
                  label="Email"
                  value={user.email}
                />

                <InfoRow
                  label="Số điện thoại"
                  value={profile.phone}
                />

                <InfoRow
                  label={codeLabel(profile.role)}
                  value={profile.student_code}
                />

                {profile.role === 'student' && (
                  <InfoRow
                    label="Lớp"
                    value={profile.class_name}
                  />
                )}

                <InfoRow
                  label="Khoa / Bộ môn"
                  value={profile.faculty}
                />

                <InfoRow
                  label="Vai trò"
                  value={ROLE_LABEL[profile.role]}
                />

                <InfoRow
                  label="Ngày tham gia"
                  value={formatJoined(
                    profile.created_at
                  )}
                />
              </>
            )}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
        >
          <Text style={styles.sectionTitle}>
            Bảo mật
          </Text>

          <View style={styles.card}>
            {pwOpen ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.editLabel}>
                    Mật khẩu mới
                  </Text>

                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={newPw}
                    onChangeText={setNewPw}
                    placeholder="Nhập mật khẩu mới"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.editLabel}>
                    Nhập lại mật khẩu mới
                  </Text>

                  <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={confirmPw}
                    onChangeText={setConfirmPw}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.btnRow}>
                  <ActionButton
                    label="Hủy"
                    variant="ghost"
                    onPress={() => {
                      setPwOpen(false);
                      setNewPw('');
                      setConfirmPw('');
                    }}
                    disabled={pwSaving}
                  />

                  <ActionButton
                    label="Đổi mật khẩu"
                    onPress={changePassword}
                    disabled={pwSaving}
                    loading={pwSaving}
                  />
                </View>
              </>
            ) : (
              <Pressable
                onPress={() => setPwOpen(true)}
                style={({ pressed }) => [
                  styles.securityButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.securityIcon}>
                  <Text>🔒</Text>
                </View>

                <View style={styles.securityContent}>
                  <Text style={styles.securityTitle}>
                    Đổi mật khẩu
                  </Text>

                  <Text style={styles.securitySub}>
                    Cập nhật mật khẩu tài khoản
                  </Text>
                </View>

                <Text style={styles.arrow}>›</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(260).duration(400)}
        >
          <Pressable
            style={({ pressed }) => [
              styles.logout,
              pressed && styles.logoutPressed,
            ]}
            onPress={logout}
          >
            <Text style={styles.logoutIcon}>
              ↪
            </Text>

            <Text style={styles.logoutText}>
              Đăng xuất
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  container: { flex: 1 },
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 14, paddingBottom: 32 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  headerCard: { backgroundColor: '#fff', borderRadius: 20, alignItems: 'center', padding: 22, ...shadow },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  avatarText: { color: '#fff', fontSize: 38, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', marginTop: 12, color: COLORS.text, textAlign: 'center' },
  roleTag: { marginTop: 8, backgroundColor: COLORS.primarySoft, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  roleText: { color: COLORS.primary, fontWeight: '700' },
  email: { color: COLORS.sub, marginTop: 8, fontSize: 14 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginTop: 18, marginBottom: 9 },
  editAction: { paddingHorizontal: 8, paddingVertical: 6, marginBottom: 5 },
  statRow: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 15, paddingVertical: 15, paddingHorizontal: 4, alignItems: 'center', ...shadow },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { color: COLORS.sub, marginTop: 3, fontSize: 11, textAlign: 'center' },
  loader: { marginVertical: 18 },
  nextCard: { flexDirection: 'row', backgroundColor: COLORS.primarySoft, borderRadius: 16, padding: 14, marginTop: 10 },
  nextIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  nextIconText: { fontSize: 20 },
  nextContent: { flex: 1 },
  nextTitle: { color: COLORS.primary, fontWeight: '800', marginBottom: 6 },
  nextRoom: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  nextSub: { color: COLORS.text, marginTop: 4, lineHeight: 19 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, ...shadow },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
  infoLabel: { color: COLORS.sub, flex: 1 },
  infoValue: { color: COLORS.text, fontWeight: '600', flex: 1.6, textAlign: 'right' },
  infoEmpty: { color: COLORS.gray, flex: 1.6, textAlign: 'right', fontStyle: 'italic' },
  field: { marginBottom: 13 },
  editLabel: { fontWeight: '700', color: COLORS.text, marginBottom: 7 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 11, padding: 12, backgroundColor: '#f9fafb', color: COLORS.text, fontSize: 15 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  actionButtonWrap: { flex: 1 },
  actionButton: { paddingVertical: 12, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  ghostBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db' },
  primaryBtn: { backgroundColor: COLORS.primary },
  disabledBtn: { opacity: 0.65 },
  ghostText: { color: COLORS.text, fontWeight: '700' },
  primaryText: { color: '#fff', fontWeight: '800' },
  link: { color: COLORS.primary, fontWeight: '800' },
  securityButton: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
  securityIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  securityContent: { flex: 1 },
  securityTitle: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  securitySub: { color: COLORS.sub, marginTop: 3, fontSize: 12 },
  arrow: { fontSize: 28, color: COLORS.gray, marginLeft: 8 },
  logout: { marginTop: 22, backgroundColor: COLORS.red, paddingVertical: 14, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  logoutPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  logoutIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
  logoutText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  pressed: { opacity: 0.7 },
});