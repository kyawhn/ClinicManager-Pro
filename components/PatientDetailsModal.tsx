import React, { useState, useMemo, Platform } from 'react';
import { View, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  Divider,
  FAB,
  Appbar 
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { Patient, Visit } from '@/types';
import { PatientForm } from './PatientForm';
import { VisitForm } from './VisitForm';
import { TouchableOpacity } from 'react-native';

interface PatientDetailsModalProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientDetailsModal({ patient, onClose }: PatientDetailsModalProps) {
  const { theme } = useTheme();
  const { visits } = useData();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddVisitForm, setShowAddVisitForm] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const patientVisits = useMemo(() => {
    return visits
      .filter(visit => visit.patientId === patient.id)
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }, [visits, patient.id]);

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const getTotalSpent = () => {
    return patientVisits.reduce((total, visit) => total + visit.fee, 0);
  };

  const getLastVisitDate = () => {
    if (patientVisits.length === 0) return 'No visits yet';
    return new Date(patientVisits[0].visitDate).toLocaleDateString();
  };

  const handleAddVisit = () => {
    setShowAddVisitForm(true);
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title="Patient Details" />
          <Appbar.Action 
            icon="pencil" 
            onPress={() => setShowEditForm(true)} 
          />
        </Appbar.Header>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Patient Information */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.patientHeader}>
                <View>
                  <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
                    {patient.name}
                  </Text>
                  <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                    {patient.age} years • {patient.sex}
                  </Text>
                </View>
                <View style={styles.statsContainer}>
                  <Chip icon="medical-bag" compact>
                    {patientVisits.length} visits
                  </Chip>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.infoText}>
                  {patient.phoneNumber}
                </Text>
              </View>

              {patient.location && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="location-on" size={20} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodyMedium" style={styles.infoText}>
                    {patient.location}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <MaterialIcons name="access-time" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.infoText}>
                  Last visit: {getLastVisitDate()}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="account-balance-wallet" size={20} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodyMedium" style={styles.infoText}>
                  Total spent: ${getTotalSpent().toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Medical Information */}
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Medical Information
              </Text>

              {patient.allergy && (
                <View style={styles.medicalSection}>
                  <Text variant="labelLarge" style={styles.medicalLabel}>
                    Allergies:
                  </Text>
                  <Text variant="bodyMedium" style={styles.medicalText}>
                    {patient.allergy}
                  </Text>
                </View>
              )}

              {patient.pastMedicalHistory && (
                <View style={styles.medicalSection}>
                  <Text variant="labelLarge" style={styles.medicalLabel}>
                    Past Medical History:
                  </Text>
                  <Text variant="bodyMedium" style={styles.medicalText}>
                    {patient.pastMedicalHistory}
                  </Text>
                </View>
              )}

              {!patient.allergy && !patient.pastMedicalHistory && (
                <Text style={styles.emptyText}>
                  No medical information recorded
                </Text>
              )}
            </Card.Content>
          </Card>

          {/* Visit History */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Visit History
                </Text>
                <Button 
                  mode="outlined" 
                  compact 
                  onPress={handleAddVisit}
                  icon="plus"
                >
                  Add Visit
                </Button>
              </View>

              {patientVisits.length > 0 ? (
                patientVisits.map((visit, index) => (
                  <Card key={visit.id} style={styles.visitCard}>
                    <Card.Content>
                      <View style={styles.visitHeader}>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                          Visit #{patientVisits.length - index}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                          ${visit.fee.toFixed(2)}
                        </Text>
                      </View>
                      
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                        {new Date(visit.visitDate).toLocaleDateString()} • {new Date(visit.visitDate).toLocaleTimeString()}
                      </Text>

                      <View style={styles.visitDetail}>
                        <Text variant="labelMedium" style={styles.visitLabel}>Complaints:</Text>
                        <Text variant="bodySmall">{visit.complaints}</Text>
                      </View>

                      {visit.diagnosis && (
                        <View style={styles.visitDetail}>
                          <Text variant="labelMedium" style={styles.visitLabel}>Diagnosis:</Text>
                          <Text variant="bodySmall">{visit.diagnosis}</Text>
                        </View>
                      )}

                      <View style={styles.visitDetail}>
                        <Text variant="labelMedium" style={styles.visitLabel}>Treatment:</Text>
                        <Text variant="bodySmall">{visit.treatment}</Text>
                      </View>

                      {visit.followUpDate && (
                        <View style={styles.visitDetail}>
                          <Text variant="labelMedium" style={styles.visitLabel}>Follow-up:</Text>
                          <Text variant="bodySmall">
                            {new Date(visit.followUpDate).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No visits recorded yet
                </Text>
              )}
            </Card.Content>
          </Card>
        </ScrollView>

        <FAB
          icon="medical-bag"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddVisit}
          label="Add Visit"
        />
      </SafeAreaView>

      {/* Edit Patient Modal */}
      <Modal visible={showEditForm} animationType="slide" presentationStyle="pageSheet">
        <PatientForm 
          patient={patient}
          onClose={() => setShowEditForm(false)}
          onSave={() => setShowEditForm(false)}
        />
      </Modal>

      {/* Add Visit Modal */}
      <Modal visible={showAddVisitForm} animationType="slide" presentationStyle="pageSheet">
        <VisitForm 
          patient={patient}
          onClose={() => setShowAddVisitForm(false)}
          onSave={() => setShowAddVisitForm(false)}
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  divider: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
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
  medicalSection: {
    marginBottom: 12,
  },
  medicalLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  medicalText: {
    lineHeight: 20,
  },
  visitCard: {
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  visitDetail: {
    marginBottom: 8,
  },
  visitLabel: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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