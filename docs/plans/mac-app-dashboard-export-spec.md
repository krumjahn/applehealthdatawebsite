# Mac App Dashboard Export Spec

**Handoff doc for adding "Export Dashboard JSON" to the Health Data Mac app.**

This feature lets users export a `health-data.json` file that powers the public health dashboard at `applehealthdata.com/dashboard/` and the open-source template at `github.com/krumjahn/health-dashboard`.

---

## Menu Location

**File → Export → Dashboard JSON...**

Opens a save panel defaulting to filename `health-data.json`. The user picks a destination and clicks Save.

---

## Output File

Single JSON file: `health-data.json`

Full schema below. All fields are required unless marked optional.

---

## Full Schema

```json
{
  "meta": {
    "exportedAt": "<ISO 8601 timestamp, e.g. 2026-04-11T09:00:00Z>",
    "exportedBy": "Health Data Export & AI Analyzer",
    "version": "1.0",
    "owner": "<user's display name from app settings>",
    "location": "<user's location from app settings, optional>"
  },
  "summary": {
    "dataStartDate": "<YYYY-MM-DD, earliest record date across all HealthKit types>",
    "dataEndDate": "<YYYY-MM-DD, today>",
    "totalDays": "<integer, days between dataStartDate and dataEndDate inclusive>",
    "activeDays": "<integer, days with at least 1 step recorded>"
  },
  "today": {
    "date": "<YYYY-MM-DD>",
    "steps": "<integer>",
    "activeEnergy": "<kcal, integer>",
    "exerciseMinutes": "<integer>",
    "standHours": "<integer>",
    "restingHeartRate": "<bpm, integer>",
    "hrv": "<ms, integer, SDNN from HKQuantityTypeIdentifierHeartRateVariabilitySDNN>",
    "sleepHours": "<float, 1 decimal>",
    "sleepQuality": "<'poor' | 'fair' | 'good' | 'excellent' — computed from sleepHours>",
    "weight": "<kg, float, 1 decimal, most recent reading today or last 7 days>",
    "bodyFat": "<%, float, 1 decimal, optional — null if no data>",
    "workouts": [
      {
        "type": "<HKWorkoutActivityType display name, e.g. 'Running'>",
        "duration": "<minutes, integer>",
        "calories": "<kcal, integer>",
        "distance": "<km, float, 1 decimal — null if not applicable>"
      }
    ]
  },
  "last30Days": {
    "avgSteps": "<integer>",
    "avgSleepHours": "<float, 1 decimal>",
    "avgRestingHR": "<bpm, integer>",
    "avgHRV": "<ms, integer>",
    "totalWorkouts": "<integer>",
    "totalActiveMinutes": "<integer>",
    "avgWeight": "<kg, float, 1 decimal>",
    "stepsHistory": [
      { "date": "<YYYY-MM-DD>", "value": "<integer>" }
    ],
    "sleepHistory": [
      { "date": "<YYYY-MM-DD>", "value": "<float, 1 decimal>" }
    ],
    "hrvHistory": [
      { "date": "<YYYY-MM-DD>", "value": "<integer>" }
    ],
    "weightHistory": [
      { "date": "<YYYY-MM-DD>", "value": "<float, 1 decimal>" }
    ]
  },
  "allTime": {
    "totalSteps": "<integer>",
    "totalWorkouts": "<integer>",
    "totalActiveMinutes": "<integer>",
    "longestStreak": "<integer, days>",
    "currentStreak": "<integer, days>",
    "peakStepsDay": { "date": "<YYYY-MM-DD>", "value": "<integer>" },
    "lowestRestingHR": { "date": "<YYYY-MM-DD>", "value": "<integer>" },
    "highestHRV": { "date": "<YYYY-MM-DD>", "value": "<integer>" }
  },
  "workoutBreakdown": [
    {
      "type": "<display name>",
      "count": "<integer>",
      "totalMinutes": "<integer>",
      "totalCalories": "<integer>"
    }
  ],
  "nutrition": {
    "avgDailyCalories": "<kcal, integer — optional, null if no nutrition data>",
    "avgProtein": "<g, integer>",
    "avgCarbs": "<g, integer>",
    "avgFat": "<g, integer>",
    "avgWater": "<liters, float, 1 decimal>"
  },
  "vitals": {
    "avgBloodOxygen": "<%, float, 1 decimal>",
    "avgRespiratoryRate": "<breaths/min, float, 1 decimal>",
    "avgBodyTemp": "<°C, float, 1 decimal>"
  }
}
```

---

## HealthKit Query Mapping

