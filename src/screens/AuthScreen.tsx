// import { useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     KeyboardAvoidingView, Platform,
//     StyleSheet,
//     Text, TextInput, TouchableOpacity,
//     View,
// } from 'react-native';
// import { COLORS } from '../constants';
// import { supabase } from '../lib/supabase';
// import { Role } from '../types';

// const ROLES: { key: Role; label: string }[] = [
//   { key: 'student', label: 'Sinh viên' },
//   { key: 'lecturer', label: 'Giảng viên' },
// ];

// export default function AuthScreen() {
//   const [isLogin, setIsLogin] = useState<boolean>(true);
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [fullName, setFullName] = useState<string>('');
//   const [role, setRole] = useState<Role>('student');
//   const [loading, setLoading] = useState<boolean>(false);

//   const submit = async () => {
//     if (!email || !password || (!isLogin && !fullName)) {
//       Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ.');
//       return;
//     }
//     setLoading(true);
//     if (isLogin) {
//       const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
//       if (error) Alert.alert('Đăng nhập thất bại', error.message);
//     } else {
//       const { data, error } = await supabase.auth.signUp({
//         email: email.trim(),
//         password,
//         options: { data: { full_name: fullName.trim(), role } },
//       });
//       if (error) {
//         Alert.alert('Đăng ký thất bại', error.message);
//       } else if (!data.session) {
//         Alert.alert('Kiểm tra email', 'Cần xác nhận email (hoặc tắt "Confirm email" trong Supabase).');
//       }
//     }
//     setLoading(false);
//   };

//   return (
//     <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//       <Text style={styles.title}>🏫 Đặt phòng học VKU</Text>
//       <Text style={styles.subtitle}>{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</Text>

//       {!isLogin && (
//         <>
//           <TextInput style={styles.input} placeholder="Họ và tên" value={fullName} onChangeText={setFullName} />
//           <View style={styles.roleRow}>
//             {ROLES.map((r) => (
//               <TouchableOpacity
//                 key={r.key}
//                 style={[styles.roleBtn, role === r.key && styles.roleActive]}
//                 onPress={() => setRole(r.key)}
//               >
//                 <Text style={[styles.roleText, role === r.key && { color: '#fff' }]}>{r.label}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </>
//       )}

//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         autoCapitalize="none"
//         keyboardType="email-address"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Mật khẩu (tối thiểu 6 ký tự)"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       <TouchableOpacity style={styles.primaryBtn} onPress={submit} disabled={loading}>
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={styles.primaryText}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
//         <Text style={styles.link}>{isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}</Text>
//       </TouchableOpacity>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.bg },
//   title: { fontSize: 26, fontWeight: '800', textAlign: 'center', color: COLORS.text },
//   subtitle: { textAlign: 'center', color: COLORS.sub, marginBottom: 20, marginTop: 4 },
//   input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
//   roleRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
//   roleBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center' },
//   roleActive: { backgroundColor: COLORS.primary },
//   roleText: { color: COLORS.primary, fontWeight: '600' },
//   primaryBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
//   primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
//   link: { color: COLORS.primary, textAlign: 'center', marginTop: 16 },
// });
// src/screens/AuthScreen.tsx

import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { COLORS } from '../constants';
import { supabase } from '../lib/supabase';
import { Role } from '../types';

const ROLES: { key: Role; label: string }[] = [
  { key: 'student', label: 'Sinh viên' },
  { key: 'lecturer', label: 'Giảng viên' },
];

function AnimatedButton({
  children,
  onPress,
  disabled,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={styles.primaryBtn}
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState<boolean>(false);

  const submit = async () => {
    if (!email || !password || (!isLogin && !fullName)) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ.');
      return;
    }

    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Đăng nhập thất bại', error.message);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
          },
        },
      });

      if (error) {
        Alert.alert('Đăng ký thất bại', error.message);
      } else if (!data.session) {
        Alert.alert(
          'Kiểm tra email',
          'Cần xác nhận email (hoặc tắt "Confirm email" trong Supabase).'
        );
      }
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.duration(550)}
          style={styles.logoBox}
        >
          <Text style={styles.logoText}>VKU</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.title}>Đặt phòng học VKU</Text>

          <Text style={styles.subtitle}>
            {isLogin
              ? 'Đăng nhập để tiếp tục'
              : 'Tạo tài khoản mới'}
          </Text>
        </Animated.View>

        <Animated.View
          key={isLogin ? 'login' : 'register'}
          entering={FadeInUp.duration(400)}
          style={styles.formCard}
        >
          {!isLogin && (
            <>
              <Text style={styles.label}>Họ và tên</Text>

              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                placeholderTextColor={COLORS.gray}
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.label}>Vai trò</Text>

              <View style={styles.roleRow}>
                {ROLES.map((r) => {
                  const active = role === r.key;

                  return (
                    <Pressable
                      key={r.key}
                      style={[
                        styles.roleBtn,
                        active && styles.roleActive,
                      ]}
                      onPress={() => setRole(r.key)}
                    >
                      <View
                        style={[
                          styles.radio,
                          active && styles.radioActive,
                        ]}
                      >
                        {active && <View style={styles.radioDot} />}
                      </View>

                      <Text
                        style={[
                          styles.roleText,
                          active && styles.roleTextActive,
                        ]}
                      >
                        {r.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.gray}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Mật khẩu</Text>

          <TextInput
            style={styles.input}
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            placeholderTextColor={COLORS.gray}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <AnimatedButton
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>
                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </Text>
            )}
          </AnimatedButton>

          <Pressable
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? 'Chưa có tài khoản? '
                : 'Đã có tài khoản? '}

              <Text style={styles.switchBold}>
                {isLogin ? 'Đăng ký' : 'Đăng nhập'}
              </Text>
            </Text>
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(250).duration(500)}
          style={styles.footer}
        >
          <Text style={styles.footerTitle}>
            VKU Room Booking
          </Text>

          <Text style={styles.footerText}>
            Phát triển ứng dụng đa nền tảng
          </Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, overflow: 'hidden' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 22 },
  circleTop: { position: 'absolute', width: 270, height: 270, borderRadius: 135, backgroundColor: COLORS.primarySoft, top: -120, right: -90, opacity: 0.8 },
  circleBottom: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: '#e0e7ff', bottom: -90, left: -80, opacity: 0.7 },
  logoBox: { width: 76, height: 76, borderRadius: 23, backgroundColor: COLORS.primary, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 8 },
  logoText: { color: '#fff', fontSize: 27, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 27, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
  subtitle: { color: COLORS.sub, textAlign: 'center', marginTop: 6, marginBottom: 20, fontSize: 14 },
  formCard: { backgroundColor: '#fff', borderRadius: 22, padding: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  label: { color: COLORS.text, fontSize: 13, fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb', color: COLORS.text, fontSize: 15 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  roleBtn: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb' },
  roleActive: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.gray, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  roleText: { color: COLORS.sub, fontSize: 13, fontWeight: '700' },
  roleTextActive: { color: COLORS.primary },
  primaryBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 13, alignItems: 'center', marginTop: 2, shadowColor: COLORS.primary, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  switchButton: { paddingVertical: 12, alignItems: 'center' },
  switchText: { color: COLORS.sub, fontSize: 14 },
  switchBold: { color: COLORS.primary, fontWeight: '800' },
  footer: { alignItems: 'center', marginTop: 18 },
  footerTitle: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  footerText: { color: COLORS.sub, fontSize: 11, marginTop: 3 },
});