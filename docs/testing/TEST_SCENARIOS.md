# CoviTrack Automated Test Scenarios Catalog

| Scenario ID | Category | Scenario Description | Expected Outcome |
|---|---|---|---|
| **TC-01** | Registration | Successful registration with valid data | Account created, unique Patient ID generated |
| **TC-02** | Registration | Mandatory fields left blank | Validation error messages displayed, submission halted |
| **TC-03** | Registration | Invalid email format | Regex validation error displayed |
| **TC-04** | Registration | Invalid mobile number (< 10 digits) | Rejection: exactly 10 digits required |
| **TC-05** | Registration | Invalid full name with digits/symbols | Rejection: alphabetical characters only |
| **TC-06** | Registration | Missing or incorrect date of birth format | Date validation error displayed |
| **TC-07** | Registration | Future date of birth entered | Rejection: DOB must be in the past |
| **TC-08** | Registration | Password and confirmation mismatch | Rejection: passwords must match |
| **TC-09** | Registration | Duplicate email registration attempt | Rejection: email already exists in MySQL |
| **TC-10** | Registration | Duplicate mobile registration attempt | Rejection: mobile number already exists |
| **TC-11** | Authentication | Valid credentials login | HTTP-only cookie issued, redirected to dashboard |
| **TC-12** | Authentication | Incorrect password | Rejection: invalid credentials alert |
| **TC-13** | Authentication | Non-existent email login | Rejection: invalid credentials alert |
| **TC-14** | Authentication | Empty login submission | Validation alert displayed |
| **TC-15** | Authentication | User session logout | Cookie cleared, redirected to /login |
| **TC-16** | Authentication | Access protected page after logout | Guard intercepts request and redirects to /login |
| **TC-17** | Authentication | Unauthorized role route access | Access forbidden, redirected to role homepage |
| **TC-18** | Appointments | Successful appointment booking | Booking reference issued, slot count incremented |
| **TC-19** | Appointments | Booking without selecting a slot | Submission prevented |
| **TC-20** | Appointments | Attempting to book an inactive slot | Inactive slots hidden and rejected by backend |
| **TC-21** | Appointments | Attempting to book a past slot | Past slots rejected by backend validation |
| **TC-22** | Appointments | Preventing bookings beyond slot capacity | Concurrency check prevents overbooking |
| **TC-23** | Appointments | Patient appointment cancellation | Status set to cancelled, slot count decremented |
| **TC-24** | Appointments | Staff appointment confirmation | Status transitioned from booked to confirmed |
| **TC-25** | Appointments | Staff appointment completion | Status transitioned to completed |
| **TC-26** | Patient Mgmt | Display registered patients | Staff registry table displays patient list |
| **TC-27** | Patient Mgmt | Search by Patient ID | Filters table to matching Patient ID |
| **TC-28** | Patient Mgmt | Search by mobile number | Filters table to matching 10-digit mobile |
| **TC-29** | Patient Mgmt | Search by full name | Filters table by name substring |
| **TC-30** | Patient Mgmt | Unauthorized access to patient directory | Regular patients blocked from /staff/patients |
| **TC-31** | Reports | Diagnostic report creation | Report reference issued, saved to database |
| **TC-32** | Reports | Report retrieval by patient | Patient views issued test result on portal |
| **TC-33** | Reports | Cross-patient report access attempt | Server returns HTTP 403 Forbidden |
| **TC-34** | Reports | Printable PDF report download | Streams PDF with Content-Type application/pdf |
| **TC-35** | Reports | Duplicate report creation for same appointment | Rejection: one report per appointment |
| **TC-36** | Regex | Valid full name | Matches `^[A-Za-z\s]{3,50}$` |
| **TC-37** | Regex | Invalid full name (< 3 chars, digits, symbols) | Fails regex pattern |
| **TC-38** | Regex | Valid email format | Matches RFC email pattern |
| **TC-39** | Regex | Invalid email format | Fails email regex pattern |
| **TC-40** | Regex | Valid 10-digit mobile number | Matches `^[0-9]{10}$` |
| **TC-41** | Regex | Mobile number shorter than 10 digits | Fails mobile regex pattern |
| **TC-42** | Regex | Mobile number with alphabetic characters | Fails mobile regex pattern |
| **TC-43** | Regex | Valid 12-digit synthetic identifier | Matches `^[0-9]{12}$` |
| **TC-44** | Regex | Invalid 12-digit identifier length | Fails synthetic ID regex pattern |
| **TC-45** | Regex | Valid date format DD-MM-YYYY | Matches date regex and Gregorian calendar |
| **TC-46** | Regex | Invalid date format (slash separator) | Fails date regex pattern |
| **TC-47** | Regex | Impossible calendar date (31-02-2024, 29-02-2023) | Fails Gregorian calendar validation |

