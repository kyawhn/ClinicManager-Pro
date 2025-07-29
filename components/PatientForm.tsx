import React, { useState, Platform } from 'react';
import { View, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  SegmentedButtons,
  Appbar 
} from 'react-native-paper';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { useClinic } from '@/hooks/useClinic';
import { Patient } from '@/types';
import { TouchableOpacity } from 'react-native';

interface PatientFormProps {
  patient?: Patient;
  onClose: () => void;
  onSave: () => void;
}

export function PatientForm({ patient, onClose, onSave }: PatientFormProps) {
  const { theme } = useTheme();
  const { addPatient, updatePatient } = useData();
  const { activeClinic } = useClinic();
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    name: patient?.name || '',
    age: patient?.age?.toString() || '',
    sex: patient?.sex || 'Male' as 'Male' | 'Female' | 'Other',
    phoneNumber: patient?.phoneNumber || '',
    location: patient?.location || '',
    allergy: patient?.allergy || '',
    pastMedicalHistory: patient?.pastMedicalHistory || '',
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
      showWebAlert('Validation Error', 'Patient name is required');
      return;
    }

    if (!formData.age.trim() || isNaN(Number(formData.age))) {
      showWebAlert('Validation Error', 'Please enter a valid age');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      showWebAlert('Validation Error', 'Phone number is required');
      return;
    }

    if (!activeClinic) {
      showWebAlert('Error', 'No active clinic selected');
      return;
    }

    setLoading(true);
    try {
      const patientData = {
        ...formData,
        age: Number(formData.age),
        clinicId: activeClinic.id,
      };

      if (patient) {
        await updatePatient(patient.id, patientData);
        showWebAlert('Success', 'Patient updated successfully', () => {
          onSave();
          onClose();
        });
      } else {
        await addPatient(patientData);
        showWebAlert('Success', 'Patient added successfully', () => {
          onSave();
          onClose();
        });
      }
    } catch (error) {
      showWebAlert('Error', 'Failed to save patient information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title={patient ? 'Edit Patient' : 'Add New Patient'} />
          <Appbar.Action icon="check" onPress={handleSave} disabled={loading} />
        </Appbar.Header>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Basic Information
              </Text>

              <TextInput
                label="Patient Name *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
                mode="outlined"
              />

              <View style={styles.row}>
                <TextInput
                  label="Age *"
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  style={[styles.input, styles.halfWidth]}
                  mode="outlined"
                  keyboardType="numeric"
                />

                <View style={[styles.halfWidth, { marginLeft: 8 }]}>
                  <Text variant="labelMedium" style={styles.label}>
                    Gender *
                  </Text>
                  <SegmentedButtons
                    value={formData.sex}
                    onValueChange={(value) => setFormData({ ...formData, sex: value as any })}
                    buttons={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    style={styles.segmentedButtons}
                  />
                </View>
              </View>

              <TextInput
                label="Phone Number *"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />

              <TextInput
                label="Location/Address"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={2}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Medical Information
              </Text>

              <TextInput
                label="Known Allergies"
                value={formData.allergy}
                onChangeText={(text) => setFormData({ ...formData, allergy: text })}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="List any known allergies..."
              />

              <TextInput
                label="Past Medical History"
                value={formData.pastMedicalHistory}
                onChangeText={(text) => setFormData({ ...formData, pastMedicalHistory: text })}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={4}
                placeholder="Previous medical conditions, surgeries, medications..."
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
              {patient ? 'Update Patient' : 'Add Patient'}
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
  segmentedButtons: {
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