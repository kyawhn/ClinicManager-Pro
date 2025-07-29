import React, { useState, useMemo, Platform } from 'react';
import { View, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Appbar,
  SegmentedButtons,
  Searchbar
} from 'react-native-paper';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { useClinic } from '@/hooks/useClinic';
import { Appointment, Patient } from '@/types';
import { TouchableOpacity } from 'react-native';

interface AppointmentFormProps {
  appointment?: Appointment;
  initialDate?: string;
  onClose: () => void;
  onSave: () => void;
}

export function AppointmentForm({ appointment, initialDate, onClose, onSave }: AppointmentFormProps) {
  const { theme } = useTheme();
  const { addAppointment, updateAppointment, patients } = useData();
  const { activeClinic } = useClinic();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    appointment ? patients.find(p => p.id === appointment.patientId) || null : null
  );
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    date: appointment?.date || initialDate || new Date().toISOString().split('T')[0],
    time: appointment?.time || '09:00 AM',
    status: appointment?.status || 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'failed',
    notes: appointment?.notes || '',
  });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const clinicPatients = useMemo(() => {
    return patients.filter(patient => patient.clinicId === activeClinic?.id);
  }, [patients, activeClinic]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return [];
    return clinicPatients.filter(patient =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phoneNumber.includes(searchQuery)
    );
  }, [searchQuery, clinicPatients]);

  const handleSave = async () => {
    if (!selectedPatient) {
      showWebAlert('Validation Error', 'Please select a patient');
      return;
    }

    if (!formData.date.trim()) {
      showWebAlert('Validation Error', 'Please select an appointment date');
      return;
    }

    if (!formData.time.trim()) {
      showWebAlert('Validation Error', 'Please select an appointment time');
      return;
    }

    if (!activeClinic) {
      showWebAlert('Error', 'No active clinic selected');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        phoneNumber: selectedPatient.phoneNumber,
        date: formData.date,
        time: formData.time,
        status: formData.status,
        notes: formData.notes,
        clinicId: activeClinic.id,
      };

      if (appointment) {
        await updateAppointment(appointment.id, appointmentData);
        showWebAlert('Success', 'Appointment updated successfully', () => {
          onSave();
          onClose();
        });
      } else {
        await addAppointment(appointmentData);
        showWebAlert('Success', 'Appointment scheduled successfully', () => {
          onSave();
          onClose();
        });
      }
    } catch (error) {
      showWebAlert('Error', 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title={appointment ? 'Edit Appointment' : 'New Appointment'} />
          <Appbar.Action icon="check" onPress={handleSave} disabled={loading} />
        </Appbar.Header>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Patient Selection */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Select Patient
              </Text>

              {selectedPatient ? (
                <Card style={styles.selectedPatientCard}>
                  <Card.Content>
                    <View style={styles.patientHeader}>
                      <View>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                          {selectedPatient.name}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                          {selectedPatient.age} years • {selectedPatient.sex}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                          {selectedPatient.phoneNumber}
                        </Text>
                      </View>
                      <Button 
                        mode="outlined" 
                        compact 
                        onPress={() => setSelectedPatient(null)}
                      >
                        Change
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              ) : (
                <>
                  <Searchbar
                    placeholder="Search patients by name or phone..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                  />

                  {searchQuery.length > 0 && (
                    <View style={styles.searchResults}>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <Card 
                            key={patient.id} 
                            style={styles.patientCard}
                            onPress={() => {
                              setSelectedPatient(patient);
                              setSearchQuery('');
                            }}
                          >
                            <Card.Content>
                              <Text variant="titleMedium">{patient.name}</Text>
                              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                                {patient.age} years • {patient.sex} • {patient.phoneNumber}
                              </Text>
                            </Card.Content>
                          </Card>
                        ))
                      ) : (
                        <Text style={styles.emptyText}>No patients found</Text>
                      )}
                    </View>
                  )}
                </>
              )}
            </Card.Content>
          </Card>

          {/* Appointment Details */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Appointment Details
              </Text>

              <TextInput
                label="Date *"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                style={styles.input}
                mode="outlined"
                placeholder="YYYY-MM-DD"
              />

              <TextInput
                label="Time *"
                value={formData.time}
                onChangeText={(text) => setFormData({ ...formData, time: text })}
                style={styles.input}
                mode="outlined"
                placeholder="HH:MM AM/PM"
              />

              <View style={styles.statusContainer}>
                <Text variant="labelMedium" style={styles.label}>
                  Status
                </Text>
                <SegmentedButtons
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  buttons={[
                    { value: 'scheduled', label: 'Scheduled' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                    { value: 'failed', label: 'Failed' },
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>

              <TextInput
                label="Notes"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Additional notes or comments..."
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
              {appointment ? 'Update' : 'Schedule'} Appointment
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
  selectedPatientCard: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  searchbar: {
    marginBottom: 16,
  },
  searchResults: {
    gap: 8,
  },
  patientCard: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 16,
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
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    padding: 16,
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