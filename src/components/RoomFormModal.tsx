// import { useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     KeyboardAvoidingView,
//     Modal,
//     Platform,
//     ScrollView,
//     StatusBar,
//     StyleSheet,
//     Text, TextInput,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { COLORS } from '../constants';
// import { supabase } from '../lib/supabase';
// import { Room } from '../types';

// interface Props {
//   room: Room | null; // null = thêm phòng mới
//   onClose: () => void;
//   onSaved: () => void;
// }

// export default function RoomFormModal({ room, onClose, onSaved }: Props) {
//   const [name, setName] = useState<string>(room?.name ?? '');
//   const [location, setLocation] = useState<string>(room?.location ?? '');
//   const [capacity, setCapacity] = useState<string>(room ? String(room.capacity) : '');
//   const [imageUrl, setImageUrl] = useState<string>(room?.image_url ?? '');
//   const [description, setDescription] = useState<string>(room?.description ?? '');
//   const [equipment, setEquipment] = useState<string>((room?.equipment ?? []).join(', '));
//   const [saving, setSaving] = useState<boolean>(false);

//   const headerTop = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 16;

//   const save = async () => {
//     const cap = parseInt(capacity, 10);
//     if (!name.trim() || !location.trim() || !Number.isFinite(cap) || cap <= 0) {
//       Alert.alert('Thiếu thông tin', 'Cần nhập tên phòng, vị trí và sức chứa (số > 0).');
//       return;
//     }
//     const payload = {
//       name: name.trim(),
//       location: location.trim(),
//       capacity: cap,
//       image_url: imageUrl.trim() || `https://picsum.photos/seed/${encodeURIComponent(name.trim())}/600/400`,
//       description: description.trim() || null,
//       equipment: equipment.split(',').map((s) => s.trim()).filter(Boolean),
//     };

//     setSaving(true);
//     const { error } = room
//       ? await supabase.from('rooms').update(payload).eq('id', room.id)
//       : await supabase.from('rooms').insert(payload);
//     setSaving(false);

//     if (error) {
//       Alert.alert('Lỗi', error.message);
//       return;
//     }
//     onSaved();
//     onClose();
//   };

//   const Field = ({
//     label, value, onChange, multiline, keyboardType,
//   }: {
//     label: string;
//     value: string;
//     onChange: (v: string) => void;
//     multiline?: boolean;
//     keyboardType?: 'default' | 'numeric';
//   }) => (
//     <View style={{ marginBottom: 14 }}>
//       <Text style={styles.label}>{label}</Text>
//       <TextInput
//         style={[styles.input, multiline && { height: 90, textAlignVertical: 'top' }]}
//         value={value}
//         onChangeText={onChange}
//         multiline={multiline}
//         keyboardType={keyboardType}
//         autoCapitalize="none"
//       />
//     </View>
//   );

//   return (
//     <Modal visible animationType="slide" presentationStyle="pageSheet" statusBarTranslucent onRequestClose={onClose}>
//       <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//         <View style={[styles.header, { paddingTop: headerTop }]}>
//           <TouchableOpacity onPress={onClose}>
//             <Text style={styles.cancel}>Hủy</Text>
//           </TouchableOpacity>
//           <Text style={styles.title}>{room ? 'Sửa phòng' : 'Thêm phòng'}</Text>
//           <TouchableOpacity onPress={save} disabled={saving}>
//             {saving ? <ActivityIndicator color={COLORS.primary} /> : <Text style={styles.save}>Lưu</Text>}
//           </TouchableOpacity>
//         </View>

//         <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
//           {Field({ label: 'Tên phòng *', value: name, onChange: setName })}
//           {Field({ label: 'Vị trí * (vd: Tòa A - Tầng 1)', value: location, onChange: setLocation })}
//           {Field({ label: 'Sức chứa *', value: capacity, onChange: setCapacity, keyboardType: 'numeric' })}
//           {Field({ label: 'Link ảnh (để trống sẽ dùng ảnh mẫu)', value: imageUrl, onChange: setImageUrl })}
//           {Field({ label: 'Mô tả', value: description, onChange: setDescription, multiline: true })}
//           {Field({ label: 'Thiết bị (cách nhau bằng dấu phẩy)', value: equipment, onChange: setEquipment })}
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   header: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#e5e7eb',
//   },
//   title: { fontSize: 17, fontWeight: '800', color: COLORS.text },
//   cancel: { color: COLORS.sub, fontSize: 16 },
//   save: { color: COLORS.primary, fontSize: 16, fontWeight: '800' },
//   label: { fontWeight: '700', color: COLORS.text, marginBottom: 6 },
//   input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, backgroundColor: '#f9fafb' },
// });
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, } from 'react-native';
import Animated, { FadeInDown, FadeInUp, } from 'react-native-reanimated';
import { COLORS } from '../constants';
import { supabase } from '../lib/supabase';
import { Room } from '../types';

interface Props {
  room: Room | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function RoomFormModal({
  room,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] =
    useState<string>(room?.name ?? '');

  const [location, setLocation] =
    useState<string>(room?.location ?? '');

  const [capacity, setCapacity] =
    useState<string>(
      room ? String(room.capacity) : ''
    );

  const [imageUrl, setImageUrl] =
    useState<string>(room?.image_url ?? '');

  const [description, setDescription] =
    useState<string>(
      room?.description ?? ''
    );

  const [equipment, setEquipment] =
    useState<string>(
      (room?.equipment ?? []).join(', ')
    );

  const [saving, setSaving] =
    useState<boolean>(false);

  const headerTop =
    Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 24) + 8
      : 16;

