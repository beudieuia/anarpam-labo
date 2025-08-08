// Local storage service for managing data persistence
export interface StorageService {
  getItem<T>(key: string, defaultValue?: T): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

class LocalStorageService implements StorageService {
  private readonly PREFIX = 'anarpam_labo_';

  private getKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }

  getItem<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === 'undefined') {
      return defaultValue ?? null;
    }
    
    const item = window.localStorage.getItem(this.getKey(key));
    
    if (item === null) {
      return defaultValue ?? null;
    }
    
    try {
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Error parsing item from localStorage: ${key}`, e);
      return defaultValue ?? null;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      window.localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving item to localStorage: ${key}`, e);
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    window.localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Only clear keys with our prefix
    Object.keys(window.localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => window.localStorage.removeItem(key));
  }
}

// Export a singleton instance
export const storageService = new LocalStorageService();

// Data models based on the SQL schema
export interface Patient {
  id: string;
  patientCode: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  sexe: 'M' | 'F';
  telephone?: string;
  email?: string;
  adresse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sample {
  id: string;
  sampleCode: string;
  patientId: string;
  typePrelevement: string;
  datePrelevement: string;
  statut: 'RECEIVED' | 'IN_PROCESS' | 'ANALYZED' | 'VALIDATED' | 'REPORTED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: string;
  analysisCode: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface SampleAnalysis {
  id: string;
  sampleId: string;
  analysisId: string;
  result?: string;
  normalRange?: string;
  interpretation?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VALIDATED';
  technicianId?: string;
  validatorId?: string;
  completedAt?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'RECEPTIONIST' | 'VALIDATOR';
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  reportCode: string;
  patientId: string;
  sampleId: string;
  generatedBy: string;
  validatedBy?: string;
  status: 'DRAFT' | 'VALIDATED' | 'DELIVERED';
  generatedAt: string;
  validatedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}