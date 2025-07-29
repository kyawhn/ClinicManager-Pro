import React, { useState, Platform } from 'react';
import { View, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Card, 
  Switch, 
  Button, 
  List,
  Divider,
  ActivityIndicator,
  IconButton
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { useClinic } from '@/hooks/useClinic';
import { ClinicForm } from '@/components/ClinicForm';
import { TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { syncData } = useData();
  const { clinics, activeClinic, setActiveClinic } = useClinic();
  const [showAddClinic, setShowAddClinic] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncData();
      showWebAlert('Sync Successful', 'Your data has been synced to Google Drive successfully.');
    } catch (error) {
      showWebAlert('Sync Failed', 'Failed to sync data to Google Drive. Please check your connection and try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleClinicSwitch = async (clinicId: string) => {
    if (clinicId !== activeClinic?.id) {
      await setActiveClinic(clinicId);
      showWebAlert('Success', 'Active clinic switched successfully');
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
            Settings
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Manage your app preferences and data
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Theme Settings */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Appearance
              </Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons 
                    name={isDark ? "dark-mode" : "light-mode"} 
                    size={24} 
                    color={theme.colors.onSurface} 
                  />
                  <View style={styles.settingText}>
                    <Text variant="bodyLarge">Dark Theme</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Switch between light and dark themes
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                />
              </View>
            </Card.Content>
          </Card>

          {/* Clinic Management */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Clinic Management
                </Text>
                <Button 
                  mode="outlined" 
                  compact 
                  onPress={() => setShowAddClinic(true)}
                  icon="plus"
                >
                  Add Clinic
                </Button>
              </View>

              {clinics.map((clinic) => (
                <View key={clinic.id} style={styles.clinicItem}>
                  <View style={styles.clinicInfo}>
                    <View style={styles.clinicDetails}>
                      <Text variant="bodyLarge" style={{ fontWeight: clinic.id === activeClinic?.id ? 'bold' : 'normal' }}>
                        {clinic.name}
                      </Text>
                      {clinic.address && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {clinic.address}
                        </Text>
                      )}
                      {clinic.phoneNumber && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {clinic.phoneNumber}
                        </Text>
                      )}
                    </View>
                    {clinic.id === activeClinic?.id && (
                      <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]}>
                        <Text style={{ color: theme.colors.onPrimary, fontSize: 10, fontWeight: 'bold' }}>
                          ACTIVE
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {clinic.id !== activeClinic?.id && (
                    <Button 
                      mode="outlined" 
                      compact 
                      onPress={() => handleClinicSwitch(clinic.id)}
                    >
                      Switch
                    </Button>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Data Management */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Data Management
              </Text>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <MaterialIcons 
                    name="cloud-sync" 
                    size={24} 
                    color={theme.colors.onSurface} 
                  />
                  <View style={styles.settingText}>
                    <Text variant="bodyLarge">Google Drive Sync</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Backup and sync your data to Google Drive
                    </Text>
                  </View>
                </View>
                <Button 
                  mode="contained" 
                  onPress={handleSync}
                  loading={syncing}
                  disabled={syncing}
                  icon="cloud-upload"
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </View>

              <Divider style={styles.divider} />

              <List.Item
                title="Export Data"
                description="Export all your clinic data to a file"
                left={props => <List.Icon {...props} icon="download" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => showWebAlert('Export Data', 'Data export feature will be implemented soon.')}
              />

              <List.Item
                title="Import Data"
                description="Import data from a backup file"
                left={props => <List.Icon {...props} icon="upload" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => showWebAlert('Import Data', 'Data import feature will be implemented soon.')}
              />
            </Card.Content>
          </Card>

          {/* App Information */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                About
              </Text>

              <List.Item
                title="App Version"
                description="1.0.0"
                left={props => <List.Icon {...props} icon="information" />}
              />

              <List.Item
                title="Privacy Policy"
                description="Read our privacy policy"
                left={props => <List.Icon {...props} icon="shield-account" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => showWebAlert('Privacy Policy', 'Privacy policy will be available soon.')}
              />

              <List.Item
                title="Terms of Service"
                description="Read our terms of service"
                left={props => <List.Icon {...props} icon="file-document" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => showWebAlert('Terms of Service', 'Terms of service will be available soon.')}
              />

              <List.Item
                title="Contact Support"
                description="Get help and support"
                left={props => <List.Icon {...props} icon="help-circle" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => showWebAlert('Contact Support', 'Support contact information will be available soon.')}
              />
            </Card.Content>
          </Card>

          {/* Developer Information */}
          <View style={styles.footer}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Clinic Management System v1.0
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Developed for offline medical practice management
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Add Clinic Modal */}
      <Modal visible={showAddClinic} animationType="slide" presentationStyle="pageSheet">
        <ClinicForm 
          onClose={() => setShowAddClinic(false)}
          onSave={() => setShowAddClinic(false)}
        />
      </Modal>

      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                {alertConfig.title}
              </Text>
              <Text variant="bodyMedium" style={styles.modalMessage}>
                {alertConfig.message}
              </Text>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  clinicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  clinicInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clinicDetails: {
    flex: 1,
  },
  activeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  divider: {
    marginVertical: 12,
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 8,
    minWidth: 280,
    maxWidth: '90%',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    marginBottom: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
});