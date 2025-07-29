import React, { useState, Platform } from 'react';
import { View, ScrollView, StyleSheet, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Appbar,
  SegmentedButtons
} from 'react-native-paper';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { useClinic } from '@/hooks/useClinic';
import { ExpenseRecord } from '@/types';
import { TouchableOpacity } from 'react-native';

interface ExpenseFormProps {
  expense?: ExpenseRecord;
  onClose: () => void;
  onSave: () => void;
}

export function ExpenseForm({ expense, onClose, onSave }: ExpenseFormProps) {
  const { theme } = useTheme();
  const { addExpense, updateExpense } = useData();
  const { activeClinic } = useClinic();
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const [formData, setFormData] = useState({
    amount: expense?.amount?.toString() || '',
    description: expense?.description || '',
    category: expense?.category || 'Medical Supplies',
    date: expense?.date || new Date().toISOString().split('T')[0],
  });

  const categories = [
    'Medical Supplies',
    'Equipment',
    'Utilities',
    'Rent',
    'Staff Salary',
    'Marketing',
    'Insurance',
    'Maintenance',
    'Other'
  ];

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const handleSave = async () => {
    if (!formData.amount.trim() || isNaN(Number(formData.amount))) {
      showWebAlert('Validation Error', 'Please enter a valid amount');
      return;
    }

    if (!formData.description.trim()) {
      showWebAlert('Validation Error', 'Please enter a description');
      return;
    }

    if (!formData.date.trim()) {
      showWebAlert('Validation Error', 'Please select a date');
      return;
    }

    if (!activeClinic) {
      showWebAlert('Error', 'No active clinic selected');
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date,
        clinicId: activeClinic.id,
      };

      if (expense) {
        await updateExpense(expense.id, expenseData);
        showWebAlert('Success', 'Expense updated successfully', () => {
          onSave();
          onClose();
        });
      } else {
        await addExpense(expenseData);
        showWebAlert('Success', 'Expense added successfully', () => {
          onSave();
          onClose();
        });
      }
    } catch (error) {
      showWebAlert('Error', 'Failed to save expense record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title={expense ? 'Edit Expense' : 'Add Expense'} />
          <Appbar.Action icon="check" onPress={handleSave} disabled={loading} />
        </Appbar.Header>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Expense Details
              </Text>

              <TextInput
                label="Amount *"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                placeholder="0.00"
                left={<TextInput.Affix text="$" />}
              />

              <TextInput
                label="Description *"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="What was this expense for?"
              />

              <View style={styles.categoryContainer}>
                <Text variant="labelMedium" style={styles.label}>
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  <View style={styles.categoryButtons}>
                    {categories.map((category) => (
                      <Button
                        key={category}
                        mode={formData.category === category ? 'contained' : 'outlined'}
                        compact
                        onPress={() => setFormData({ ...formData, category })}
                        style={styles.categoryButton}
                      >
                        {category}
                      </Button>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <TextInput
                label="Date *"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                style={styles.input}
                mode="outlined"
                placeholder="YYYY-MM-DD"
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
              {expense ? 'Update Expense' : 'Add Expense'}
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
  categoryContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    marginRight: 8,
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