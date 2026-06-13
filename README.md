# Portfolio Management Dashboard

A high-fidelity, premium personal finance and investment portfolio tracking application. Built with **Angular 21 (Material Design)**, **Node.js/Express**, and **SQLite**, and comprehensively validated using a **Behavior-Driven Development (BDD)** test suite powered by **Cucumber.js** and **Playwright**.

---

## 🌟 Key Features

### 📊 Interactive Dashboard
- **Key Performance Indicators (KPIs)**: Instantly track Total Value, Total Capital Invested, Net Profit/Loss, and Yield Return rates.
- **Bioluminescent Conic Donut Chart**: Visual representation of asset share distribution with details lists.
- **Asset Allocation Segment Bar**: Shows weight distribution across Stocks, Bonds, and Mutual Funds.
- **Reactive Empty States**: Helpful prompts suggesting actions when no investments exist.

### 💼 Portfolio Holdings & Positions
- **Real-time Table Views**: Structured views of active positions, cost prices, current market values, and gains.
- **Buy & Sell Actions**:
  - Prefilled market price mock logic on asset select.
  - Dynamic validation blocks restricting sells that exceed current balances.
  - Direct database transaction synchronization.
- **Export Portfolio to PDF**: Instantly downloads printer-friendly, clean PDF copies of your holdings and stats utilizing `jsPDF` and `jspdf-autotable`.

### 📜 Transaction Log History
- **Server-Side Pagination**: Efficient loading logs using SQLite offset and limit configurations.
- **Reactive Filtering**: Filter transactions logs by Type (BUY/SELL), Date Ranges, and Asset Class (Stocks/Bonds/Mutual Funds).
- **Responsive Layout**: Transforms tables into clean mobile-friendly card-list views automatically on screens narrower than `768px`.

---

## 🛠️ Technology Stack

- **Frontend**: Angular 21, RxJS, Angular Material Components, SCSS / Custom CSS (Premium Abyssal Dark theme).
- **Backend**: Node.js, Express, SQLite3, SQL DDL bootstrap migrations.
- **Testing Suites**:
  - **Unit Testing**: Jasmine & Karma (Frontend), Vitest / Jest (Backend).
  - **BDD Integration Tests**: Cucumber.js (API validation tests).
  - **End-to-End (E2E) Browser Tests**: Playwright + Cucumber.js (Visual browser tests running headlessly).

---

## 🚀 Setup & Execution

### 1. Prerequisite
Ensure [Node.js](https://nodejs.org/) (v18+) is installed.

### 2. Backend Server Setup
Navigate to the backend directory, install dependencies, and start the development server:
```bash
cd backend
npm install
npm run dev
```
The server bootstrapper will create a local SQLite file (`database.sqlite`) and host the API endpoints on `http://localhost:3000`.

### 3. Angular Frontend Setup
Open a new terminal session, navigate to the frontend directory, and run the development compiler:
```bash
cd frontend
npm install
npm run start
```
Open your browser and navigate to `http://localhost:4200` to interact with the application.

---

## 🧪 Running the Test Suites

### Unit Tests
- **Frontend Specs**:
  ```bash
  cd frontend
  npm run test
  ```
- **Backend Specs**:
  ```bash
  cd backend
  npm run test
  ```

### BDD Integration & E2E Tests
To execute both the API integration specs and the Playwright visual UI browser tests:
```bash
cd bdd-tests
npm install
npx playwright install chromium
npm test
```
*Individual scripts are also available: `npm run test:api` (API only) and `npm run test:ui` (Playwright E2E browser tests only).*

---

## 🐳 Docker Deployment & Testing

You can orchestrate and build the entire environment—including compiling the Angular frontend, configuring the Nginx proxy, launching the Express server, and executing the Playwright/Cucumber test suites—using **Docker Compose**.

### Build and Run All Services
To build and spin up the frontend and backend containers:
```bash
docker-compose up --build -d backend frontend
```
- **Frontend App**: Accessible at `http://localhost` (served by Nginx on port 80).
- **Backend API**: Accessible at `http://localhost:3000`.
- **API Swagger docs**: Accessible at `http://localhost:3000/api-docs/`.

### Run BDD Integration & E2E Tests inside Docker
To spin up the environment and execute the complete test suites inside a Playwright-configured Linux container:
```bash
docker-compose run --rm tests
```
This automatically waits for the backend to be healthy, verifies the frontend is running, and executes the 25 API tests and 12 UI browser tests headlessly.

---

## ⚖️ Co-Creation Disclaimer

This application was developed through a pair programming collaboration between **Vijaya Sarathi** and an AI agent (**Antigravity**, powered by Google Gemini). Detailed breakdown can be found in the [DISCLAIMER.md](DISCLAIMER.md) file.

