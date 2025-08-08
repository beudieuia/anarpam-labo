// Data model interfaces for the laboratory management system

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

// Helper function to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Helper function to generate sequential codes with prefixes
export function generateCode(prefix: string, currentCount: number): string {
  const paddedCount = String(currentCount).padStart(6, '0');
  return `${prefix}${paddedCount}`;
}

// Helper function to get current date in ISO format
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}