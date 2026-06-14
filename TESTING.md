# 🔬 EcoNova Testing Suite & CI Documentation

This document explains the testing strategy, framework selection, structure, and local execution steps for the **EcoNova** platform test suite.

---

## 🛠️ 1. Testing Framework Selection

We utilize **Vitest** for our test runner, paired with **Happy DOM** for simulated browser environments.

### Why Vitest?
- **Native ES Modules Support**: All source code in EcoNova is structured using ES modules (`import`/`export`). Vitest processes ES modules natively, avoiding slow Babel/webpack compiling steps required by Jest.
- **Speed & Efficiency**: Vitest uses Vite's developer server underneath, executing tests in milliseconds.
- **Simulated Browser Context**: We configured `happy-dom` to mock the DOM tree, `window`, `document`, and `localStorage` namespaces, allowing browser-oriented controllers to run smoothly inside Node.js.

---

## 📂 2. Test Suite Structure

All tests reside in the `tests/` directory:

| Test File | Target Module | Scope & Asserts |
| :--- | :--- | :--- |
| `tests/calculator.test.js` | `js/calculator.js` | Validates emission math computations, WFH overrides, flight factors, renewable energy scaling, diet options, and fashion footprints. |
| `tests/validation.test.js` | `js/auth.js` | Validates sign-up credentials, including email formats, password length bounds, and empty display names. |
| `tests/dashboard.test.js` | `js/gamification.js` | Validates current user levels (1-5), level progress percentages, and evolving avatar rank thresholds. |
| `tests/ai.test.js` | `js/ai.js` | Verifies offline AI advice formatting, category alignment, and markdown replacement logic. |

---

## 💻 3. Running Tests Locally

### Prerequisites
Make sure you have Node.js (v18+) installed.

### 1. Install Dependencies
Initialize package dependencies:
```bash
npm install
```
*(On Windows systems with script execution restrictions, execute `npm.cmd install` instead).*

### 2. Run All Tests
Execute the Vitest test suite in single-run mode:
```bash
npm test
```

### 3. Run in Watch Mode
Keep Vitest running in active watch mode to capture changes dynamically:
```bash
npm run test:watch
```

---

## ⛓️ 4. Continuous Integration (CI)

A GitHub Actions pipeline (`.github/workflows/test.yml`) is configured to run automatically on:
- Every `push` to `main` and `master` branches.
- Every `pull_request` targeting `main` and `master` branches.

The pipeline ensures:
1. Safe repository checkouts.
2. Clean Node.js environment initialization.
3. Clean dependency caching.
4. Clean test execution (failing builds instantly if a single unit test fails).
