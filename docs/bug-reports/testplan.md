# Comprehensive Test Plan - Restful Booker Playwright Tests

## 1. Test Plan Overview

**Project**: Restful Booker Playwright Test Automation Framework  
**Repository**: charansorted/restful-booker-playwright-tests  
**Framework**: Playwright with TypeScript  
**Test Types**: API Testing, UI Testing, Smoke Tests, End-to-End Testing  

## 2. Test Architecture & Organization

### 2.1 Test Suite Structure
```
tests/
├── api/                           # API Test Suites
│   ├── auth/                      # Authentication Tests
│   ├── booking/                   # Booking API Tests
│   ├── e2e/                      # End-to-End API Workflows
│   └── room/                     # Room Management Tests
└── ui/                           # UI Test Suites
    ├── pages/                    # Page Object Model
    └── specs/                    # UI Test Specifications
```

### 2.2 Supporting Infrastructure
```
src/
├── config/                       # Environment & Test Configurations
├── fixtures/                     # Custom Playwright Fixtures
├── helpers/                      # Test Helper Functions
└── utils/                       # Utility Functions
```

## 3. API Test Coverage

### 3.1 Authentication Tests (`tests/api/auth/`)

#### Test Scope
| Test Category | Description | Priority |
|---------------|-------------|----------|
| Login Functionality | Auth interface validation with username/password | High |
| Token Management | Token interface generation, validation, expiry | High |
| Authorization | Access control using Token interface | High |
| Session Handling | Token-based session management | Medium |
| Rate Limiting | Throttling repeated failed login attempts | Medium |
| Security Testing | SQL injection and XSS prevention | Medium |
| Performance Testing | Response time validation | Medium |

#### Key Test Scenarios
- ✅ POST /auth/login with valid Auth credentials
- ✅ POST /auth/login with invalid Auth credentials  
- ✅ Validate Token interface structure and format
- ✅ Token-based authorization for protected endpoints
- ✅ Token expiry and refresh mechanisms
- ✅ Unauthorized access prevention without valid Token
- ⚠️ Rate limiting on repeated failed login attempts (returns 404 instead of 429)
- ✅ SQL injection attempt prevention
- ✅ Performance validation (under 500ms response time)
- ✅ XSS-like input sanitization

### 3.2 Booking Tests (`tests/api/booking/`)

#### Test Scope
| Test Category | Description | Priority |
|---------------|-------------|----------|
| Booking Journey | Full Booking journey using Booking interface | High |
| BookingDates Validation | Checkin/checkout date validation | High |
| Room Integration | Booking-Room relationship via roomId | High |
| Contact Details | Email/phone field validation (optional) | Medium |

#### Key Test Scenarios
- ✅ POST /booking/ with complete Booking interface data
- ✅ GET /booking?roomid={id} to retrieve bookings by room
- ⚠️ PUT /booking/{bookingId} requires authentication (returns 403 without auth)
- ✅ DELETE /booking/{bookingId} and verify removal
- ✅ Validate BookingDates checkin/checkout logic
- ✅ Test roomId relationship with Room interface
- ✅ Validate optional email/phone fields in Booking
- ⚠️ GET /booking/{bookingId} returns 405 Method Not Allowed
- ✅ Authorization requirements for booking updates

### 3.3 Room Tests (`tests/api/room/`)

#### Test Scope
| Test Category | Description | Priority |
|---------------|-------------|----------|
| Room Management | Room journey using Room interface | High |
| Room Properties | roomName, type, features, roomPrice validation | High |
| Response Structure | API response format validation | High |
| Authorization | Authentication requirements for protected endpoints | High |
| Data Validation | Room interface field validation | Medium |

