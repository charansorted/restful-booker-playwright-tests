## Critical & High Priority UI Bugs - Restful Booker Platform


CRIT-UI-001: Intermittent Site Availability Issues
Severity: Critical
Status: Resolved (June 2024)
Description: Platform experienced complete unavailability with blank screen loading
Root Cause: Cloudflare library issues and insufficient server resources
Resolution: Dependencies updated and server instances upgraded
Impact: Complete service disruption affecting all testing activities

-------------------------------------------------------------------------------------

CRIT-UI-002: Calendar Booking Functionality Issues
Severity: High
Priority: High
Description: Multiple calendar-related issues including inability to cancel bookings and unintuitive date selection
Specific Issues:
Can only book on 1 page of calendar
Can't cancel booking by clicking on the blue row
Cannot choose dates by clicking on squares, only on data
Date selection in calendar is not clickable
Impact: Major booking functionality impaired
User Experience: Poor, confusing interface

-------------------------------------------------------------------------------------

CRIT-UI-003: Error Message Quality Issues
Severity: High
Priority: High
Description: Error messages are inconsistent, unclear, and poorly formatted
Specific Issues:
Error messages are not clear, sometimes wrong, inconsistent
Shows 2 error messages about empty message-field and subject - same field two error messages
Error message order varies with same input
Error messages are not consistent with style capitalising
"Must not be null" error message in Book this room is not clear
Impact: User confusion, poor error recovery experience

-------------------------------------------------------------------------------------

CRIT-UI-004: Contact Form Validation Problems
Severity: Medium
Priority: High
Description: Contact form has multiple validation and usability issues
Specific Issues:
Phone number range is weird - whose number is 11-22 characters?
Message range is weird 20-2000 prevents shorter messages
Email doesn't require the "." (incomplete email validation)
Can input everything to Phone Number (no phone validation)
Impact: Poor data quality, potential security issues