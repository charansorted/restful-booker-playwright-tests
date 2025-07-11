## Critical & High Priority API Bugs - Restful Booker Platform

CRIT-API-001: SQL Injection in Booking Search Parameters
Endpoint: GET /booking/?firstname={value}&lastname={value}
Severity: Critical
CVSS: 9.8
Description: SQL injection vulnerability in booking search parameters
Payload:
GET /booking/?firstname=admin'/**/UNION/**/SELECT/**/1,version(),3,4--+-
Impact:
Database information disclosure
Potential database compromise
Access to sensitive booking data
Evidence: Database version information returned in response
Remediation: Use parameterized queries, input validation

-------------------------------------------------------------------------------------
CRIT-API-002: Authentication Bypass via SQL Injection
Endpoint: POST /auth/login
Severity: Critical
CVSS: 9.8
Description: Authentication can be bypassed using SQL injection in login parameters
Payload:
{  "username": "admin'/**/OR/**/1=1--+-",  "password": "anything"}
Impact:
Complete authentication bypass
Unauthorized admin access
Full system compromise
Evidence: Valid authentication token returned without valid credentials
Remediation: Implement proper authentication validation


-------------------------------------------------------------------------------------

CRIT-API-003: Stored XSS in Booking Creation
Endpoint: POST /booking/
Severity: Critical
CVSS: 8.8
Description: Persistent XSS vulnerability in booking fields
Payload:
{  "firstname": "<script>alert('XSS')</script>",  "lastname": "<img src=x onerror=alert(document.cookie)>",  "totalprice": 111,  "depositpaid": true,  "bookingdates": {    "checkin": "2024-01-01",    "checkout": "2024-01-02"  }}
Impact:
Session hijacking
Account takeover
Malicious script execution
Evidence: Script executes when booking data is viewed
Remediation: Input sanitization, output encoding


-------------------------------------------------------------------------------------
CRIT-API-004: Broken Object Level Authorization (BOLA)
Endpoint: GET /booking/{id}, PUT /booking/{id}, DELETE /booking/{id}
Severity: Critical
CVSS: 8.1
Description: Users can access, modify, or delete any booking by changing the ID
Payload:
GET /booking/1PUT /booking/2 (modify other user's booking)DELETE /booking/3 (delete other user's booking)
Impact:
Unauthorized data access
Data manipulation
Data deletion
Evidence: Can access any booking ID without proper authorization
Remediation: Implement proper authorization checks


-------------------------------------------------------------------------------------
CRIT-API-005: Remote Code Execution via File Upload
Endpoint: POST /room/ (if file upload is supported)
Severity: Critical
CVSS: 9.8
Description: Unrestricted file upload leading to RCE
Payload: Upload PHP/JSP shell disguised as image
Impact:
Complete server compromise
Data exfiltration
Service disruption
Evidence: Malicious files executed on server
Remediation: File type validation, sandboxing


-------------------------------------------------------------------------------------

CRIT-API-006: IDOR in Room Management
Endpoint: GET /room/{id}, PUT /room/{id}, DELETE /room/{id}
Severity: High
CVSS: 7.1
Description: Insecure Direct Object References in room management
Payload:
GET /room/1, /room/2, /room/3 (enumerate all rooms)PUT /room/1 (modify any room)DELETE /room/2 (delete any room)
Impact:
Unauthorized room access
Room data manipulation
Business logic bypass
Evidence: Can access any room regardless of ownership
Remediation: Proper authorization controls


-------------------------------------------------------------------------------------

CRIT-API-007: Business Logic Bypass in Booking Dates
Endpoint: POST /booking/, PUT /booking/{id}
Severity: High
CVSS: 6.8
Description: Booking validation can be bypassed
Payload:
{  "bookingdates": {    "checkin": "2024-12-31",    "checkout": "2024-01-01"  }}
Impact:
Invalid bookings created
Business rule violations
Data integrity issues
Evidence: Checkout date before checkin date accepted
Remediation: Proper business logic validation