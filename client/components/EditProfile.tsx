import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/src/i18n/context/LanguageContext";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/store";
import { Ionicons } from "@expo/vector-icons";
import { userAPI } from "@/src/services/api";
import { signOut } from "@/src/store/authSlice";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { Lock, Mail, Shield, AlertCircle } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";

interface EditProfileProps {
  onClose: () => void;
}

export default function EditProfile({ onClose }: EditProfileProps) {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    birth_date: user?.birth_date || "",
  });
  const [date, setDate] = useState(
    profile.birth_date ? new Date(profile.birth_date) : new Date()
  );
  const [showPicker, setShowPicker] = useState(false);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
      setProfile({
        ...profile,
        birth_date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const handleSave = async () => {
    try {
      await userAPI.updateProfile(profile);
      Alert.alert(t("common.success"), t("profile.save_success"), [
        { text: t("common.done"), onPress: onClose },
      ]);
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("profile.save_failed")
      );
    }
  };

  const handleRequestPasswordChange = async () => {
    try {
      setIsRequestingCode(true);
      const response = await userAPI.requestPasswordChange();
      if (response.success) {
        setCodeRequested(true);
        Alert.alert(
          t("common.success"),
          `Verification code sent to ${user?.email}. Check the console/logs for the code.`,
          [{ text: t("common.ok") }]
        );
        if (response.verificationCode) {
          console.log(
            `🔐 Verification Code: ${response.verificationCode}`
          );
        }
      } else {
        throw new Error(response.error || "Failed to send verification code");
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || "Failed to request password change"
      );
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleChangePassword = async () => {
    if (!verificationCode.trim()) {
      Alert.alert(t("common.error"), "Please enter the verification code");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        t("common.error"),
        "Password must be at least 6 characters long"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), "Passwords do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await userAPI.changePassword(
        verificationCode,
        newPassword
      );
      if (response.success) {
        Alert.alert(
          t("common.success"),
          "Password changed successfully. Please sign in again.",
          [
            {
              text: t("common.ok"),
              onPress: () => {
                dispatch(signOut() as any);
              },
            },
          ]
        );
      } else {
        throw new Error(response.error || "Failed to change password");
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || "Failed to change password"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmWord = t("profile.deleteConfirmWord");
    if (deleteConfirmText !== confirmWord) {
      Alert.alert(
        t("common.error"),
        t("profile.deleteConfirmError", { confirmWord })
      );
      return;
    }

    try {
      const response = await userAPI.deleteAccount();
      if (response.success) {
        Alert.alert(t("common.success"), t("profile.accountDeleted"), [
          {
            text: t("common.ok"),
            onPress: () => {
              dispatch(signOut() as any);
            },
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("profile.deleteAccountError")
      );
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        isRTL && styles.containerRTL,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, isRTL && styles.titleRTL, { color: colors.text }]}>
          {t("profile.edit_profile")}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveButton, { color: colors.primary }]}>{t("common.save")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.labelRTL, { color: colors.text }]}>
              {t("profile.name")}
            </Text>
            <TextInput
              style={[
                styles.input,
                isRTL && styles.inputRTL,
                { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border },
              ]}
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
              placeholder={t("profile.enterName")}
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.labelRTL, { color: colors.text }]}>
              {t("auth.email")}
            </Text>
            <TextInput
              style={[
                styles.input,
                isRTL && styles.inputRTL,
                { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border },
              ]}
              value={profile.email}
              onChangeText={(text) => setProfile({ ...profile, email: text })}
              placeholder={t("profile.enterEmail")}
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.labelRTL, { color: colors.text }]}>
              {t("auth.birth_date")}
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                { justifyContent: "center", backgroundColor: colors.surfaceVariant, borderColor: colors.border },
              ]}
              onPress={() => setShowPicker(true)}
            >
              <Text style={{ color: colors.text }}>
                {date.toISOString().split("T")[0]}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>

        <View style={[styles.passwordSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.passwordHeader}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
          >
            <View style={styles.passwordHeaderLeft}>
              <Lock size={20} color={colors.primary} />
              <Text style={[styles.passwordTitle, { color: colors.text }]}>
                {t("profile.changePassword") || "Change Password"}
              </Text>
            </View>
            <Ionicons
              name={showPasswordSection ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {showPasswordSection && (
            <View style={styles.passwordContent}>
              {!codeRequested ? (
                <View>
                  <View style={[styles.infoBox, { backgroundColor: colors.primaryContainer }]}>
                    <AlertCircle
                      size={20}
                      color={colors.onPrimaryContainer}
                    />
                    <Text
                      style={[
                        styles.infoText,
                        { color: colors.onPrimaryContainer },
                      ]}
                    >
                      {t("profile.passwordChangeInfo") ||
                        "We'll send a verification code to your email to confirm the password change."}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.requestCodeButton, { backgroundColor: colors.primary }]}
                    onPress={handleRequestPasswordChange}
                    disabled={isRequestingCode}
                  >
                    {isRequestingCode ? (
                      <ActivityIndicator size="small" color={colors.onPrimary} />
                    ) : (
                      <>
                        <Mail size={20} color={colors.onPrimary} />
                        <Text style={[styles.requestCodeText, { color: colors.onPrimary }]}>
                          {t("profile.sendVerificationCode") ||
                            "Send Verification Code"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={[styles.infoBox, { backgroundColor: colors.primaryContainer }]}>
                    <Shield size={20} color={colors.onPrimaryContainer} />
                    <Text
                      style={[
                        styles.infoText,
                        { color: colors.onPrimaryContainer },
                      ]}
                    >
                      {t("profile.codeVerificationInfo") ||
                        "Enter the 6-digit code sent to your email and your new password below."}
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text
                      style={[
                        styles.label,
                        isRTL && styles.labelRTL,
                        { color: colors.text },
                      ]}
                    >
                      {t("profile.verificationCode") || "Verification Code"}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        isRTL && styles.inputRTL,
                        { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border },
                      ]}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      placeholder="000000"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text
                      style={[
                        styles.label,
                        isRTL && styles.labelRTL,
                        { color: colors.text },
                      ]}
                    >
                      {t("profile.newPassword") || "New Password"}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        isRTL && styles.inputRTL,
                        { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border },
                      ]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder={t("profile.enterNewPassword") || "Enter new password"}
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text
                      style={[
                        styles.label,
                        isRTL && styles.labelRTL,
                        { color: colors.text },
                      ]}
                    >
                      {t("profile.confirmPassword") || "Confirm Password"}
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        isRTL && styles.inputRTL,
                        { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border },
                      ]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder={t("profile.confirmNewPassword") || "Confirm new password"}
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.passwordActions}>
                    <TouchableOpacity
                      style={[styles.cancelCodeButton, { backgroundColor: colors.surfaceVariant }]}
                      onPress={() => {
                        setCodeRequested(false);
                        setVerificationCode("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      <Text style={[styles.cancelCodeText, { color: colors.text }]}>
                        {t("common.cancel")}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.changePasswordButton, { backgroundColor: colors.primary }]}
                      onPress={handleChangePassword}
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <ActivityIndicator size="small" color={colors.onPrimary} />
                      ) : (
                        <Text style={[styles.changePasswordText, { color: colors.onPrimary }]}>
                          {t("profile.changePassword") || "Change Password"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={[styles.dangerZone, { backgroundColor: colors.error + "20", borderColor: colors.error + "40" }]}>
          <Text style={[styles.dangerTitle, isRTL && styles.labelRTL, { color: colors.error }]}>
            {t("profile.dangerZone")}
          </Text>

          {!showDeleteConfirm ? (
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Ionicons name="warning" size={20} color="white" />
              <Text style={styles.deleteButtonText}>
                {t("profile.deleteAccount")}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.deleteConfirmSection}>
              <Text style={[styles.deleteWarning, isRTL && styles.labelRTL, { color: colors.error }]}>
                {t("profile.deleteConfirmMessage")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isRTL && styles.inputRTL,
                  { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                ]}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder={t("profile.deleteConfirmWord")}
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
              />
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: colors.surfaceVariant }]}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                    {t("common.cancel")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmDeleteButton, { backgroundColor: colors.error }]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.confirmDeleteButtonText}>
                    {t("profile.confirmDelete")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerRTL: {
    direction: "rtl",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerRTL: {
    flexDirection: "row-reverse",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  titleRTL: {
    textAlign: "right",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  formSection: {
    padding: 16,
    borderRadius: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  labelRTL: {
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    ...Platform.select({
      web: {
        width: "100%",
      },
    }),
  },
  inputRTL: {
    textAlign: "right",
  },
  passwordSection: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  passwordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  passwordHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  passwordTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  passwordContent: {
    padding: 16,
    paddingTop: 0,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  requestCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  requestCodeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  passwordActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelCodeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelCodeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  changePasswordButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  changePasswordText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dangerZone: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteConfirmSection: {
    gap: 12,
  },
  deleteWarning: {
    fontSize: 14,
    fontWeight: "500",
  },
  deleteActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmDeleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
