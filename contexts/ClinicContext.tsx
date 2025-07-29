import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clinic } from '@/types';

interface ClinicContextType {
  clinics: Clinic[];
  activeClinic: Clinic | null;
  addClinic: (clinic: Omit<Clinic, 'id' | 'createdAt'>) => Promise<void>;
  updateClinic: (id: string, updates: Partial<Clinic>) => Promise<void>;
  setActiveClinic: (clinicId: string) => Promise<void>;
  loading: boolean;
}

export const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [activeClinic, setActiveClinicState] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      const clinicsData = await AsyncStorage.getItem('clinics');
      const activeClinicId = await AsyncStorage.getItem('activeClinicId');
      
      if (clinicsData) {
        const parsedClinics = JSON.parse(clinicsData);
        setClinics(parsedClinics);
        
        if (activeClinicId) {
          const active = parsedClinics.find((c: Clinic) => c.id === activeClinicId);
          setActiveClinicState(active || parsedClinics[0] || null);
        } else if (parsedClinics.length > 0) {
          setActiveClinicState(parsedClinics[0]);
        }
      } else {
        // Create default clinic if none exists
        const defaultClinic: Clinic = {
          id: Date.now().toString(),
          name: 'My Clinic',
          address: '',
          phoneNumber: '',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setClinics([defaultClinic]);
        setActiveClinicState(defaultClinic);
        await AsyncStorage.setItem('clinics', JSON.stringify([defaultClinic]));
        await AsyncStorage.setItem('activeClinicId', defaultClinic.id);
      }
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const addClinic = async (clinicData: Omit<Clinic, 'id' | 'createdAt'>) => {
    try {
      const newClinic: Clinic = {
        ...clinicData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      const updatedClinics = [...clinics, newClinic];
      setClinics(updatedClinics);
      await AsyncStorage.setItem('clinics', JSON.stringify(updatedClinics));
    } catch (error) {
      console.error('Error adding clinic:', error);
    }
  };

  const updateClinic = async (id: string, updates: Partial<Clinic>) => {
    try {
      const updatedClinics = clinics.map(clinic =>
        clinic.id === id ? { ...clinic, ...updates } : clinic
      );
      setClinics(updatedClinics);
      
      if (activeClinic?.id === id) {
        setActiveClinicState({ ...activeClinic, ...updates });
      }
      
      await AsyncStorage.setItem('clinics', JSON.stringify(updatedClinics));
    } catch (error) {
      console.error('Error updating clinic:', error);
    }
  };

  const setActiveClinic = async (clinicId: string) => {
    try {
      const clinic = clinics.find(c => c.id === clinicId);
      if (clinic) {
        setActiveClinicState(clinic);
        await AsyncStorage.setItem('activeClinicId', clinicId);
      }
    } catch (error) {
      console.error('Error setting active clinic:', error);
    }
  };

  const value = {
    clinics,
    activeClinic,
    addClinic,
    updateClinic,
    setActiveClinic,
    loading,
  };

  return (
    <ClinicContext.Provider value={value}>
      {children}
    </ClinicContext.Provider>
  );
}