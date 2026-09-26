# Decision Maker - Acceptance Criteria

Every criterion below is written so that it maps 1:1 to a test case.

- `[U]` = **unit test** – pure functions, services, state. No DOM, no TestBed required.
- `[C]` = **component test** – rendered component via `TestBed` + Angular Material harnesses.

Format: *Given / When / Then* plus an explicit **Expected** value that the assertion checks.

---

## 0. Test Contract (shared fixtures & constants)

These definitions are binding for the implementation and are used by all tests below.

### 0.1 Domain model

```ts
type CriterionValue = 0 | 1 | 2 | 3 | 4 | 5;

interface Task {
  id: string;          // uuid
  title: string;       // non-empty, trimmed, max 120 chars
  expectation: CriterionValue;
  timeEffort: CriterionValue;
  workEffort: CriterionValue;
  createdAt: number;   // epoch ms
}
```

### 0.2 Pure functions under test

| Function | Signature |
| --- | --- |
| `calculateRating` | `(task: Pick<Task,'expectation'\|'timeEffort'\|'workEffort'>) => number` |
| `sortByRating` | `(tasks: readonly Task[]) => Task[]` |
| `getRatingLevel` | `(rating: number) => RatingLevel` |
| `criterionLabel` | `(value: CriterionValue) => string` |

### 0.3 Rating level / color mapping

| Rating | `RatingLevel` | CSS class | Color |
| --- | --- | --- | --- |
| 0–3 | `VeryLow` | `rating--very-low` | red |
| 4–6 | `Low` | `rating--low` | red-orange |
| 7–9 | `Medium` | `rating--medium` | orange |
| 10–12 | `High` | `rating--high` | yellow-green |
| 13–15 | `VeryHigh` | `rating--very-high` | green |

### 0.4 Criterion labels

| Value | Label |
| --- | --- |
| 0 | Very Bad |
| 1 | Bad |
| 2 | Sufficient |
| 3 | Satisfactory |
| 4 | Good |
| 5 | Very Good |

### 0.5 Storage

- Local storage key: `decision-maker.tasks`
- Stored value: `JSON.stringify(Task[])`

### 0.6 Test selectors (`data-testid`)

`task-table`, `task-row`, `task-title`, `task-rating`, `task-empty-state`,
`new-task-button`, `edit-task-button`, `delete-task-button`, `break-down-button`,
`task-form`, `field-title`, `field-expectation`, `field-time-effort`, `field-work-effort`,
`source-task`, `sub-task-row`, `add-sub-task-button`, `remove-sub-task-button`,
`dialog-confirm`, `dialog-cancel`, `validation-error`

### 0.7 Fixtures

```ts
const TASK_A = { id: 'a', title: 'Alpha',   expectation: 5, timeEffort: 5, workEffort: 5, createdAt: 1 }; // rating 15
const TASK_B = { id: 'b', title: 'Bravo',   expectation: 2, timeEffort: 2, workEffort: 3, createdAt: 2 }; // rating 7
const TASK_C = { id: 'c', title: 'Charlie', expectation: 0, timeEffort: 1, workEffort: 0, createdAt: 3 }; // rating 1
const TASK_D = { id: 'd', title: 'Delta',   expectation: 3, timeEffort: 2, workEffort: 2, createdAt: 4 }; // rating 7
```

---

## 1. Rating Calculation `[U]`

**AC-1.1 – Rating is the sum of the three criteria**
- **Given** `calculateRating`
- **When** called with `{ expectation: 2, timeEffort: 3, workEffort: 1 }`
- **Then** **Expected** `6`

**AC-1.2 – Boundaries**
- `calculateRating({0,0,0})` → **Expected** `0`
- `calculateRating({5,5,5})` → **Expected** `15`

**AC-1.3 – Rating is pure**
- **Given** `TASK_B`
- **When** `calculateRating(TASK_B)` is called twice
- **Then** **Expected** the same result `7` and `TASK_B` is unchanged (deep equal to the fixture)

**AC-1.4 – Criterion labels**
- **Given** `criterionLabel`
- **Then** **Expected** `0 → 'Very Bad'`, `1 → 'Bad'`, `2 → 'Sufficient'`, `3 → 'Satisfactory'`, `4 → 'Good'`, `5 → 'Very Good'`

## 2. Sorting `[U]`

**AC-2.1 – Sorted by rating, highest first**
- **Given** `[TASK_C, TASK_A, TASK_B]`
- **When** `sortByRating(tasks)` is called
- **Then** **Expected** ids in the order `['a', 'b', 'c']`

