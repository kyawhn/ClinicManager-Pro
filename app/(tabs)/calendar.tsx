import React, { useState, useMemo, Platform } from 'react';
import { View, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Card, 
  FAB, 
  ActivityIndicator,
  Button,
  Chip,
  SegmentedButtons
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { useClinic } from '@/hooks/useClinic';
import { AppointmentForm } from '@/components/AppointmentForm';
import { AppointmentCard } from '@/components/AppointmentCard';
import { TouchableOpacity } from 'react-native';

export default function CalendarScreen() {
  const { theme } = useTheme();
  const { appointments, loading } = useData();
  const { activeClinic } = useClinic();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('calendar');
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

  const clinicAppointments = useMemo(() => {
    return appointments.filter(apt => apt.clinicId === activeClinic?.id);
  }, [appointments, activeClinic]);

  const selectedDateAppointments = useMemo(() => {
    return clinicAppointments.filter(apt => apt.date === selectedDate);
  }, [clinicAppointments, selectedDate]);

  const markedDates = useMemo(() => {
    const marked: { [key: string]: any } = {};
    
    clinicAppointments.forEach(appointment => {
      const date = appointment.date;
      if (!marked[date]) {
        marked[date] = { dots: [] };
      }
      
      const color = appointment.status === 'scheduled' ? theme.colors.primary :
                   appointment.status === 'completed' ? theme.colors.tertiary :
                   appointment.status === 'failed' ? theme.colors.error :
                   theme.colors.outline;
      
      marked[date].dots.push({ color });
    });

    // Mark selected date
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = theme.colors.primary;
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }

    return marked;
  }, [clinicAppointments, selectedDate, theme.colors]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return clinicAppointments
      .filter(apt => apt.date >= today && apt.status === 'scheduled')
      .sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      })
      .slice(0, 10);
  }, [clinicAppointments]);

  const getAppointmentStats = () => {
    const total = clinicAppointments.length;
    const completed = clinicAppointments.filter(apt => apt.status === 'completed').length;
    const failed = clinicAppointments.filter(apt => apt.status === 'failed').length;
    const scheduled = clinicAppointments.filter(apt => apt.status === 'scheduled').length;
    
    return { total, completed, failed, scheduled };
  };

  const stats = getAppointmentStats();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
            Calendar & Appointments
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {activeClinic?.name || 'No Clinic Selected'}
          </Text>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.toggleContainer}>
          <SegmentedButtons
            value={viewMode}
            onValueChange={setViewMode}
            buttons={[
              { value: 'calendar', label: 'Calendar', icon: 'calendar-month' },
              { value: 'list', label: 'List', icon: 'view-list' },
            ]}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {stats.scheduled}
              </Text>
              <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                Scheduled
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={{ color: theme.colors.tertiary }}>
                {stats.completed}
              </Text>
              <Text variant="labelMedium" style={{ color: theme.colors.onTertiaryContainer }}>
                Completed
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: theme.colors.errorContainer }]}>
            <Card.Content style={styles.statContent}>
              <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
                {stats.failed}
              </Text>
              <Text variant="labelMedium" style={{ color: theme.colors.onErrorContainer }}>
                Failed
              </Text>
            </Card.Content>
          </Card>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {viewMode === 'calendar' ? (
            <>
              {/* Calendar */}
              <Card style={styles.calendarCard}>
                <Card.Content>
                  <Calendar
                    current={selectedDate}
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                    markedDates={markedDates}
                    markingType="multi-dot"
                    theme={{
                      backgroundColor: theme.colors.surface,
                      calendarBackground: theme.colors.surface,
                      textSectionTitleColor: theme.colors.onSurface,
                      dayTextColor: theme.colors.onSurface,
                      todayTextColor: theme.colors.primary,
                      selectedDayTextColor: theme.colors.onPrimary,
                      monthTextColor: theme.colors.onSurface,
                      arrowColor: theme.colors.primary,
                      textDisabledColor: theme.colors.onSurfaceVariant,
                    }}
                  />
                </Card.Content>
              </Card>

              {/* Selected Date Appointments */}
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <Text variant="titleLarge">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                    <Chip icon="event" compact>
                      {selectedDateAppointments.length}
                    </Chip>
                  </View>

                  {selectedDateAppointments.length > 0 ? (
                    selectedDateAppointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      No appointments scheduled for this date
                    </Text>
                  )}
                </Card.Content>
              </Card>
            </>
          ) : (
            <>
              {/* Upcoming Appointments List */}
              <Card style={styles.card}>
                <Card.Content>
                  <Text variant="titleLarge" style={styles.sectionTitle}>
                    Upcoming Appointments
                  </Text>

                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => (
                      <AppointmentCard key={appointment.id} appointment={appointment} />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      No upcoming appointments
                    </Text>
                  )}
                </Card.Content>
              </Card>
            </>
          )}
        </ScrollView>

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddForm(true)}
          label="Add Appointment"
        />
      </SafeAreaView>

      {/* Add Appointment Modal */}
      <Modal visible={showAddForm} animationType="slide" presentationStyle="pageSheet">
        <AppointmentForm 
          initialDate={selectedDate}
          onClose={() => setShowAddForm(false)}
          onSave={() => setShowAddForm(false)}
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
  toggleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  calendarCard: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
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