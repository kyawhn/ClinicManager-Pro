import React, { useState, Platform } from 'react';
import { View, StyleSheet, Alert, Modal } from 'react-native';
import { Card, Text, Button, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { Appointment } from '@/types';
import { TouchableOpacity } from 'react-native';

interface AppointmentCardProps {
  appointment: Appointment;
  showReschedule?: boolean;
}

export function AppointmentCard({ appointment, showReschedule = false }: AppointmentCardProps) {
  const { theme } = useTheme();
  const { updateAppointment } = useData();
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

  const handleReschedule = () => {
    showWebAlert(
      'Reschedule Appointment', 
      'Appointment reschedule feature will be implemented soon.',
      () => console.log('Reschedule confirmed')
    );
  };

  const handleAddVisit = () => {
    showWebAlert(
      'Add Visit', 
      'Visit recording feature will be implemented soon.',
      () => console.log('Add visit confirmed')
    );
  };

  const handleMarkCompleted = async () => {
    await updateAppointment(appointment.id, { status: 'completed' });
    showWebAlert('Success', 'Appointment marked as completed');
  };

  const getStatusColor = () => {
    switch (appointment.status) {
      case 'scheduled': return theme.colors.primary;
      case 'completed': return theme.colors.tertiary;
      case 'cancelled': return theme.colors.error;
      case 'failed': return theme.colors.error;
      default: return theme.colors.outline;
    }
  };

  return (
    <>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.patientInfo}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {appointment.patientName}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {appointment.phoneNumber}
              </Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: getStatusColor() + '20' }]}>
              <Text style={{ color: getStatusColor(), fontSize: 12, fontWeight: 'bold' }}>
                {appointment.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.timeInfo}>
            <MaterialIcons name="access-time" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}>
              {appointment.time} • {new Date(appointment.date).toLocaleDateString()}
            </Text>
          </View>

          {appointment.notes && (
            <Text variant="bodySmall" style={styles.notes}>
              {appointment.notes}
            </Text>
          )}

          <View style={styles.actions}>
            {appointment.status === 'scheduled' && (
              <>
                <Button 
                  mode="outlined" 
                  compact 
                  onPress={handleAddVisit}
                  icon="medical-bag"
                >
                  Add Visit
                </Button>
                <Button 
                  mode="contained" 
                  compact 
                  onPress={handleMarkCompleted}
                  icon="check"
                >
                  Complete
                </Button>
              </>
            )}
            
            {(showReschedule || appointment.status === 'failed') && (
              <Button 
                mode="outlined" 
                compact 
                onPress={handleReschedule}
                icon="calendar-edit"
                textColor={theme.colors.primary}
              >
                Reschedule
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

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
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  patientInfo: {
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notes: {
    fontStyle: 'italic',
    marginBottom: 12,
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
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