**AC-2.2 – Deterministic tie-break**
- **Given** `[TASK_D, TASK_B]` (both rating 7)
- **When** `sortByRating(tasks)` is called
- **Then** **Expected** ids in the order `['b', 'd']` (equal rating → older `createdAt` first)

**AC-2.3 – No mutation of the input**
- **Given** an input array
- **When** `sortByRating` is called
- **Then** **Expected** a new array instance is returned and the input array order is unchanged

**AC-2.4 – Edge cases**
- `sortByRating([])` → **Expected** `[]`
- `sortByRating([TASK_A])` → **Expected** `[TASK_A]`

## 3. Rating Level / Color Mapping `[U]`

**AC-3.1 – Mapping per bucket**
- **Given** `getRatingLevel`
- **Then** **Expected** `0 → VeryLow`, `3 → VeryLow`, `4 → Low`, `6 → Low`, `7 → Medium`, `9 → Medium`, `10 → High`, `12 → High`, `13 → VeryHigh`, `15 → VeryHigh`

**AC-3.2 – Monotonic**
- **Given** all ratings `0..15`
- **Then** **Expected** the level index never decreases as the rating increases

**AC-3.3 – Same rating, same level**
- **Given** `TASK_B` and `TASK_D` (both rating 7)
- **Then** **Expected** both map to `Medium` / CSS class `rating--medium`

## 4. Task Store / State `[U]`

The store is a signal-based domain service with an injected storage abstraction (fake/spy in tests).

**AC-4.1 – Initial load from storage**
- **Given** the storage returns `[TASK_C, TASK_A]`
- **When** the store is created
- **Then** **Expected** `store.tasks()` has length `2` and `store.sortedTasks()` returns ids `['a', 'c']`

**AC-4.2 – Add task**
- **Given** an empty store
- **When** `store.add({ title: 'New', expectation: 4, timeEffort: 4, workEffort: 4 })` is called
- **Then** **Expected** `store.tasks()` has length `1`, the created task has a non-empty `id` and `createdAt`, and `storage.save` was called once with an array of length `1`

**AC-4.3 – Update task**
- **Given** a store containing `TASK_C` (rating 1)
- **When** `store.update('c', { expectation: 5, timeEffort: 5, workEffort: 5 })` is called
- **Then** **Expected** `store.tasks()[0].rating`-relevant values sum to `15` and `storage.save` was called with the updated task

**AC-4.4 – Update unknown id**
- **When** `store.update('does-not-exist', {...})` is called
- **Then** **Expected** state is unchanged and `storage.save` is **not** called

**AC-4.5 – Delete task**
- **Given** a store containing `TASK_A` and `TASK_B`
- **When** `store.remove('a')` is called
- **Then** **Expected** `store.tasks()` contains only id `'b'` and `storage.save` was called with an array of length `1`

**AC-4.6 – Break down replaces the source task**
- **Given** a store containing `TASK_A`
- **When** `store.breakDown('a', [subTask1, subTask2])` is called
- **Then** **Expected** `store.tasks()` has length `2`, does **not** contain id `'a'`, and both new tasks have fresh ids

**AC-4.7 – Break down with an empty list is rejected**
- **When** `store.breakDown('a', [])` is called
- **Then** **Expected** state is unchanged and `storage.save` is **not** called

**AC-4.8 – Immutability**
- **When** any mutating store method runs
- **Then** **Expected** a new array instance is emitted by the `tasks` signal (previous snapshot is not modified)

**AC-4.9 – Derived state**
- **Given** the store
- **Then** **Expected** `sortedTasks` is a `computed()` that re-evaluates after every add/update/remove without manual triggering

## 5. Persistence / Infrastructure `[U]`

**AC-5.1 – Storage key and payload**
- **When** `repository.save([TASK_A])` is called
- **Then** **Expected** `localStorage.setItem` was called with key `decision-maker.tasks` and `JSON.stringify([TASK_A])`

**AC-5.2 – Load round-trip**
- **Given** `localStorage` contains `JSON.stringify([TASK_A, TASK_B])` under the key
- **When** `repository.load()` is called
- **Then** **Expected** the result deep-equals `[TASK_A, TASK_B]`

**AC-5.3 – Missing entry**
- **Given** the key is not present
- **When** `repository.load()` is called
- **Then** **Expected** `[]` and no exception is thrown

**AC-5.4 – Corrupt entry**
- **Given** the key contains `'{not-json'`
- **When** `repository.load()` is called
- **Then** **Expected** `[]` and no exception is thrown

**AC-5.5 – Invalid records are dropped**
- **Given** the key contains `'[{"id":"x"}]'` (missing criteria)
- **When** `repository.load()` is called
- **Then** **Expected** `[]` (records failing the schema check are filtered out)

