import { PrescriptionScanResult } from '../types/prescription';

// SVG Data URLs for ultra-realistic prescription mockups
const sampleSvg1 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <rect width="800" height="1000" fill="#fcfbf7" stroke="#e2e0d8" stroke-width="2"/>
  <!-- Clinic Header -->
  <rect x="0" y="0" width="800" height="130" fill="#0f766e"/>
  <text x="40" y="48" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">METRO CENTRAL CLINIC &amp; RESEARCH CENTER</text>
  <text x="40" y="78" font-family="Arial, sans-serif" font-size="14" fill="#ccfbf1">Dr. Arthur Vance, M.D., F.A.C.P. | Internal Medicine</text>
  <text x="40" y="102" font-family="Arial, sans-serif" font-size="12" fill="#99f6e4">Reg. No: MED-884210 | Phone: +1 (555) 019-2834 | 1422 Medical Park Blvd</text>
  
  <!-- Patient line -->
  <rect x="30" y="150" width="740" height="70" fill="#f1f5f9" rx="6"/>
  <text x="50" y="180" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#334155">Patient: Mrs. Sarah Jenkins (Age: 46 / Female)</text>
  <text x="500" y="180" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Date: Oct 04, 2026</text>
  <text x="50" y="206" font-family="Arial, sans-serif" font-size="13" fill="#475569">Diagnosis: Acute Bacterial Bronchitis &amp; Productive Cough | BP: 124/82 mmHg</text>
  
  <!-- Rx Symbol -->
  <text x="50" y="270" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#0f766e">℞</text>
  <line x1="50" y1="285" x2="750" y2="285" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Handwritten style items -->
  <g font-family="'Brush Script MT', 'Caveat', cursive, sans-serif" fill="#1e293b">
    <text x="70" y="340" font-size="26">1. Tab. Augmentin (Amoxicillin + Clavulanate) 625mg</text>
    <text x="100" y="375" font-size="22" fill="#334155">   Sig: 1 tab BID pc (Twice daily after meals) x 7 days</text>
    
    <text x="70" y="440" font-size="26">2. Tab. Levocetirizine 5mg</text>
    <text x="100" y="475" font-size="22" fill="#334155">   Sig: 1 tab hs (Once daily at bedtime) x 5 days</text>

    <text x="70" y="540" font-size="26">3. Syr. Ascoril-D (Dextromethorphan + CPM) 100ml</text>
    <text x="100" y="575" font-size="22" fill="#334155">   Sig: 10ml TID pc (Three times daily after food) x 5 days</text>

    <text x="70" y="640" font-size="26">4. Cap. Pantoprazole (Pantocid) 40mg</text>
    <text x="100" y="675" font-size="22" fill="#334155">   Sig: 1 cap OD ac (Once daily before breakfast) x 7 days</text>
  </g>

  <!-- Doctor's Advice & Watermark -->
  <rect x="40" y="730" width="720" height="90" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
  <text x="60" y="760" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f766e">Doctor's Clinical Advice:</text>
  <text x="60" y="785" font-family="Arial, sans-serif" font-size="13" fill="#334155">- Drink warm fluids frequently. Avoid cold food and dusty environment.</text>
  <text x="60" y="805" font-family="Arial, sans-serif" font-size="13" fill="#334155">- Complete entire antibiotic course even if symptoms resolve earlier.</text>

  <!-- Signature -->
  <path d="M 540 890 Q 580 840, 620 890 T 700 870" fill="none" stroke="#1e3a8a" stroke-width="2.5"/>
  <text x="560" y="930" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#334155">Dr. Arthur Vance, M.D.</text>
  <text x="560" y="950" font-family="Arial, sans-serif" font-size="11" fill="#64748b">License No: 49102-CA</text>
</svg>
`)}`;