| JSON field | HealthKit type | Query |
|---|---|---|
| `today.steps` | `HKQuantityTypeIdentifierStepCount` | `HKStatisticsQuery` sum for today |
| `today.activeEnergy` | `HKQuantityTypeIdentifierActiveEnergyBurned` | `HKStatisticsQuery` sum for today |
| `today.exerciseMinutes` | `HKQuantityTypeIdentifierAppleExerciseTime` | `HKStatisticsQuery` sum for today |
| `today.standHours` | `HKCategoryTypeIdentifierAppleStandHour` | count of `.stood` samples today |
| `today.restingHeartRate` | `HKQuantityTypeIdentifierRestingHeartRate` | most recent sample today |
| `today.hrv` | `HKQuantityTypeIdentifierHeartRateVariabilitySDNN` | most recent sample today |
| `today.sleepHours` | `HKCategoryTypeIdentifierSleepAnalysis` | sum of `.asleepUnspecified` + `.asleepCore` + `.asleepDeep` + `.asleepREM` durations |
| `today.weight` | `HKQuantityTypeIdentifierBodyMass` | most recent sample in last 7 days |
| `today.bodyFat` | `HKQuantityTypeIdentifierBodyFatPercentage` | most recent sample in last 7 days |
| `today.workouts` | `HKWorkoutType` | `HKSampleQuery` for today |
| `last30Days.stepsHistory` | `HKQuantityTypeIdentifierStepCount` | `HKStatisticsCollectionQuery` daily sum, last 30 days |
| `last30Days.sleepHistory` | `HKCategoryTypeIdentifierSleepAnalysis` | computed daily total per day |
| `last30Days.hrvHistory` | `HKQuantityTypeIdentifierHeartRateVariabilitySDNN` | daily average |
| `last30Days.weightHistory` | `HKQuantityTypeIdentifierBodyMass` | most recent reading per day |
| `allTime.totalSteps` | `HKQuantityTypeIdentifierStepCount` | cumulative sum all time |
| `allTime.totalWorkouts` | `HKWorkoutType` | count of all samples |
| `allTime.totalActiveMinutes` | `HKQuantityTypeIdentifierAppleExerciseTime` | cumulative sum all time |
| `allTime.peakStepsDay` | `HKQuantityTypeIdentifierStepCount` | daily sum, find max |
| `allTime.lowestRestingHR` | `HKQuantityTypeIdentifierRestingHeartRate` | find min sample all time |
| `allTime.highestHRV` | `HKQuantityTypeIdentifierHeartRateVariabilitySDNN` | find max sample all time |
| `nutrition.*` | `HKQuantityTypeIdentifierDietaryEnergyConsumed` etc. | 30-day average |
| `vitals.avgBloodOxygen` | `HKQuantityTypeIdentifierOxygenSaturation` | 30-day average |
| `vitals.avgRespiratoryRate` | `HKQuantityTypeIdentifierRespiratoryRate` | 30-day average |
| `vitals.avgBodyTemp` | `HKQuantityTypeIdentifierBodyTemperature` | 30-day average |

---

## `stepsHistory` Array Format

Array of 30 objects, one per calendar day (oldest to newest):

```json
[
  { "date": "2026-03-12", "value": 10432 },
  { "date": "2026-03-13", "value": 7821 },
  ...
  { "date": "2026-04-10", "value": 9105 }
]
```

- Dates are `YYYY-MM-DD` strings (local timezone)
- If no data exists for a day, include the entry with `"value": 0`
- Same format applies to `sleepHistory`, `hrvHistory`, `weightHistory`
- For `weightHistory`, if no reading on a given day, use the most recent prior reading (forward-fill). If no prior reading exists, omit the entry

---

## Computing `allTime.currentStreak`

A streak day = a calendar day where `steps > 500`.

```
currentStreak = 0
day = yesterday (or today if today has steps > 500)
while steps(day) > 500:
    currentStreak += 1
    day = day - 1
```

- Start from today if today already has steps > 500, otherwise start from yesterday
- Stop at the first day where steps ≤ 500 or no data

`longestStreak` = maximum run of consecutive days with steps > 500 across all time.

---

## `sleepQuality` Computation

Based on `sleepHours` for today:

| sleepHours | sleepQuality |
|---|---|
| < 5.0 | `"poor"` |
| 5.0 – 6.4 | `"fair"` |
| 6.5 – 8.4 | `"good"` |
| ≥ 8.5 | `"excellent"` |

---

## Optional Fields

If HealthKit has no data for a field, use `null` (not omit the key):

```json
"bodyFat": null,
"nutrition": null,
"vitals": null
```

The dashboard already handles `null` for these fields — it hides the section.

---

## Units

All units are metric:
- Weight: kg
- Distance: km
- Temperature: °C
- Water: liters
- Energy: kcal

---

## Export Performance

The export touches a lot of HealthKit queries. Recommended approach:
1. Show a progress sheet: "Preparing dashboard export…"
2. Run all queries concurrently with `async/await` + `withTaskGroup`
3. Close the sheet and open the save panel when all queries complete
4. Target: < 5 seconds on a typical 4-year dataset

---

## Reference

- Sample output: `docs/plans/health-data-schema.json`
- Dashboard HTML: `dashboard/index.html`
- Open-source template: https://github.com/krumjahn/health-dashboard
