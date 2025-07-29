import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Searchbar, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { useClinic } from '@/hooks/useClinic';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Patient } from '@/types';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { appointments, patients, loading } = useData();
  const { activeClinic } = useClinic();
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const nextMonth = (currentMonth + 1) % 12;

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return [];
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      patient.clinicId === activeClinic?.id
    );
  }, [searchQuery, patients, activeClinic]);

  const appointmentCounts = useMemo(() => {
    const clinicAppointments = appointments.filter(apt => apt.clinicId === activeClinic?.id);
    
    return {
      today: clinicAppointments.filter(apt => apt.date === today).length,
      tomorrow: clinicAppointments.filter(apt => apt.date === tomorrow).length,
      thisMonth: clinicAppointments.filter(apt => {
        const appointmentDate = new Date(apt.date);
        return appointmentDate.getMonth() === currentMonth;
      }).length,
      nextMonth: clinicAppointments.filter(apt => {
        const appointmentDate = new Date(apt.date);
        return appointmentDate.getMonth() === nextMonth;
      }).length,
    };
  }, [appointments, activeClinic, today, tomorrow, currentMonth, nextMonth]);

  const todayAppointments = useMemo(() => {
    return appointments.filter(apt => 
      apt.date === today && 
      apt.clinicId === activeClinic?.id &&
      apt.status === 'scheduled'
    );
  }, [appointments, today, activeClinic]);

  const tomorrowAppointments = useMemo(() => {
    return appointments.filter(apt => 
      apt.date === tomorrow && 
      apt.clinicId === activeClinic?.id &&
      apt.status === 'scheduled'
    );
  }, [appointments, tomorrow, activeClinic]);

  const failedAppointments = useMemo(() => {
    return appointments.filter(apt => 
      apt.status === 'failed' && 
      apt.clinicId === activeClinic?.id
    );
  }, [appointments, activeClinic]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
            Dashboard
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {activeClinic?.name || 'No Clinic Selected'}
          </Text>
        </View>

        {/* Appointment Counters */}
        <View style={styles.countersContainer}>
          <View style={styles.counterRow}>
            <Card style={[styles.counterCard, { backgroundColor: theme.colors.primaryContainer }]}>
              <Card.Content style={styles.counterContent}>
                <MaterialIcons name="today" size={24} color={theme.colors.primary} />
                <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                  {appointmentCounts.today}
                </Text>
                <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                  Today
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.counterCard, { backgroundColor: theme.colors.secondaryContainer }]}>
              <Card.Content style={styles.counterContent}>
                <MaterialIcons name="event" size={24} color={theme.colors.secondary} />
                <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
                  {appointmentCounts.tomorrow}
                </Text>
                <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer }}>
                  Tomorrow
                </Text>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.counterRow}>
            <Card style={[styles.counterCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
              <Card.Content style={styles.counterContent}>
                <MaterialIcons name="calendar-month" size={24} color={theme.colors.tertiary} />
                <Text variant="headlineSmall" style={{ color: theme.colors.tertiary }}>
                  {appointmentCounts.thisMonth}
                </Text>
                <Text variant="labelMedium" style={{ color: theme.colors.onTertiaryContainer }}>
                  This Month
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.counterCard, { backgroundColor: theme.colors.errorContainer }]}>
              <Card.Content style={styles.counterContent}>
                <MaterialIcons name="trending-up" size={24} color={theme.colors.error} />
                <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
                  {appointmentCounts.nextMonth}
                </Text>
                <Text variant="labelMedium" style={{ color: theme.colors.onErrorContainer }}>
                  Next Month
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Patient Search */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search patient by name..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />
            
            {searchQuery.length > 0 && (
              <View style={styles.searchResults}>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <Card key={patient.id} style={styles.patientCard}>
                      <Card.Content>
                        <Text variant="titleMedium">{patient.name}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {patient.age} years • {patient.sex} • {patient.phoneNumber}
                        </Text>
                      </Card.Content>
                    </Card>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center', padding: 16, color: theme.colors.onSurfaceVariant }}>
                    No patients found
                  </Text>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Today's Appointments */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge">Today's Appointments</Text>
              <Chip icon="today" compact>
                {todayAppointments.length}
              </Chip>
            </View>
            
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <Text style={styles.emptyText}>No appointments for today</Text>
            )}
          </Card.Content>
        </Card>

        {/* Tomorrow's Appointments */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge">Tomorrow's Appointments</Text>
              <Chip icon="event" compact>
                {tomorrowAppointments.length}
              </Chip>
            </View>
            
            {tomorrowAppointments.length > 0 ? (
              tomorrowAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            ) : (
              <Text style={styles.emptyText}>No appointments for tomorrow</Text>
            )}
          </Card.Content>
        </Card>

        {/* Failed Appointments */}
        {failedAppointments.length > 0 && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.errorContainer }]}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={{ color: theme.colors.onErrorContainer }}>
                  Failed Appointments
                </Text>
                <Chip icon="warning" compact textStyle={{ color: theme.colors.error }}>
                  {failedAppointments.length}
                </Chip>
              </View>
              
              {failedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} showReschedule />
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  countersContainer: {
    marginBottom: 24,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  counterCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  counterContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  searchCard: {
    marginBottom: 24,
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
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
    padding: 16,
  },
});