**AC-5.6 – No server communication**
- **When** the whole app is exercised in tests
- **Then** **Expected** `HttpTestingController.verify()` reports no open requests and no `HttpClient` is injected anywhere

## 6. Task Table Component `[C]`

**AC-6.1 – Renders one row per task**
- **Given** the component receives `[TASK_A, TASK_B, TASK_C]` via its `input()`
- **When** the fixture is rendered
- **Then** **Expected** `MatRowHarness` count is `3`

**AC-6.2 – Row content**
- **Given** `TASK_B` is rendered
- **Then** **Expected** the row cells contain `'Bravo'`, `'Sufficient'` (2), `'Sufficient'` (2), `'Satisfactory'` (3) and the rating `'7'`

**AC-6.3 – Rows are rendered in rating order**
- **Given** the input `[TASK_C, TASK_A, TASK_B]`
- **Then** **Expected** the rendered titles in DOM order are `['Alpha', 'Bravo', 'Charlie']`

**AC-6.4 – Row color class**
- **Given** `TASK_A` (15), `TASK_B` (7) and `TASK_C` (1) are rendered
- **Then** **Expected** the row elements carry the classes `rating--very-high`, `rating--medium` and `rating--very-low` respectively

**AC-6.5 – Empty state**
- **Given** the input is `[]`
- **Then** **Expected** `task-empty-state` is present and `task-row` count is `0`

**AC-6.6 – Break-down button visibility on hover**
- **Given** a rendered row
- **Then** **Expected** `break-down-button` is not visible by default (computed style `opacity: 0` / `visibility: hidden`)
- **When** a `mouseenter` event is dispatched on the row
- **Then** **Expected** the button is visible
- **When** a `mouseleave` event is dispatched
- **Then** **Expected** the button is hidden again

**AC-6.7 – Break-down button is keyboard reachable**
- **When** `focus` is dispatched on `break-down-button`
- **Then** **Expected** the button is visible and has an `aria-label` containing the task title

**AC-6.8 – Output on break down**
- **When** `break-down-button` of the row of `TASK_A` is clicked
- **Then** **Expected** the `breakDown` output emitted exactly once with `'a'`

**AC-6.9 – Outputs for edit and delete**
- **When** `edit-task-button` / `delete-task-button` of a row is clicked
- **Then** **Expected** the `edit` / `delete` output emitted once with the task id

**AC-6.10 – Rating is also available as text**
- **Given** any rendered row
- **Then** **Expected** `task-rating` contains the numeric rating (color is not the only information carrier)

**AC-6.11 – Change detection**
- **Given** the component uses `ChangeDetectionStrategy.OnPush`
- **When** the input signal value changes and `fixture.detectChanges()` runs
- **Then** **Expected** the rendered rows match the new input

## 7. Task Form Dialog Component `[C]`

**AC-7.1 – Fields present**
- **When** the dialog is opened without data
- **Then** **Expected** `field-title`, `field-expectation`, `field-time-effort` and `field-work-effort` exist and the criteria controls offer exactly the 6 options `Very Bad … Very Good`

**AC-7.2 – Confirm disabled while invalid**
- **Given** an empty form
- **Then** **Expected** `dialog-confirm` is disabled
- **When** title `'Task'` and all three criteria are filled
- **Then** **Expected** `dialog-confirm` is enabled

**AC-7.3 – Empty / whitespace title**
- **When** the title is set to `'   '` and the field is blurred
- **Then** **Expected** the form is invalid and a `validation-error` with the text `Title is required` is shown

**AC-7.4 – Criterion out of range**
- **When** the value `6` or `-1` is patched into a criterion control
- **Then** **Expected** the control is invalid with error key `range` and `dialog-confirm` stays disabled

**AC-7.5 – Live rating preview**
- **When** the criteria `4 / 4 / 4` are selected
- **Then** **Expected** the displayed rating is `12` and it updates immediately when one value changes to `5` → `13`

**AC-7.6 – Confirm closes with the form value**
- **When** a valid form is confirmed
- **Then** **Expected** `MatDialogRef.close` was called once with `{ title: 'Task', expectation: 4, timeEffort: 4, workEffort: 4 }`

**AC-7.7 – Cancel closes without a value**
- **When** `dialog-cancel` is clicked
- **Then** **Expected** `MatDialogRef.close` was called once with `undefined` and no store method was called

**AC-7.8 – Edit mode prefills**
- **When** the dialog is opened with `MAT_DIALOG_DATA = TASK_B`
- **Then** **Expected** the form value equals title `'Bravo'`, `2 / 2 / 3`

## 8. Break-Down Dialog Component `[C]`