  const save = async () => {
    const cap = parseInt(capacity, 10);

    if (
      !name.trim() ||
      !location.trim() ||
      !Number.isFinite(cap) ||
      cap <= 0
    ) {
      Alert.alert(
        'Thiếu thông tin',
        'Cần nhập tên phòng, vị trí và sức chứa (số > 0).'
      );
      return;
    }

    const payload = {
      name: name.trim(),
      location: location.trim(),
      capacity: cap,
      image_url:
        imageUrl.trim() ||
        `https://picsum.photos/seed/${encodeURIComponent(
          name.trim()
        )}/600/400`,
      description:
        description.trim() || null,
      equipment: equipment
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setSaving(true);

    const { error } = room
      ? await supabase
          .from('rooms')
          .update(payload)
          .eq('id', room.id)
      : await supabase
          .from('rooms')
          .insert(payload);

    setSaving(false);

    if (error) {
      Alert.alert('Lỗi', error.message);
      return;
    }

    onSaved();
    onClose();
  };

  const Field = ({
    label,
    value,
    onChange,
    multiline,
    keyboardType,
    delay,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric';
    delay: number;
  }) => (
    <Animated.View
      entering={FadeInDown
        .delay(delay)
        .duration(280)}
      style={styles.field}
    >
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize="none"
        placeholderTextColor="#9ca3af"
      />
    </Animated.View>
  );

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.header,
            { paddingTop: headerTop },
          ]}
        >
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.cancel}>
              Hủy
            </Text>
          </Pressable>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>
              {room
                ? 'Sửa phòng'
                : 'Thêm phòng'}
            </Text>

            <Text style={styles.headerSubtitle}>
              {room
                ? 'Cập nhật thông tin phòng'
                : 'Tạo phòng học mới'}
            </Text>
          </View>

          <Pressable
            onPress={save}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              pressed &&
                !saving &&
                styles.savePressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator
                color="#fff"
                size="small"
              />
            ) : (
              <Text style={styles.save}>
                Lưu
              </Text>
            )}
          </Pressable>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeInUp.duration(350)}
            style={styles.introCard}
          >
            <View style={styles.introIcon}>
              <Text style={styles.introIconText}>
                🏫
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>
                Thông tin phòng
              </Text>

              <Text style={styles.introText}>
                Nhập thông tin chính xác để sinh viên
                dễ dàng tìm và đặt phòng.
              </Text>
            </View>
          </Animated.View>

          <View style={styles.formCard}>
            <Field
              label="Tên phòng *"
              value={name}
              onChange={setName}
              delay={80}
            />

            <Field
              label="Vị trí * (vd: Tòa A - Tầng 1)"
              value={location}
              onChange={setLocation}
              delay={120}
            />

            <Field
              label="Sức chứa *"
              value={capacity}
              onChange={setCapacity}
              keyboardType="numeric"
              delay={160}
            />

            <Field
              label="Link ảnh"
              value={imageUrl}
              onChange={setImageUrl}
              delay={200}
            />

            <Field
              label="Mô tả"
              value={description}
              onChange={setDescription}
              multiline
              delay={240}
            />

            <Field
              label="Thiết bị (cách nhau bằng dấu phẩy)"
              value={equipment}
              onChange={setEquipment}
              delay={280}
            />
          </View>

          <Animated.View
            entering={FadeInUp.delay(350).duration(350)}
            style={styles.bottomInfo}
          >
            <Text style={styles.bottomInfoText}>
              💡 Bạn có thể nhập nhiều thiết bị, ví dụ:
              Máy chiếu, Điều hòa, Wi-Fi
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingBottom: 13, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  headerButton: { minWidth: 58, minHeight: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitleBox: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', color: COLORS.text },
  headerSubtitle: { fontSize: 10, color: COLORS.sub, marginTop: 2 },
  cancel: { color: COLORS.sub, fontSize: 14, fontWeight: '700' },
  saveButton: { minWidth: 58, minHeight: 36, borderRadius: 11, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  savePressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
  save: { color: '#fff', fontSize: 13, fontWeight: '900' },
  pressed: { opacity: 0.6 },
  scrollContent: { padding: 16, paddingBottom: 35 },
  introCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 20, padding: 16, marginBottom: 15, shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  introIcon: { width: 52, height: 52, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  introIconText: { fontSize: 25 },
  introTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  introText: { color: '#dbeafe', fontSize: 11, lineHeight: 16, marginTop: 4 },
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  field: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 7 },
  input: { minHeight: 47, borderWidth: 1, borderColor: '#dbe0e7', borderRadius: 13, paddingHorizontal: 13, paddingVertical: 11, backgroundColor: '#f8fafc', color: COLORS.text, fontSize: 14 },
  multilineInput: { height: 95, textAlignVertical: 'top' },
  bottomInfo: { marginTop: 13, padding: 13, borderRadius: 14, backgroundColor: COLORS.primarySoft },
  bottomInfoText: { color: COLORS.primary, fontSize: 12, lineHeight: 18, fontWeight: '600' },
});