#### Key Test Scenarios
- ✅ GET /room/ retrieves all rooms with proper response structure handling
- ✅ POST /room/ with complete Room interface data (requires auth)
- ✅ GET /room/{roomId} to retrieve specific room details
- ✅ PUT /room/{roomId} to update room properties (requires auth)
- ✅ DELETE /room/{roomId} with proper status codes
- ✅ Validate roomPrice as number field
- ✅ Test roomName, type, and other required fields
- ✅ Authorization requirements for POST/PUT/DELETE operations
- ✅ Unauthorized access returns 401 for protected endpoints
- ⚠️ GET /room/{roomId} after deletion returns 500 instead of 404
- ✅ Response structure validation (array vs object with rooms property)
- ✅ Room creation verification through GET /room/ listing

### 3.4 End-to-End API Tests (`tests/api/e2e/`)

#### Test Scope
| Test Category | Description | Priority |
|---------------|-------------|----------|
| Complete Workflows | Full business process using all interfaces | High |
| Interface Integration | Cross-interface data consistency | High |
| User Journeys | Complete scenarios with Auth → Room → Booking | High |
| Message Integration | Contact form to Message interface flow | Medium |

#### Key Test Scenarios
- ✅ Auth → Room creation → Booking workflow
- ✅ Customer: Room search → Booking creation → Confirmation
- ✅ Admin: Auth → Room management → Booking oversight
- ✅ Contact: Message creation → Admin retrieval and deletion (integrated in E2E)
- ✅ Data consistency across Auth, Room, Booking interfaces
- ✅ ApiResponseT<T> structure validation across all endpoints
- ✅ Complete user journey with authentication, room creation, booking, messaging
- ⚠️ Token validation after logout (expected to fail but currently passes)
- ⚠️ Message deletion returns 200 instead of 204

## 4. UI Test Coverage

### 4.1 Page Object Model (`tests/ui/pages/`)

#### Page Objects Structure
```typescript
// Actual structure based on project
├── adminpage.ts                 # Admin dashboard and management
├── basepage.ts                  # Base page with common functionality
├── homepage.ts                  # Landing page with room display
└── reservationpage.ts           # Booking reservation 

#### Page Object Responsibilities
- **Element Locators**: Centralized element identification using data-testids
- **Page Actions**: User interaction methods for each interface
- **Interface Validation**: Form validation using interface structures
- **Navigation**: Inter-page navigation and state management

### 4.2 UI Test Specifications (`tests/ui/specs/`)

Test Structure

└── smokespec.ts                 # Smoke tests 

#### Test Categories Covered
- Functional API tests
- Integration tests
- End to end Api tests
- Functional UI tests (smoke test pack)

#### Test Categories Not Covered/Back log items
- Increase coverage on non-functional API tests once existing bugs are fixed and is stable
- Implement non functional UI tests (Accessibility testing) once application is stable/existing UI bugs fixed

## 5. Test Data Management

### 5.1 Fixtures (`src/fixtures/interfaces.ts`)
```typescript
// Actual interface structure from project
export interface Auth {
  username: string;
  password: string;
}

export interface Token {
  token: string;
}

export interface Room {
  roomId: number;
  roomName: string;
  type: string;
  accessible: boolean;
  image: string;
  description: string;
  features: string[];
  roomPrice: number;
}

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  bookingId?: number;
  roomId: number;
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  email?: string;        // Added email field
  phone?: string;        // Added phone field
}

export interface Message {
  messageId?: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
}

