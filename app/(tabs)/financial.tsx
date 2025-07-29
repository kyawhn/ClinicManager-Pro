import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Card, 
  FAB, 
  ActivityIndicator,
  Button,
  Chip,
  SegmentedButtons,
  IconButton
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/hooks/useData';
import { useClinic } from '@/hooks/useClinic';
import { ExpenseForm } from '@/components/ExpenseForm';
import { TouchableOpacity } from 'react-native';

export default function FinancialScreen() {
  const { theme } = useTheme();
  const { incomeRecords, expenseRecords, loading } = useData();
  const { activeClinic } = useClinic();
  const [viewMode, setViewMode] = useState('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const clinicIncomeRecords = useMemo(() => {
    return incomeRecords.filter(record => record.clinicId === activeClinic?.id);
  }, [incomeRecords, activeClinic]);

  const clinicExpenseRecords = useMemo(() => {
    return expenseRecords.filter(record => record.clinicId === activeClinic?.id);
  }, [expenseRecords, activeClinic]);

  const monthlyData = useMemo(() => {
    const currentMonthIncome = clinicIncomeRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    });

    const currentMonthExpenses = clinicExpenseRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
    });

    const totalIncome = currentMonthIncome.reduce((sum, record) => sum + record.amount, 0);
    const totalExpenses = currentMonthExpenses.reduce((sum, record) => sum + record.amount, 0);
    const profit = totalIncome - totalExpenses;

    return {
      income: currentMonthIncome,
      expenses: currentMonthExpenses,
      totalIncome,
      totalExpenses,
      profit,
    };
  }, [clinicIncomeRecords, clinicExpenseRecords, selectedMonth, selectedYear]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 16 }}>Loading financial data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
            Financial Management
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {activeClinic?.name || 'No Clinic Selected'}
          </Text>
        </View>

        {/* Month Navigation */}
        <Card style={styles.monthCard}>
          <Card.Content>
            <View style={styles.monthNavigation}>
              <IconButton
                icon="chevron-left"
                onPress={handlePreviousMonth}
              />
              <Text variant="titleLarge" style={{ flex: 1, textAlign: 'center' }}>
                {monthNames[selectedMonth]} {selectedYear}
              </Text>
              <IconButton
                icon="chevron-right"
                onPress={handleNextMonth}
              />
            </View>
          </Card.Content>
        </Card>

        {/* View Mode Toggle */}
        <View style={styles.toggleContainer}>
          <SegmentedButtons
            value={viewMode}
            onValueChange={setViewMode}
            buttons={[
              { value: 'overview', label: 'Overview', icon: 'chart-pie' },
              { value: 'income', label: 'Income', icon: 'trending-up' },
              { value: 'expenses', label: 'Expenses', icon: 'trending-down' },
            ]}
          />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {viewMode === 'overview' && (
            <>
              {/* Financial Summary */}
              <View style={styles.summaryContainer}>
                <Card style={[styles.summaryCard, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Card.Content style={styles.summaryContent}>
                    <MaterialIcons name="trending-up" size={32} color={theme.colors.primary} />
                    <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                      ${monthlyData.totalIncome.toFixed(2)}
                    </Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                      Total Income
                    </Text>
                  </Card.Content>
                </Card>

                <Card style={[styles.summaryCard, { backgroundColor: theme.colors.errorContainer }]}>
                  <Card.Content style={styles.summaryContent}>
                    <MaterialIcons name="trending-down" size={32} color={theme.colors.error} />
                    <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
                      ${monthlyData.totalExpenses.toFixed(2)}
                    </Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.onErrorContainer }}>
                      Total Expenses
                    </Text>
                  </Card.Content>
                </Card>

                <Card style={[
                  styles.summaryCard, 
                  { backgroundColor: monthlyData.profit >= 0 ? theme.colors.tertiaryContainer : theme.colors.errorContainer }
                ]}>
                  <Card.Content style={styles.summaryContent}>
                    <MaterialIcons 
                      name={monthlyData.profit >= 0 ? "account-balance-wallet" : "warning"} 
                      size={32} 
                      color={monthlyData.profit >= 0 ? theme.colors.tertiary : theme.colors.error} 
                    />
                    <Text variant="headlineSmall" style={{ 
                      color: monthlyData.profit >= 0 ? theme.colors.tertiary : theme.colors.error 
                    }}>
                      ${Math.abs(monthlyData.profit).toFixed(2)}
                    </Text>
                    <Text variant="labelMedium" style={{ 
                      color: monthlyData.profit >= 0 ? theme.colors.onTertiaryContainer : theme.colors.onErrorContainer 
                    }}>
                      {monthlyData.profit >= 0 ? 'Net Profit' : 'Net Loss'}
                    </Text>
                  </Card.Content>
                </Card>
              </View>

              {/* Recent Transactions */}
              <Card style={styles.card}>
                <Card.Content>
                  <Text variant="titleLarge" style={styles.sectionTitle}>
                    Recent Transactions
                  </Text>

                  {[...monthlyData.income.slice(0, 3), ...monthlyData.expenses.slice(0, 3)]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <View key={record.id} style={styles.transactionItem}>
                        <View style={styles.transactionIcon}>
                          <MaterialIcons 
                            name={'visitId' in record ? 'medical-bag' : 'receipt'} 
                            size={20} 
                            color={'visitId' in record ? theme.colors.primary : theme.colors.error} 
                          />
                        </View>
                        <View style={styles.transactionDetails}>
                          <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                            {record.description}
                          </Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            {new Date(record.date).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text 
                          variant="titleMedium" 
                          style={{ 
                            color: 'visitId' in record ? theme.colors.primary : theme.colors.error,
                            fontWeight: 'bold'
                          }}
                        >
                          {'visitId' in record ? '+' : '-'}${record.amount.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                </Card.Content>
              </Card>
            </>
          )}

          {viewMode === 'income' && (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <Text variant="titleLarge">Income Records</Text>
                  <Chip icon="trending-up" compact>
                    ${monthlyData.totalIncome.toFixed(2)}
                  </Chip>
                </View>

                {monthlyData.income.length > 0 ? (
                  monthlyData.income.map((record) => (
                    <View key={record.id} style={styles.recordItem}>
                      <View style={styles.recordDetails}>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                          {record.patientName}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {record.description} • {new Date(record.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                        +${record.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No income records for this month</Text>
                )}
              </Card.Content>
            </Card>
          )}

          {viewMode === 'expenses' && (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <Text variant="titleLarge">Expense Records</Text>
                  <Chip icon="trending-down" compact>
                    ${monthlyData.totalExpenses.toFixed(2)}
                  </Chip>
                </View>

                {monthlyData.expenses.length > 0 ? (
                  monthlyData.expenses.map((record) => (
                    <View key={record.id} style={styles.recordItem}>
                      <View style={styles.recordDetails}>
                        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                          {record.description}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {record.category} • {new Date(record.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text variant="titleMedium" style={{ color: theme.colors.error, fontWeight: 'bold' }}>
                        -${record.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No expense records for this month</Text>
                )}
              </Card.Content>
            </Card>
          )}
        </ScrollView>

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddExpense(true)}
          label="Add Expense"
        />
      </SafeAreaView>

      {/* Add Expense Modal */}
      <Modal visible={showAddExpense} animationType="slide" presentationStyle="pageSheet">
        <ExpenseForm 
          onClose={() => setShowAddExpense(false)}
          onSave={() => setShowAddExpense(false)}
        />
      </Modal>
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
  monthCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    marginBottom: 12,
  },
  summaryContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  card: {
    marginBottom: 16,
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
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  recordDetails: {
    flex: 1,
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
});