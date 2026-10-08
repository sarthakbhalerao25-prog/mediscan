import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Check, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Pill, 
  Trash2, 
  Edit3, 
  Utensils, 
  AlertCircle, 
  Volume2, 
  ChevronRight, 
  CheckSquare, 
  Square,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { MedicineReminder, MealTiming, IntakeRecord, PrescriptionScanResult } from '../types/prescription';
import { 
  getSavedReminders, 
  saveReminder, 
  deleteReminder, 
  getIntakeRecords, 
  setIntakeRecordStatus 
} from '../utils/storage';
import { playReminderChime } from '../utils/audioReminder';

interface MedicineRemindersViewProps {
  prescription?: PrescriptionScanResult | null;
  onOpenScanner?: () => void;
  onTriggerAlarmPreview?: (medName: string, dose: string, instructions: string) => void;
}

export const MedicineRemindersView: React.FC<MedicineRemindersViewProps> = ({
  prescription,
  onOpenScanner,
  onTriggerAlarmPreview,
}) => {
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<MedicineReminder | null>(null);

  // Form State for Adding / Editing Reminders
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [timesPerDay, setTimesPerDay] = useState<number>(2);
  const [mealTiming, setMealTiming] = useState<MealTiming>('after_meal');
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:30', '20:30']);
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');

  // Success toast indicator when saving/updating intake
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Load reminders & records
  const refreshData = () => {
    setReminders(getSavedReminders());
    setIntakeRecords(getIntakeRecords());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2500);
  };

  // Adjust default reminder times when timesPerDay changes
  const handleTimesPerDayChange = (num: number) => {
    setTimesPerDay(num);
    if (num === 1) {
      setReminderTimes(['09:00']);
    } else if (num === 2) {
      setReminderTimes(['08:30', '20:30']);
    } else if (num === 3) {
      setReminderTimes(['08:00', '14:00', '20:30']);
    } else if (num === 4) {
      setReminderTimes(['08:00', '12:30', '17:00', '21:30']);
    }
  };

  const handleTimeSlotChange = (index: number, val: string) => {
    const updated = [...reminderTimes];
    updated[index] = val;
    setReminderTimes(updated);
  };

  const handleOpenAddModal = (presetMedName?: string, presetDosage?: string) => {
    setEditingReminder(null);
    setMedicineName(presetMedName || '');
    setDosage(presetDosage || '1 Tablet');
    setTimesPerDay(2);
    setMealTiming('after_meal');
    setReminderTimes(['08:30', '20:30']);
    setInstructions('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (rem: MedicineReminder) => {
    setEditingReminder(rem);
    setMedicineName(rem.medicineName);
    setDosage(rem.dosage);
    setTimesPerDay(rem.timesPerDay);
    setMealTiming(rem.mealTiming);
    setReminderTimes(rem.reminderTimes);
    setInstructions(rem.instructions || '');
    setNotes(rem.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveReminderForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) return;

    const newReminder: MedicineReminder = {
      id: editingReminder ? editingReminder.id : `rem-${Date.now()}`,
      prescriptionId: prescription?.id || 'manual',
      medicineName: medicineName.trim(),
      dosage: dosage.trim() || '1 Dose',
      timesPerDay,
      mealTiming,
      reminderTimes,
      instructions: instructions.trim(),
      notes: notes.trim(),
      active: true,
      createdAt: editingReminder ? editingReminder.createdAt : new Date().toISOString(),
    };

    saveReminder(newReminder);
    refreshData();
    setIsAddModalOpen(false);
    showToast(editingReminder ? `Updated reminder for ${newReminder.medicineName}` : `Added reminder for ${newReminder.medicineName}`);
  };

  const handleDeleteReminder = (id: string, name: string) => {
    if (confirm(`Remove reminder for "${name}"?`)) {
      deleteReminder(id);
      refreshData();
      showToast(`Removed reminder for ${name}`);
    }
  };

  // Toggle or Set Taken Status
  // "when clicked turns green and says taken, when unclicked or not clicked says not taken and saves it"
  const handleToggleTakenStatus = (
    reminder: MedicineReminder,
    timeSlot: string
  ) => {
    // Find current record
    const record = intakeRecords.find(
      (r) => r.reminderId === reminder.id && r.date === selectedDate && r.timeSlot === timeSlot
    );
    const currentlyTaken = record ? record.taken : false;
    const nextTaken = !currentlyTaken;

    setIntakeRecordStatus(
      reminder.id,
      reminder.medicineName,
      selectedDate,
      timeSlot,
      reminder.mealTiming,
      nextTaken
    );

    refreshData();

    if (nextTaken) {
      playReminderChime();
      showToast(`Marked ${reminder.medicineName} at ${timeSlot} as Taken! Intake recorded.`);
    } else {
      showToast(`Marked ${reminder.medicineName} at ${timeSlot} as Not Taken.`);
    }
  };

  const getMealTimingLabel = (timing: MealTiming) => {
    switch (timing) {
      case 'before_meal':
        return 'Before Meal';
      case 'after_meal':
        return 'After Meal';
      case 'before_and_after_meal':
        return 'Before & After Meal';
      default:
        return 'Anytime / No meal restriction';
    }
  };

  const getMealTimingBadge = (timing: MealTiming) => {
    switch (timing) {
      case 'before_meal':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Utensils className="w-3 h-3 text-amber-600" />
            <span>Before Meal</span>
          </span>
        );
      case 'after_meal':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <Utensils className="w-3 h-3 text-teal-600" />
            <span>After Meal</span>
          </span>
        );
      case 'before_and_after_meal':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Utensils className="w-3 h-3 text-indigo-600" />
            <span>Before &amp; After Meal</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <span>Anytime</span>
          </span>
        );
    }
  };

  // Calculate daily intake stats for the selected date
  const totalDosesForDay = reminders.reduce((acc, r) => acc + (r.active ? r.reminderTimes.length : 0), 0);
  const takenDosesForDay = reminders.reduce((acc, r) => {
    if (!r.active) return acc;
    const takenCount = r.reminderTimes.filter((timeSlot) => {
      const rec = intakeRecords.find(
        (rec) => rec.reminderId === r.id && rec.date === selectedDate && rec.timeSlot === timeSlot
      );
      return rec ? rec.taken : false;
    }).length;
    return acc + takenCount;
  }, 0);

  const adherencePercentage = totalDosesForDay > 0 ? Math.round((takenDosesForDay / totalDosesForDay) * 100) : 0;

  // Unconfigured medications from active prescription that don't have reminders yet
  const unconfiguredMeds = prescription?.medications.filter(
    (med) => !reminders.some((r) => r.medicineName.toLowerCase() === med.medicineName.toLowerCase())
  ) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
              Intake Tracker &amp; Schedule
            </span>
            <span className="text-xs text-slate-400">
              Daily Adherence Monitoring
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Medicine Reminders &amp; Adherence Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Set custom reminders (times per day &amp; meal timing) and track intake in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-500 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set New Reminder</span>
          </button>
        </div>
      </div>

      {/* Daily Adherence Metric Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div className="sm:col-span-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
              Intake Status for {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              {takenDosesForDay} of {totalDosesForDay} Doses Completed
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-3 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${adherencePercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Adherence Rate</span>
            <span className="text-2xl font-black text-emerald-600">{adherencePercentage}%</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Medicines</span>
            <span className="text-2xl font-black text-teal-700">{reminders.filter(r => r.active).length}</span>
          </div>
        </div>
      </div>

      {/* Quick Add from Current Prescription (if any medicines are unconfigured) */}
      {unconfiguredMeds.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Prescription Medicines Available to Schedule:
              </p>
              <p className="text-[11px] text-amber-700">
                Quickly add reminders for medications scanned in your current prescription.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {unconfiguredMeds.map((med) => (
              <button
                key={med.id}
                onClick={() => handleOpenAddModal(med.medicineName, med.dosage)}
                className="px-3 py-1.5 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-amber-700" />
                <span>Add {med.medicineName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Reminders & Intake Tracking Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <span>Medication Reminders &amp; Intake Actions</span>
          </h2>
          <span className="text-xs text-slate-400">
            Tap the button to toggle between Taken (Green) and Not Taken
          </span>
        </div>

        {reminders.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Reminders Configured Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Create your first reminder to specify frequency (how many times a day) and meal timing (before meal, after meal, or before &amp; after meal), and start tracking doses.
            </p>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs hover:bg-teal-700"
            >
              + Create First Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => {
              return (
                <div
                  key={reminder.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Top Bar of Medicine Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900">
                            {reminder.medicineName}
                          </h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {reminder.dosage}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                          {/* How many times a day */}
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>
                              {reminder.timesPerDay} {reminder.timesPerDay === 1 ? 'time' : 'times'} a day
                            </span>
                          </span>

                          {/* Meal Timing badge */}
                          {getMealTimingBadge(reminder.mealTiming)}

                          {reminder.instructions && (
                            <span className="text-xs text-slate-500 italic">
                              • {reminder.instructions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Edit, Delete, Alarm simulation */}
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          if (onTriggerAlarmPreview) {
                            onTriggerAlarmPreview(
                              reminder.medicineName,
                              reminder.dosage,
                              reminder.instructions || getMealTimingLabel(reminder.mealTiming)
                            );
                          } else {
                            playReminderChime();
                          }
                        }}
                        className="p-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center space-x-1 cursor-pointer"
                        title="Simulate reminder chime for this medicine"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px] font-semibold">Test Alarm</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(reminder)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit reminder schedule"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteReminder(reminder.id, reminder.medicineName)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dose Slots Grid with Taken / Not Taken Button */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Dose Slots for {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate} (Meal: {getMealTimingLabel(reminder.mealTiming)})
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {reminder.reminderTimes.map((timeSlot, idx) => {
                        const record = intakeRecords.find(
                          (r) =>
                            r.reminderId === reminder.id &&
                            r.date === selectedDate &&
                            r.timeSlot === timeSlot
                        );
                        const isTaken = record ? record.taken : false;

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                              isTaken
                                ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Clock className={`w-3.5 h-3.5 ${isTaken ? 'text-emerald-700' : 'text-slate-500'}`} />
                                <span className="font-mono text-xs font-bold text-slate-800">
                                  Dose #{idx + 1} • {timeSlot}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  isTaken
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isTaken ? 'Recorded' : 'Pending'}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500">
                              <span className="font-medium text-slate-700">Timing: </span>
                              {getMealTimingLabel(reminder.mealTiming)}
                              {record?.takenAt && (
                                <p className="text-[10px] text-emerald-700 mt-0.5">
                                  Logged at {new Date(record.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>

                            {/* USER SPECIFIED BUTTON:
                                "add a button in this feature which says taken when clicked and not taken when unclicked or not clicked and when the user taps the taken button it should turn green and save it to track the users medicine intake"
                            */}
                            <button
                              onClick={() => handleToggleTakenStatus(reminder, timeSlot)}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs ${
                                isTaken
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 ring-2 ring-emerald-400'
                                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900'
                              }`}
                            >
                              {isTaken ? (
                                <>
                                  <Check className="w-4 h-4 stroke-[3]" />
                                  <span>Taken</span>
                                </>
                              ) : (
                                <>
                                  <Square className="w-4 h-4 text-slate-500" />
                                  <span>Not Taken</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 px-6 py-5 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-teal-200" />
                <h3 className="text-lg font-bold">
                  {editingReminder ? 'Edit Medication Reminder' : 'Set New Medicine Reminder'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveReminderForm} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Medicine Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Augmentin 625mg, Paracetamol"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Dosage / Form
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Tablet, 10 ml, 1 Capsule"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              {/* How many times a day */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  How many times a day? *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => handleTimesPerDayChange(num)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        timesPerDay === num
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {num} {num === 1 ? 'Time' : 'Times'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Timing: before meal or after meal or before and after meal */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Meal Timing *
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Select whether the medicine should be taken before, after, or both:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMealTiming('before_meal')}
                    className={`p-2.5 rounded-xl text-xs font-bold border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      mealTiming === 'before_meal'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-extrabold">Before Meal</span>
                    <span className={`text-[10px] mt-1 ${mealTiming === 'before_meal' ? 'text-amber-100' : 'text-slate-500'}`}>
                      Take 30m prior
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMealTiming('after_meal')}
                    className={`p-2.5 rounded-xl text-xs font-bold border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      mealTiming === 'after_meal'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-extrabold">After Meal</span>
                    <span className={`text-[10px] mt-1 ${mealTiming === 'after_meal' ? 'text-teal-100' : 'text-slate-500'}`}>
                      Take after food
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMealTiming('before_and_after_meal')}
                    className={`p-2.5 rounded-xl text-xs font-bold border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      mealTiming === 'before_and_after_meal'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block font-extrabold">Before &amp; After Meal</span>
                    <span className={`text-[10px] mt-1 ${mealTiming === 'before_and_after_meal' ? 'text-indigo-100' : 'text-slate-500'}`}>
                      Pre &amp; post dosing
                    </span>
                  </button>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Dose Notification Times
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {reminderTimes.map((time, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500">#{idx + 1}</span>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeSlotChange(idx, e.target.value)}
                        className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none w-full cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions / Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Patient Instructions &amp; Warnings (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Drink full glass of water, do not crush tablet, avoid dairy"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 cursor-pointer"
                >
                  {editingReminder ? 'Update Reminder' : 'Save Reminder Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
