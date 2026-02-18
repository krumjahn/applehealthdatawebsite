# HealthKit to Clinical Standards Mapping (Pro)

This table maps standard Apple HealthKit identifiers to international clinical standards (LOINC, ICD-10, SNOMED CT) to support professional medical audits.

## 1. Vitals & Biometrics (LOINC)

| HealthKit ID | Metric | LOINC Code | LOINC Long Common Name |
| :--- | :--- | :--- | :--- |
| `HKQuantityTypeIdentifierBodyMassIndex` | Body Mass Index | 39156-5 | Body mass index (BMI) [Ratio] |
| `HKQuantityTypeIdentifierBodyFatPercentage` | Body Fat Percentage | 41909-3 | Body fat [Mass Fraction] |
| `HKQuantityTypeIdentifierHeight` | Body Height | 8302-2 | Body height |
| `HKQuantityTypeIdentifierBodyMass` | Body Weight | 29463-7 | Body weight |
| `HKQuantityTypeIdentifierBloodPressureSystolic` | BP Systolic | 8480-6 | Systolic blood pressure |
| `HKQuantityTypeIdentifierBloodPressureDiastolic` | BP Diastolic | 8462-4 | Diastolic blood pressure |
| `HKQuantityTypeIdentifierHeartRate` | Heart Rate | 8867-4 | Heart rate |
| `HKQuantityTypeIdentifierBodyTemperature` | Body Temperature | 8310-5 | Body temperature |
| `HKQuantityTypeIdentifierOxygenSaturation` | Oxygen Saturation | 2708-6 | Oxygen saturation in Arterial blood |
| `HKQuantityTypeIdentifierRespiratoryRate` | Respiratory Rate | 9279-1 | Respiratory rate |
| `HKQuantityTypeIdentifierBloodGlucose` | Blood Glucose | 2339-0 | Glucose [Mass/volume] in Blood |
| `HKQuantityTypeIdentifierHeartRateVariabilitySDNN` | HRV (SDNN) | 80404-7 | R-R interval standard deviation (SDNN) |

## 2. Activity & Lifestyle (LOINC)

| HealthKit ID | Metric | LOINC Code | LOINC Long Common Name |
| :--- | :--- | :--- | :--- |
| `HKQuantityTypeIdentifierStepCount` | Step Count | 55423-8 | Number of steps in unspecified time Pedometer |
| `HKQuantityTypeIdentifierDistanceWalkingRunning` | Distance | 41950-7 | Number of steps in 24 hour |
| `HKQuantityTypeIdentifierActiveEnergyBurned` | Energy Burned | 41981-2 | Calories burned in 24 hour |
| `HKCategoryTypeIdentifierSleepAnalysis` | Sleep Analysis | 93832-4 | Sleep duration |

## 3. Symptoms (ICD-10)

Apple Health Symptoms are typically mapped via clinical records or symptom trackers:

| Symptom | ICD-10 Code | ICD-10 Description |
| :--- | :--- | :--- |
| Abdominal Pain | R10.9 | Unspecified abdominal pain |
| Chest Pain | R07.9 | Chest pain, unspecified |
| Dizziness | R42 | Dizziness and giddiness |
| Fatigue | R53.83 | Other fatigue |
| Headache | R51.9 | Headache, unspecified |
| Shortness of Breath | R06.02 | Shortness of breath |
| Wheezing | R06.2 | Wheezing |
| Nausea | R11.0 | Nausea |
| Vomiting | R11.10 | Vomiting, unspecified |

## 4. Laboratory Findings (LOINC)

Common lab exports from Clinical Records:

| Metric | LOINC Code | LOINC Long Common Name |
| :--- | :--- | :--- |
| Cholesterol | 2093-3 | Cholesterol [Mass/volume] in Serum or Plasma |
| Triglycerides | 2571-8 | Triglycerides [Mass/volume] in Serum or Plasma |
| HDL Cholesterol | 2085-9 | Cholesterol in HDL [Mass/volume] in Serum or Plasma |
| LDL Cholesterol | 13457-7 | Cholesterol in LDL [Mass/volume] in Serum or Plasma |
| Hemoglobin A1c | 4548-4 | Hemoglobin A1c/Hemoglobin.total in Blood |
