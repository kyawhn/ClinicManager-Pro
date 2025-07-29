import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Card, 
  Searchbar, 
  Button, 
  FAB, 
  ActivityIndicator,
  Chip,
  IconButton 
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { useClinic } from '@/hooks/useClinic';
import { PatientForm } from '@/components/PatientForm';
import { PatientDetailsModal } from '@/components/PatientDetailsModal';
import { Patient } from '@/types';
import { TouchableOpacity } from 'react-native';

export default function PatientsScreen() {
  const { theme } = useTheme();
  const { patients, visits, loading } = useData();
  const { activeClinic } = useClinic();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  const clinicPatients = useMemo(() => {
    return patients.filter(patient => patient.clinicId === activeClinic?.id);
  }, [patients, activeClinic]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return clinicPatients;
    return clinicPatients.filter(patient =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phoneNumber.includes(searchQuery)
    );
  }, [searchQuery, clinicPatients]);

  const getPatientVisitCount = (patientId: string) => {
    return visits.filter(visit => visit.patientId === patientId).length;
  };

  const getLastVisitDate = (patientId: string) => {
    const patientVisits = visits.filter(visit => visit.patientId === patientId);
    if (patientVisits.length === 0) return null;
    
    const lastVisit = patientVisits.sort((a, b) => 
      new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
    )[0];
    
    return new Date(lastVisit.visitDate).toLocaleDateString();
  };

  const handlePatientPress = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>Loading patients...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Patients
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {clinicPatients.length} patients • {activeClinic?.name}
        </Text>
      </View>

      <Searchbar
        placeholder="Search patients by name or phone..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => {
            const visitCount = getPatientVisitCount(patient.id);
            const lastVisit = getLastVisitDate(patient.id);
            
            return (
              <Card 
                key={patient.id} 
                style={styles.patientCard}
                onPress={() => handlePatientPress(patient)}
              >
                <Card.Content>
                  <View style={styles.patientHeader}>
                    <View style={styles.patientInfo}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {patient.name}
                      </Text>
                      <View style={styles.patientMeta}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {patient.age} years • {patient.sex}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {patient.phoneNumber}
                        </Text>
                      </View>
                    </View>
                    
                    <IconButton
                      icon="chevron-right"
                      size={20}
                      onPress={() => handlePatientPress(patient)}
                    />
                  </View>
                  
                  <View style={styles.patientStats}>
                    <Chip icon="medical-bag" compact>
                      {visitCount} visits
                    </Chip>
                    {lastVisit && (
                      <Chip icon="calendar" compact>
                        Last: {lastVisit}
                      </Chip>
                    )}
                  </View>
                  
                  {patient.location && (
                    <View style={styles.locationRow}>
                      <MaterialIcons 
                        name="location-on" 
                        size={16} 
                        color={theme.colors.onSurfaceVariant} 
                      />
                      <Text 
                        variant="bodySmall" 
                        style={{ marginLeft: 4, color: theme.colors.onSurfaceVariant }}
                      >
                        {patient.location}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons 
              name="people-outline" 
              size={64} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}>
              {searchQuery ? 'No patients found' : 'No patients yet'}
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first patient to get started'}
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setShowAddForm(true)}
        label="Add Patient"
      />

      {/* Add Patient Modal */}
      <Modal visible={showAddForm} animationType="slide" presentationStyle="pageSheet">
        <PatientForm 
          onClose={() => setShowAddForm(false)}
          onSave={() => setShowAddForm(false)}
        />
      </Modal>

      {/* Patient Details Modal */}
      <Modal visible={showPatientDetails} animationType="slide" presentationStyle="pageSheet">
        {selectedPatient && (
          <PatientDetailsModal
            patient={selectedPatient}
            onClose={() => {
              setShowPatientDetails(false);
              setSelectedPatient(null);
            }}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchbar: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  patientCard: {
    marginBottom: 12,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientMeta: {
    marginTop: 4,
    gap: 2,
  },
  patientStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});