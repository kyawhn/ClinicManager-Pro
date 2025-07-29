import React, { useState, Platform } from 'react';
import { View, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Appbar,
  Switch
} from 'react-native-paper';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { useClinic } from '@/hooks/useClinic';
import { Patient } from '@/types';
import { TouchableOpacity } from 'react-native';

interface VisitFormProps {
  patient: Patient;
  onClose: () => void;
  onSave: () => void;
}

export function VisitForm({ patient, onClose, onSave }: VisitFormProps) {
  const { theme } = useTheme();
  const { addVisit, addAppointment } = useData();
  const { activeClinic } = useClinic();
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    complaints: '',
    diagnosis: '',
    treatment: '',
    fee: '',
    hasFollowUp: false,
    followUpDate: '',
    followUpTime: '',
  });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const handleSave = async () => {
    if (!formData.complaints.trim()) {
      showWebAlert('Validation Error', 'Patient complaints are required');
      return;
    }

    if (!formData.treatment.trim()) {
      showWebAlert('Validation Error', 'Treatment information is required');
      return;
    }

    if (!formData.fee.trim() || isNaN(Number(formData.fee))) {
      showWebAlert('Validation Error', 'Please enter a valid fee amount');
      return;
    }

    if (formData.hasFollowUp && (!formData.followUpDate || !formData.followUpTime)) {
      showWebAlert('Validation Error', 'Please provide follow-up date and time');
      return;
    }

    if (!activeClinic) {
      showWebAlert('Error', 'No active clinic selected');
      return;
    }

    setLoading(true);
    try {
      const visitData = {
        patientId: patient.id,
        patientName: patient.name,
        complaints: formData.complaints,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        fee: Number(formData.fee),
        followUpDate: formData.hasFollowUp ? formData.followUpDate : undefined,
        visitDate: new Date().toISOString(),
        clinicId: activeClinic.id,
      };

      await addVisit(visitData);

      // Create follow-up appointment if specified
      if (formData.hasFollowUp && formData.followUpDate && formData.followUpTime) {
        await addAppointment({
          patientId: patient.id,
          patientName: patient.name,
          phoneNumber: patient.phoneNumber,
          date: formData.followUpDate,
          time: formData.followUpTime,
          status: 'scheduled',
          notes: 'Follow-up appointment',
          clinicId: activeClinic.id,
        });
      }

      showWebAlert('Success', 'Visit recorded successfully', () => {
        onSave();
        onClose();
      });
    } catch (error) {
      showWebAlert('Error', 'Failed to save visit information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title="Record Visit" />
          <Appbar.Action icon="check" onPress={handleSave} disabled={loading} />
        </Appbar.Header>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Patient: {patient.name}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
                {patient.age} years • {patient.sex} • {patient.phoneNumber}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Visit Details
              </Text>

              <TextInput
                label="Patient Complaints *"
                value={formData.complaints}
                onChangeText={(text) => setFormData({ ...formData, complaints: text })}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Describe patient's complaints and symptoms..."
              />

              <TextInput
                label="Diagnosis"
                value={formData.diagnosis}
                onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={2}
                placeholder="Medical diagnosis (optional)..."
              />

              <TextInput
                label="Treatment *"
                value={formData.treatment}
                onChangeText={(text) => setFormData({ ...formData, treatment: text })}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={4}
                placeholder="Treatment provided, medications prescribed, instructions..."
              />

              <TextInput
                label="Fee Amount *"
                value={formData.fee}
                onChangeText={(text) => setFormData({ ...formData, fee: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                placeholder="0.00"
                left={<TextInput.Affix text="$" />}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Follow-up Appointment
              </Text>

              <View style={styles.switchRow}>
                <Text variant="bodyMedium">Schedule follow-up appointment</Text>
                <Switch
                  value={formData.hasFollowUp}
                  onValueChange={(value) => setFormData({ ...formData, hasFollowUp: value })}
                />
              </View>

              {formData.hasFollowUp && (
                <>
                  <TextInput
                    label="Follow-up Date"
                    value={formData.followUpDate}
                    onChangeText={(text) => setFormData({ ...formData, followUpDate: text })}
                    style={styles.input}
                    mode="outlined"
                    placeholder="YYYY-MM-DD"
                  />

                  <TextInput
                    label="Follow-up Time"
                    value={formData.followUpTime}
                    onChangeText={(text) => setFormData({ ...formData, followUpTime: text })}
                    style={styles.input}
                    mode="outlined"
                    placeholder="HH:MM AM/PM"
                  />
                </>
              )}
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
              Record Visit
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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