export interface ApiResponseT<T> {
  status: number;
  data: T;
  headers: Record<string, string>;
}
```

### 5.2 Data Helpers (`src/helpers/dataHelpers.ts`)
- **Test Data Generation**: Dynamic test data creation - *backlog item*
- **Data Validation**: Input data verification - *backlog item*
- **Cleanup Operations**: Test data management - *backlog item*
- **Environment Data**: Environment-specific configurations - *backlog item*

## 6. Configuration Management

### 6.1 Playwright Configurations

#### `playwright.config.ts` - Main Configuration
```typescript
// Key configuration areas
- browsers: ['chromium', 'firefox', 'webkit'] - Supports only chrome at the moment as the application is unstable
- baseURL: Environment-specific URLs
- timeout: Test execution timeouts
- retries: Retry mechanisms
- reporters: Test reporting configuration
```

#### `playwright-ui.config.ts` - UI-Specific Configuration
```typescript
// UI-specific settings
- viewport: Screen resolutions
- video: Test recording settings
- screenshot: Failure capture
- trace: Debugging traces
```

### 6.2 Environment Configurations (`src/config/`)

#### `api.config.ts`
- Base URLs for different environments
- API endpoint configurations
- Authentication settings
- Rate limiting parameters

#### `test.config.ts`
- Test execution parameters
- Data generation settings
- Cleanup configurations
- Parallel execution settings

## 7. Helper Functions and Utilities

### 7.1 Authentication Helpers (`src/helpers/authHelpers.ts`)
```typescript
// Expected helper functions
- login(username, password): Authentication
- getAuthToken(): Token retrieval
- logout(): Session termination
- validatePermissions(): Authorization checks
```

### 7.2 Request Helpers (`src/helpers/requestHelpers.ts`)
```typescript
// HTTP request utilities
- apiGet(endpoint, headers): GET requests
- apiPost(endpoint, data, headers): POST requests
- apiPut(endpoint, data, headers): PUT requests
- apiDelete(endpoint, headers): DELETE requests
```

### 7.3 Utilities (`src/utils/`)

#### Date Utils (`dateUtils.ts`)
- Date format conversions
- Date range validations
- Business date calculations

#### Validators (`validators.ts`)
- Input data validation
- Response data verification
- Business rule validation

#### Logger (`logger.ts`)
- Test execution logging
- Error tracking
- Debug information capture

## 8. Test Execution Strategy

### 8.1 Test Categories

#### Smoke Tests
```bash
npm run test:ui:smoke     # Critical UI functionality
```

#### Regression Tests
```bash
npm test                  # Full test suite
npm run test:api         # All API tests
npm run test:ui          # All UI tests
```

#### Parallel Execution
- **API tests**: Independent parallel execution - need to set this "fullyParallel: false" to true this is coming from playwright.config.ts & playwright-ui.config.ts classes
- **UI tests**: Browser-specific parallel execution
- **Cross-browser**: Parallel browser testing

## 9. Reporting and Analysis

### 9.1 Test Reports
- **Playwright HTML Report**: Interactive test results
- "report:api": "playwright show-report playwright-report/api"
- "report:ui": "playwright show-report playwright-report/ui"

## 10. Maintenance and Best Practices

### 10.1 Code Organization
- Feature-based test organization
- Shared utilities and helpers
- Consistent naming conventions
- Clear separation of concerns

### 10.2 Test Maintenance
- Regular test data refresh
- Configuration updates for environment changes
- Page object model updates for UI changes
- Helper function optimization

### 10.3 Quality Gates
- All tests must pass before deployment
- Code review for new test additions
- Performance benchmarks for test execution
- Cross-browser validation requirements

## 12. Known Issues and Test Status

### 12.1 API Issues Identified
- **Authentication**: Rate limiting returns 404 instead of 429
- **Authentication**: Token remains valid after logout (security concern)
- **Booking**: GET /booking/{bookingId} returns 405 Method Not Allowed
- **Room**: GET /room/{roomId} after deletion returns 500 instead of 404
- **Message**: DELETE /message/{messageId} returns 200 instead of 204

### 12.2 Test Fixes Marked
- `test.fixme()` used for complete auth flow test due to logout bug
- Comments indicate expected vs actual status codes throughout test suite
- Workarounds implemented for API inconsistencies

### 12.3 Non-Functional Test Coverage
- ✅ Rate limiting tests implemented
- ✅ Security testing (SQL injection, XSS prevention)
- ✅ Performance testing (response time validation)
- ✅ Input sanitization validation

## 13. Future Enhancements

### 13.1 Planned Improvements
- Visual regression testing integration
- Performance testing scenarios
- Accessibility Testing
- API contract testing
- Mobile testing capabilities