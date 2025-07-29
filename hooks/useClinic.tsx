import { useContext } from 'react';
import { ClinicContext } from '@/contexts/ClinicContext';

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within ClinicProvider');
  }
  return context;
}