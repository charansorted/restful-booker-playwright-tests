# Restful Booker Playwright Tests

A comprehensive test automation framework for the Restful Booker Platform using Playwright, TypeScript, and modern testing practices.

## 📋 Table of Contents

- [Restful Booker Playwright Tests](#restful-booker-playwright-tests)
  - [📋 Table of Contents](#-table-of-contents)
  - [🎯 Overview](#-overview)
  - [✨ Features](#-features)
  - [📦 Prerequisites](#-prerequisites)
  - [🚀 Installation](#-installation)
  - [⚙️ Configuration](#️-configuration)
  - [🧪 Running Tests](#-running-tests)
  - [📊 Test Reports](#-test-reports)
  - [🌐 Cross Browser Support](#-cross-browser-support)
  - [👥 Authors](#-authors)

## 🎯 Overview

This project provides end-to-end test automation for the Restful Booker Platform Demo (<https://automationintesting.online/>), covering both API and UI testing scenarios using Playwright with TypeScript.

## ✨ Features

- **Playwright Framework**: Modern web testing with auto-wait, multiple browser support
- **TypeScript Support**: Full type safety and IntelliSense
- **Page Object Model**: Maintainable and reusable test structure
- **API Testing**: Comprehensive API test coverage
- **UI Testing**: Cross-browser UI automation
- **Parallel Execution**: Fast test execution with configurable workers
- **Retry Mechanism**: Automatic retry for flaky tests
- **Multiple Reporters**: HTML, JSON, and JUnit reports
- **Environment Configuration**: Flexible configuration via .env files

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:charansorted/restful-booker-playwright-tests.git
   cd restful-booker-playwright-tests
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install Playwright browsers**

   ```bash
   npx playwright install
   ```

## ⚙️ Configuration

4. **Create environment file**

   ```bash
   # Copy the contents of the file that is sent separately along with the email
   # to a new .env file in the project root
   ```

5. **Playwright Configuration**
   - **UI Tests**: `playwright-ui.config.ts`
   - **API Tests**: `playwright-api.config.ts`

## 🧪 Running Tests

**Run all tests**

```bash
npm test
```

**Run UI tests only**

```bash
npm run test:ui:smoke
```

**Run API tests only**

```bash
npm run test:api
```

For individual tests, please refer to `package.json`

## 📊 Test Reports

**View HTML Report**

```bash
npx playwright show-report
```

## 🌐 Cross Browser Support

Compatible with Chrome and Firefox. However, Firefox is commented out as the website is quite unstable.

## 👥 Authors

**Charan Thotakura** - CT
