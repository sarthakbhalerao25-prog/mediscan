export interface MedicationItem {
  id: string;
  medicineName: string;
  genericName?: string;
  dosage: string; // e.g. "500 mg", "10 ml"
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Inhaler' | 'Drops' | 'Ointment' | 'Injection' | 'Other';
  frequency: string; // e.g. "Twice daily (1-0-1)", "Once every 8 hours"
  timing: 'Before food' | 'After food' | 'With meals' | 'Empty stomach' | 'Bedtime' | 'As needed';
  duration: string; // e.g. "5 days", "14 days", "Ongoing"
  scheduledTimes: string[]; // e.g. ["08:00", "20:00"]
  purposeExplanation: string; // Layperson explanation: e.g. "Fights bacterial throat infection"
  patientInstructions: string; // Simple guidance: e.g. "Take with a full glass of water. Complete full 5-day course."
  warningsAndPrecautions: string[]; // e.g. ["Avoid alcohol", "May cause slight drowsiness"]
  possibleSideEffects: string[]; // e.g. ["Mild nausea", "Headache"]
  category?: string; // e.g. "Antibiotic", "Pain Relief", "Antacid"
}

export interface PrescriptionMetadata {
  doctorName?: string;
  specialtyOrClinic?: string;
  patientName?: string;
  patientAgeOrGender?: string;
  date?: string;
  diagnosisOrCondition?: string;
  generalDoctorAdvice?: string;
  clarityScore: number; // 0 - 100
  handwritingQuality: 'Clear' | 'Moderate' | 'Challenging' | 'Illegible in parts';
}

export interface SafetyAlert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  relatedMedication?: string;
}

export type MealTiming = 'before_meal' | 'after_meal' | 'before_and_after_meal' | 'no_food_relation';

export interface MedicineReminder {
  id: string;
  prescriptionId?: string;
  medicineName: string;
  dosage: string;
  timesPerDay: number; // e.g. 1, 2, 3, 4
  mealTiming: MealTiming; // 'before_meal' | 'after_meal' | 'before_and_after_meal'
  reminderTimes: string[]; // e.g. ["08:00", "13:00", "20:00"]
  instructions?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  notes?: string;
  createdAt: string;
}

export interface IntakeRecord {
  id: string;
  reminderId: string;
  medicineName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "08:00"
  mealTiming: MealTiming;
  taken: boolean; // true = taken, false = not taken
  takenAt?: string; // ISO timestamp when marked taken
  updatedAt: string;
}

export interface PrescriptionScanResult {
  id: string;
  scannedAt: string;
  imageThumbnail?: string;
  rawOcrText: string;
  metadata: PrescriptionMetadata;
  medications: MedicationItem[];
  simplifiedSummary: string;
  safetyAlerts: SafetyAlert[];
  questionsForPharmacist?: string[];
}

export interface MedicationScheduleLog {
  id: string;
  prescriptionId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  timeSlot: string; // e.g. "08:00"
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime';
  status: 'pending' | 'taken' | 'skipped' | 'snoozed';
  takenAt?: string;
  notes?: string;
}

export interface SamplePrescriptionPreset {
  id: string;
  title: string;
  type: 'Handwritten' | 'Printed Clinic Slip' | 'Pediatric Rx' | 'Chronic Care Rx';
  description: string;
  imageUrl: string;
  previewData: PrescriptionScanResult;
}