const sampleSvg2 = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <rect width="800" height="1000" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <!-- Header -->
  <rect x="0" y="0" width="800" height="120" fill="#1e40af"/>
  <text x="40" y="45" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#ffffff">ST. JUDE CARDIOLOGY &amp; DIABETIC CARE</text>
  <text x="40" y="72" font-family="Arial, sans-serif" font-size="14" fill="#bfdbfe">Dr. Elena Rostova, MD (Cardiology) | Fellow, ACC</text>
  <text x="40" y="95" font-family="Arial, sans-serif" font-size="12" fill="#93c5fd">Tel: (800) 412-9901 | Suite 400, Horizon Health Tower</text>

  <!-- Patient info -->
  <rect x="30" y="140" width="740" height="65" fill="#f8fafc" stroke="#e2e8f0" rx="4"/>
  <text x="45" y="170" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1e293b">Patient: Robert Martinez | Age: 58 | Gender: M</text>
  <text x="520" y="170" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Date: Oct 05, 2026</text>
  <text x="45" y="192" font-family="Arial, sans-serif" font-size="12" fill="#475569">Clinical Indication: Essential Hypertension &amp; Type 2 Diabetes Management</text>

  <text x="45" y="250" font-family="Georgia, serif" font-size="40" font-weight="bold" fill="#1e40af">℞</text>
  <line x1="45" y1="265" x2="755" y2="265" stroke="#94a3b8" stroke-width="1.5"/>

  <!-- Medications -->
  <g font-family="'Courier New', monospace" fill="#0f172a" font-weight="bold">
    <text x="60" y="320" font-size="18">1. Tab Telmisartan 40mg + Hydrochlorothiazide 12.5mg (Telma-H)</text>
    <text x="90" y="348" font-size="15" fill="#334155" font-weight="normal">   Dispense: 30 tablets | Sig: 1 tab PO qAM (Every morning with breakfast)</text>

    <text x="60" y="415" font-size="18">2. Tab Metformin HCl 500mg (Extended Release)</text>
    <text x="90" y="443" font-size="15" fill="#334155" font-weight="normal">   Dispense: 60 tablets | Sig: 1 tab PO BID with meals (Morning &amp; Night)</text>

    <text x="60" y="510" font-size="18">3. Tab Atorvastatin Calcium 20mg</text>
    <text x="90" y="538" font-size="15" fill="#334155" font-weight="normal">   Dispense: 30 tablets | Sig: 1 tab PO qHS (At bedtime)</text>
  </g>

  <!-- Lifestyle & Warning -->
  <rect x="40" y="620" width="720" height="110" fill="#eff6ff" stroke="#bfdbfe" rx="6"/>
  <text x="60" y="650" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1e40af">Special Instructions &amp; Monitoring:</text>
  <text x="60" y="675" font-family="Arial, sans-serif" font-size="13" fill="#1e3a8a">- Monitor blood pressure daily at 8:00 AM before taking medication.</text>
  <text x="60" y="695" font-family="Arial, sans-serif" font-size="13" fill="#1e3a8a">- Maintain low sodium diet (&lt;2g/day) and avoid grapefruit juice with Atorvastatin.</text>
  <text x="60" y="715" font-family="Arial, sans-serif" font-size="13" fill="#1e3a8a">- Follow up for serum creatinine and electrolytes in 4 weeks.</text>

  <!-- Doctor signature -->
  <path d="M 520 860 C 560 830, 600 900, 680 850" fill="none" stroke="#0f172a" stroke-width="2.5"/>
  <text x="540" y="900" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1e293b">Dr. Elena Rostova, MD</text>
  <text x="540" y="920" font-family="Arial, sans-serif" font-size="11" fill="#64748b">Board Certified Cardiologist</text>
</svg>
`)}`;