**AC-8.1 – Source task is displayed read-only**
- **Given** the dialog is opened with `TASK_A`
- **Then** **Expected** `source-task` shows the title `'Alpha'`, the three criteria values `5 / 5 / 5` and the rating `15`, and none of these elements is editable

**AC-8.2 – Starts with one empty sub-task row**
- **When** the dialog is opened
- **Then** **Expected** `sub-task-row` count is `1` and `dialog-confirm` is disabled

**AC-8.3 – Add sub-tasks**
- **When** `add-sub-task-button` is clicked three times
- **Then** **Expected** `sub-task-row` count is `4`

**AC-8.4 – Remove a sub-task row**
- **Given** 3 rows exist and row index 1 is filled with title `'B'`
- **When** `remove-sub-task-button` of row index 1 is clicked
- **Then** **Expected** `sub-task-row` count is `2` and no remaining row has the title `'B'`

**AC-8.5 – At least one sub-task required**
- **Given** exactly one row exists
- **Then** **Expected** its `remove-sub-task-button` is disabled

**AC-8.6 – Confirm disabled while any row is invalid**
- **Given** two rows where row 0 is valid and row 1 has an empty title
- **Then** **Expected** `dialog-confirm` is disabled
- **When** row 1 gets a valid title and criteria
- **Then** **Expected** `dialog-confirm` is enabled

**AC-8.7 – Confirm returns all sub-tasks**
- **Given** two valid rows
- **When** `dialog-confirm` is clicked
- **Then** **Expected** `MatDialogRef.close` was called once with an array of length `2` containing exactly the entered titles and criteria values

**AC-8.8 – Cancel**
- **When** `dialog-cancel` is clicked
- **Then** **Expected** `MatDialogRef.close` was called with `undefined`

## 9. Page / Facade Integration `[C]`

**AC-9.1 – New task flow**
- **Given** the page is rendered with an empty store and a mocked `MatDialog` returning `{ title: 'X', expectation: 5, timeEffort: 5, workEffort: 5 }`
- **When** `new-task-button` is clicked
- **Then** **Expected** `MatDialog.open` was called with the task form component and `store.add` was called once with that value, and the table shows `1` row

**AC-9.2 – Break-down flow**
- **Given** the page renders `TASK_A` and the mocked dialog returns two sub-tasks
- **When** the table emits `breakDown('a')`
- **Then** **Expected** `store.breakDown` was called with `'a'` and the two sub-tasks, and the table shows `2` rows without `'Alpha'`

**AC-9.3 – Cancelled dialog changes nothing**
- **Given** the mocked dialog resolves with `undefined`
- **When** any dialog-opening action is triggered
- **Then** **Expected** no store mutation method is called and the rendered rows are unchanged

**AC-9.4 – Re-sorting after a change**
- **Given** the table shows `['Alpha', 'Charlie']`
- **When** `Charlie` is updated to `5 / 5 / 5` and `Alpha` to `0 / 0 / 1`
- **Then** **Expected** the rendered order is `['Charlie', 'Alpha']`

**AC-9.5 – State survives a re-creation of the component**
- **Given** tasks were created
- **When** the fixture is destroyed and the page component is created again with the real local-storage repository
- **Then** **Expected** the table shows exactly the previously persisted tasks

## 10. Technical Constraints (verifiable)

**AC-10.1 – Angular Material `[C]`**
- **When** the page is rendered
- **Then** **Expected** `MatTableHarness`, `MatDialogHarness`, `MatFormFieldHarness` and `MatButtonHarness` find the corresponding elements (i.e. the UI is built with Angular Material components)

**AC-10.2 – No routing `[U]`**
- **Given** the application config
- **Then** **Expected** it contains no `provideRouter` and no `<router-outlet>` exists in any template

**AC-10.3 – Layered architecture `[U]`**
- **Given** the folder structure `application/`, `domain/`, `infrastructure/`
- **Then** **Expected** no file under `domain/` imports from `application/` or `infrastructure/`
- **And** the store depends on a storage abstraction (injection token / abstract class), proven by the fact that all store unit tests run with a fake implementation and without `localStorage`

**AC-10.4 – Angular conventions `[U]`/`[C]`**
- **Then** **Expected** components are standalone, use `ChangeDetectionStrategy.OnPush`, `input()`/`output()` functions, signals + `computed()` for derived state and reactive forms
- **And** no component test needs `fixture.autoDetectChanges()` workarounds caused by missing `OnPush` support

**AC-10.5 – Accessibility `[C]`**
- **When** a dialog is open
- **Then** **Expected** focus is inside the dialog, `Escape` closes it, and every icon-only button has an `aria-label`
