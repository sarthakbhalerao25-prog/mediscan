import { PrescriptionScanResult, MedicationScheduleLog, MedicineReminder, IntakeRecord } from '../types/prescription';
import { SAMPLE_PRESCRIPTIONS } from '../data/samplePrescriptions';

const PRESCRIPTIONS_KEY = 'mediscan_prescriptions_list';
const ACTIVE_PRESCRIPTION_KEY = 'mediscan_active_prescription_id';
const DOSE_LOGS_KEY = 'mediscan_dose_logs';
const REMINDERS_KEY = 'mediscan_medicine_reminders';
const INTAKE_RECORDS_KEY = 'mediscan_intake_records';

// Initial default reminders seeded from active prescription or sample
export function getSavedReminders(): MedicineReminder[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) {
      // Seed default reminders based on Sample 1 medications
      const initialReminders: MedicineReminder[] = [
        {
          id: 'rem-augmentin-1',
          prescriptionId: 'rx-sample-01',
          medicineName: 'Augmentin 625mg',
          dosage: '1 Tablet (625mg)',
          timesPerDay: 2,
          mealTiming: 'after_meal',
          reminderTimes: ['08:30', '20:30'],
          instructions: 'Take with a full glass of water after meals',
          active: true,
          notes: 'Complete full 7-day course',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'rem-pantocid-2',
          prescriptionId: 'rx-sample-01',
          medicineName: 'Pantoprazole 40mg',
          dosage: '1 Capsule (40mg)',
          timesPerDay: 1,
          mealTiming: 'before_meal',
          reminderTimes: ['07:30'],
          instructions: 'Take 30 minutes before breakfast with plain water',
          active: true,
          notes: 'Acid protection during antibiotics',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'rem-ascoril-3',
          prescriptionId: 'rx-sample-01',
          medicineName: 'Ascoril-D Cough Syrup',
          dosage: '10 ml',
          timesPerDay: 3,
          mealTiming: 'before_and_after_meal',
          reminderTimes: ['08:00', '13:30', '21:00'],
          instructions: 'Rinse mouth after intake',
          active: true,
          notes: 'For cough relief',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(REMINDERS_KEY, JSON.stringify(initialReminders));
      return initialReminders;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse reminders:', e);
    return [];
  }
}

export function saveReminder(reminder: MedicineReminder): void {
  const current = getSavedReminders();
  const index = current.findIndex((r) => r.id === reminder.id);
  if (index >= 0) {
    current[index] = reminder;
  } else {
    current.unshift(reminder);
  }
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(current));
}

export function deleteReminder(reminderId: string): MedicineReminder[] {
  const current = getSavedReminders().filter((r) => r.id !== reminderId);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(current));
  return current;
}

// Intake Records tracking (Taken vs Not Taken)
export function getIntakeRecords(): IntakeRecord[] {
  try {
    const raw = localStorage.getItem(INTAKE_RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getIntakeRecord(reminderId: string, date: string, timeSlot: string): IntakeRecord | undefined {
  const records = getIntakeRecords();
  return records.find((r) => r.reminderId === reminderId && r.date === date && r.timeSlot === timeSlot);
}

export function setIntakeRecordStatus(
  reminderId: string,
  medicineName: string,
  date: string,
  timeSlot: string,
  mealTiming: any,
  taken: boolean
): IntakeRecord {
  const records = getIntakeRecords();
  const index = records.findIndex(
    (r) => r.reminderId === reminderId && r.date === date && r.timeSlot === timeSlot
  );

  const updatedRecord: IntakeRecord = {
    id: index >= 0 ? records[index].id : `intake-${reminderId}-${date}-${timeSlot.replace(':', '')}`,
    reminderId,
    medicineName,
    date,
    timeSlot,
    mealTiming,
    taken,
    takenAt: taken ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    records[index] = updatedRecord;
  } else {
    records.push(updatedRecord);
  }

  localStorage.setItem(INTAKE_RECORDS_KEY, JSON.stringify(records));
  return updatedRecord;
}

export function getSavedPrescriptions(): PrescriptionScanResult[] {
  try {
    const raw = localStorage.getItem(PRESCRIPTIONS_KEY);
    if (!raw) {
      // Seed with initial sample prescriptions
      const initial = SAMPLE_PRESCRIPTIONS.map((s) => ({
        ...s.data,
        imageThumbnail: s.imageUrl,
      }));
      localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved prescriptions:', e);
    return SAMPLE_PRESCRIPTIONS.map((s) => s.data);
  }
}

export function savePrescription(prescription: PrescriptionScanResult): void {
  const current = getSavedPrescriptions();
  const existsIndex = current.findIndex((p) => p.id === prescription.id);
  if (existsIndex >= 0) {
    current[existsIndex] = prescription;
  } else {
    current.unshift(prescription);
  }
  localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(current));
  localStorage.setItem(ACTIVE_PRESCRIPTION_KEY, prescription.id);
}

export function getActivePrescription(): PrescriptionScanResult | null {
  const list = getSavedPrescriptions();
  if (list.length === 0) return null;
  const activeId = localStorage.getItem(ACTIVE_PRESCRIPTION_KEY);
  if (activeId) {
    const found = list.find((p) => p.id === activeId);
    if (found) return found;
  }
  return list[0];
}

export function setActivePrescriptionId(id: string): void {
  localStorage.setItem(ACTIVE_PRESCRIPTION_KEY, id);
}

export function deletePrescription(id: string): PrescriptionScanResult[] {
  const current = getSavedPrescriptions().filter((p) => p.id !== id);
  localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(current));
  if (localStorage.getItem(ACTIVE_PRESCRIPTION_KEY) === id) {
    localStorage.setItem(ACTIVE_PRESCRIPTION_KEY, current[0]?.id || '');
  }
  return current;
}

// Dose Logs
export function getDoseLogs(dateKey?: string): MedicationScheduleLog[] {
  const targetDate = dateKey || new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(`${DOSE_LOGS_KEY}_${targetDate}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDoseLog(log: MedicationScheduleLog, dateKey?: string): void {
  const targetDate = dateKey || new Date().toISOString().split('T')[0];
  const current = getDoseLogs(targetDate);
  const index = current.findIndex((l) => l.id === log.id);
  if (index >= 0) {
    current[index] = log;
  } else {
    current.push(log);
  }
  localStorage.setItem(`${DOSE_LOGS_KEY}_${targetDate}`, JSON.stringify(current));
}