export const SAMPLE_PRESCRIPTIONS: Array<{
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  imageUrl: string;
  data: PrescriptionScanResult;
}> = [
  {
    id: 'sample-rx-1',
    title: 'Acute Bronchitis & Cough (General Practice)',
    category: 'Handwritten Doctor Rx',
    badge: 'Dual Antibiotic + Broncho',
    description: '4 common medications with medical shorthand: BID, TID, ac, pc, hs.',
    imageUrl: sampleSvg1,
    data: {
      id: 'rx-sample-01',
      scannedAt: new Date().toISOString(),
      rawOcrText: `METRO CENTRAL CLINIC & RESEARCH CENTER
Dr. Arthur Vance, M.D., F.A.C.P. | Internal Medicine
Reg. No: MED-884210 | Phone: +1 (555) 019-2834
Patient: Mrs. Sarah Jenkins (Age: 46 / Female)
Date: Oct 04, 2026
Diagnosis: Acute Bacterial Bronchitis & Productive Cough | BP: 124/82 mmHg
Rx:
1. Tab. Augmentin (Amoxicillin + Clavulanate) 625mg - 1 tab BID pc x 7 days
2. Tab. Levocetirizine 5mg - 1 tab hs x 5 days
3. Syr. Ascoril-D (Dextromethorphan + CPM) 100ml - 10ml TID pc x 5 days
4. Cap. Pantoprazole 40mg - 1 cap OD ac x 7 days
Advice:
- Drink warm fluids frequently. Avoid cold food and dusty environment.
- Complete entire antibiotic course even if symptoms resolve earlier.
Signed: Dr. Arthur Vance, M.D.`,
      metadata: {
        doctorName: 'Dr. Arthur Vance, M.D.',
        specialtyOrClinic: 'Metro Central Clinic & Research Center (Internal Medicine)',
        patientName: 'Mrs. Sarah Jenkins',
        patientAgeOrGender: '46 / Female',
        date: 'Oct 04, 2026',
        diagnosisOrCondition: 'Acute Bacterial Bronchitis & Productive Cough',
        generalDoctorAdvice: 'Hydrate well with warm fluids. Complete the full antibiotic course without skipping.',
        clarityScore: 92,
        handwritingQuality: 'Clear',
      },
      simplifiedSummary: 'You have been prescribed 4 medicines to treat a bacterial chest infection (bronchitis), soothe coughing and airway irritation, and protect your stomach during the antibiotic course. Follow the meal schedule carefully.',
      medications: [
        {
          id: 'med-1',
          medicineName: 'Augmentin 625mg',
          genericName: 'Amoxicillin + Clavulanic Acid',
          dosage: '625 mg',
          form: 'Tablet',
          frequency: 'Twice daily (1-0-1)',
          timing: 'After food',
          duration: '7 days',
          scheduledTimes: ['08:00', '20:00'],
          category: 'Antibiotic',
          purposeExplanation: 'Broad-spectrum antibiotic that kills bacteria causing your chest and throat infection.',
          patientInstructions: 'Swallow whole with plenty of water right after breakfast and dinner. Take until all 7 days are complete even if you feel 100% better.',
          warningsAndPrecautions: [
            'Finish the full 7-day course to prevent bacterial resistance.',
            'Report any sudden allergic rashes or severe watery diarrhea immediately.',
          ],
          possibleSideEffects: ['Mild loose stools or stomach upset', 'Nausea'],
        },
        {
          id: 'med-2',
          medicineName: 'Levocetirizine 5mg',
          genericName: 'Levocetirizine Dihydrochloride',
          dosage: '5 mg',
          form: 'Tablet',
          frequency: 'Once daily at night (0-0-1)',
          timing: 'Bedtime',
          duration: '5 days',
          scheduledTimes: ['22:00'],
          category: 'Antihistamine / Allergy Relief',
          purposeExplanation: 'Relieves runny nose, airway itching, throat irritation, and sneezing.',
          patientInstructions: 'Take 1 tablet right before sleeping. It may make you drowsy, so avoid night driving.',
          warningsAndPrecautions: [
            'May cause drowsiness or slowed reflexes.',
            'Do not consume alcohol while taking this medicine.',
          ],
          possibleSideEffects: ['Drowsiness', 'Dry mouth'],
        },
        {
          id: 'med-3',
          medicineName: 'Ascoril-D Cough Syrup',
          genericName: 'Dextromethorphan HBr + Chlorpheniramine Maleate',
          dosage: '10 ml',
          form: 'Syrup',
          frequency: 'Three times daily (1-1-1)',
          timing: 'After food',
          duration: '5 days',
          scheduledTimes: ['08:30', '13:30', '20:30'],
          category: 'Cough Suppressant',
          purposeExplanation: 'Calms constant cough spasms and thins out throat secretions so you can rest comfortably.',
          patientInstructions: 'Use the measured dosage cup. Take 10ml after breakfast, lunch, and dinner. Avoid drinking water immediately for 10 minutes so it coats your throat.',
          warningsAndPrecautions: [
            'Do not exceed the recommended 10ml dose.',
            'Avoid other over-the-counter cold medicines that contain similar antihistamines.',
          ],
          possibleSideEffects: ['Mild dizziness', 'Sleepiness'],
        },
        {
          id: 'med-4',
          medicineName: 'Pantoprazole 40mg',
          genericName: 'Pantoprazole Sodium',
          dosage: '40 mg',
          form: 'Capsule',
          frequency: 'Once daily in the morning (1-0-0)',
          timing: 'Empty stomach',
          duration: '7 days',
          scheduledTimes: ['07:30'],
          category: 'Antacid / PPI',
          purposeExplanation: 'Protects the stomach lining from acid irritation caused by strong antibiotics.',
          patientInstructions: 'Take with a glass of water 30 minutes before having breakfast.',
          warningsAndPrecautions: [
            'Do not crush or chew the capsule; swallow whole.',
            'Must be taken before eating for best effect.',
          ],
          possibleSideEffects: ['Occasional headache', 'Mild abdominal fullness'],
        },
      ],
      safetyAlerts: [
        {
          id: 'alert-1',
          severity: 'medium',
          title: 'Antibiotic Course Adherence',
          message: 'Stopping Augmentin early can cause bacteria to rebound and develop antibiotic resistance. Please finish all 7 days.',
          relatedMedication: 'Augmentin 625mg',
        },
        {
          id: 'alert-2',
          severity: 'low',
          title: 'Drowsiness Precaution',
          message: 'Both Levocetirizine and Ascoril-D can cause sedation. Avoid driving or heavy machinery if you feel drowsy.',
          relatedMedication: 'Levocetirizine 5mg',
        },
      ],
      questionsForPharmacist: [
        'Can I take a probiotic alongside Augmentin to prevent antibiotic-associated diarrhea?',
        'What should I do if I forget a dose of Augmentin during the day?',
        'Does the cough syrup interfere with any other regular vitamin supplements?',
      ],
    },
  },
  {
    id: 'sample-rx-2',
    title: 'Hypertension & Diabetes (Cardiology Care)',
    category: 'Chronic Care Prescription',
    badge: 'BP + Blood Sugar Combo',
    description: 'Long-term maintenance therapy with specific morning and bedtime routines.',
    imageUrl: sampleSvg2,
    data: {
      id: 'rx-sample-02',
      scannedAt: new Date().toISOString(),
      rawOcrText: `ST. JUDE CARDIOLOGY & DIABETIC CARE
Dr. Elena Rostova, MD (Cardiology) | Fellow, ACC
Patient: Robert Martinez | Age: 58 | Gender: M | Date: Oct 05, 2026
Clinical Indication: Essential Hypertension & Type 2 Diabetes Management
Rx:
1. Tab Telmisartan 40mg + Hydrochlorothiazide 12.5mg (Telma-H) - Dispense: 30 tablets - 1 tab PO qAM
2. Tab Metformin HCl 500mg (Extended Release) - Dispense: 60 tablets - 1 tab PO BID with meals
3. Tab Atorvastatin Calcium 20mg - Dispense: 30 tablets - 1 tab PO qHS
Instructions:
- Monitor blood pressure daily at 8:00 AM before taking medication.
- Maintain low sodium diet (<2g/day) and avoid grapefruit juice with Atorvastatin.
- Follow up in 4 weeks for renal and electrolyte panel.`,
      metadata: {
        doctorName: 'Dr. Elena Rostova, MD',
        specialtyOrClinic: 'St. Jude Cardiology & Diabetic Care',
        patientName: 'Robert Martinez',
        patientAgeOrGender: '58 / Male',
        date: 'Oct 05, 2026',
        diagnosisOrCondition: 'Essential Hypertension & Type 2 Diabetes Mellitus',
        generalDoctorAdvice: 'Log morning BP daily. Maintain a low-salt diet and stay active.',
        clarityScore: 96,
        handwritingQuality: 'Clear',
      },
      simplifiedSummary: 'Daily maintenance regimen designed to keep your blood pressure within target (under 130/80 mmHg), control blood glucose with meals, and reduce cardiac risk by keeping cholesterol low.',
      medications: [
        {
          id: 'med-201',
          medicineName: 'Telma-H (Telmisartan + HCTZ)',
          genericName: 'Telmisartan 40mg + Hydrochlorothiazide 12.5mg',
          dosage: '40mg / 12.5mg',
          form: 'Tablet',
          frequency: 'Once daily every morning (1-0-0)',
          timing: 'With meals',
          duration: 'Ongoing (30 days refill)',
          scheduledTimes: ['08:00'],
          category: 'Blood Pressure (ARB + Diuretic)',
          purposeExplanation: 'Relaxes blood vessels and removes excess fluid to keep your blood pressure steady.',
          patientInstructions: 'Take each morning around 8:00 AM after breakfast. You may need to urinate more frequently in the morning.',
          warningsAndPrecautions: [
            'Do not stand up too quickly from sitting or lying down to prevent lightheadedness.',
            'Stay well-hydrated during warm weather.',
          ],
          possibleSideEffects: ['Mild dizziness', 'Increased urination in first 2-3 hours'],
        },
        {
          id: 'med-202',
          medicineName: 'Metformin ER 500mg',
          genericName: 'Metformin Hydrochloride (Extended Release)',
          dosage: '500 mg',
          form: 'Tablet',
          frequency: 'Twice daily with meals (1-0-1)',
          timing: 'With meals',
          duration: 'Ongoing (60 days refill)',
          scheduledTimes: ['08:30', '20:00'],
          category: 'Blood Sugar Control (Antidiabetic)',
          purposeExplanation: 'Helps your body respond better to insulin and lowers glucose production in the liver.',
          patientInstructions: 'Swallow whole with your morning and evening meals to minimize any stomach discomfort. Never crush extended-release tablets.',
          warningsAndPrecautions: [
            'Do not drink heavy amounts of alcohol while on Metformin.',
            'Let your doctor know before any contrast X-ray or CT scans.',
          ],
          possibleSideEffects: ['Initial mild stomach gas or loose stool (usually fades in 1-2 weeks)'],
        },
        {
          id: 'med-203',
          medicineName: 'Atorvastatin 20mg',
          genericName: 'Atorvastatin Calcium',
          dosage: '20 mg',
          form: 'Tablet',
          frequency: 'Once daily at bedtime (0-0-1)',
          timing: 'Bedtime',
          duration: 'Ongoing (30 days refill)',
          scheduledTimes: ['22:00'],
          category: 'Cholesterol / Cardiovascular Protection',
          purposeExplanation: 'Lowers LDL ("bad") cholesterol and protects artery walls against plaque buildup.',
          patientInstructions: 'Take 1 tablet every night before sleep.',
          warningsAndPrecautions: [
            'Avoid grapefruit or grapefruit juice, which can raise medicine blood levels.',
            'Contact doctor if experiencing unusual unexplained muscle soreness.',
          ],
          possibleSideEffects: ['Occasional mild muscle stiffness', 'Digestive change'],
        },
      ],
      safetyAlerts: [
        {
          id: 'alert-201',
          severity: 'medium',
          title: 'Grapefruit Food Interaction',
          message: 'Avoid eating grapefruit or drinking grapefruit juice while taking Atorvastatin, as it increases drug concentration in your body.',
          relatedMedication: 'Atorvastatin 20mg',
        },
        {
          id: 'alert-202',
          severity: 'low',
          title: 'Morning Postural Dizziness',
          message: 'Telma-H lowers blood pressure gently. Take a moment when swinging your legs out of bed in the morning to avoid dizziness.',
          relatedMedication: 'Telma-H (Telmisartan + HCTZ)',
        },
      ],
      questionsForPharmacist: [
        'At what blood pressure reading should I call my doctor if it is too low or too high?',
        'Is it normal to see the empty tablet shell of Metformin ER in stool? (Yes, the outer matrix passes safely).',
        'Can I take over-the-counter pain relievers like Ibuprofen? (NSAIDs may reduce blood pressure medicine effectiveness; ask pharmacist about Paracetamol instead).',
      ],
    },
  },
];
