# Restful Booker Playwright Tests

A comprehensive test automation framework for the Restful Booker Platform using Playwright, TypeScript, and modern testing practices.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Suites](#test-suites)
- [Page Objects](#page-objects)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Reporting](#reporting)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

This project provides end-to-end test automation for the Restful Booker Platform Demo (https://automationintesting.online/), covering both API and UI testing scenarios using Playwright with TypeScript.

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
- **CI/CD Ready**: Configured for continuous integration

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:charansorted/restful-booker-playwright-tests.git
   cd restful-booker-playwright-tests

2. **Install dependencies**
   npm install

3. **Create environment file**
   copy the contents of the file that is sent seperately along with the Email

4. **Playwright Configuration**
   UI Tests: playwright-ui.config.ts
   API Tests: playwright-api.config.ts

5. **🧪 Running Tests**
    npm test
   **Run UI tests only**
npm run test:ui:smoke
   **Run API tests only**
npm run test:api
for individual tests please refer to package.json 

6. **View HTML Report**
   
   npx playwright show-report

7. **Cross Browser Functionality**
   compatible with Chrome and firefox, however firefox is commented out as the website is quite unstable

8. 👥 Authors

Charan Thotakura - CT

