import React, { useState, Platform } from 'react';
import { View, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Appbar
} from 'react-native-paper';
import { useTheme } from '@/hooks/useTheme';
import { useClinic } from '@/hooks/useClinic';
import { Clinic } from '@/types';
import { TouchableOpacity } from 'react-native';

interface ClinicFormProps {
  clinic?: Clinic;
  onClose: () => void;
  onSave: () => void;
}

export function ClinicForm({ clinic, onClose, onSave }: ClinicFormProps) {
  const { theme } = useTheme();
  const { addClinic, updateClinic } = useClinic();
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    name: clinic?.name || '',
    address: clinic?.address || '',
    phoneNumber: clinic?.phoneNumber || '',
  });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showWebAlert('Validation Error', 'Clinic name is required');
      return;
    }

    setLoading(true);
    try {
      const clinicData = {
        name: formData.name,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        isActive: true,
      };

      if (clinic) {
        await updateClinic(clinic.id, clinicData);
        showWebAlert('Success', 'Clinic updated successfully', () => {
          onSave();
          onClose();
        });
      } else {
        await addClinic(clinicData);
        showWebAlert('Success', 'Clinic added successfully', () => {
          onSave();
          onClose();
        });
      }
    } catch (error) {
      showWebAlert('Error', 'Failed to save clinic information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title={clinic ? 'Edit Clinic' : 'Add New Clinic'} />
          <Appbar.Action icon="check" onPress={handleSave} disabled={loading} />
        </Appbar.Header>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Clinic Information
              </Text>

              <TextInput
                label="Clinic Name *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
                mode="outlined"
                placeholder="Enter clinic name"
              />

              <TextInput
                label="Address"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Enter clinic address"
              />

              <TextInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
                placeholder="Enter contact number"
              />
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={onClose}
              style={styles.button}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSave}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              {clinic ? 'Update Clinic' : 'Add Clinic'}
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>

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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  button: {
    flex: 1,
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