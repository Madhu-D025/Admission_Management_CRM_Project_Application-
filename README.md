  # 🎓 Admission Management & CRM System  
### Simple BRS – Minimal Version

A lightweight, rule-driven **web-based Admission Management System** designed to manage academic configuration, applicants, quota-based seat allocation, admission confirmation, and real-time dashboards — with strict enforcement of business rules.

---

## 📌 Project Overview

This system is built based on a **Minimal Business Requirement Specification (BRS)** focusing strictly on core admission workflow functionality.

The application ensures:

- No seat overbooking
- Strict quota-wise seat control
- Real-time seat tracking
- Unique & immutable admission numbers
- Admission confirmation only after fee payment
- Transparent dashboard reporting

This is a **clean MVP-level implementation** intended for institutions that require controlled, structured admission processing.

---

# 🎯 Business Objectives

- Eliminate manual admission errors
- Prevent quota violations
- Enforce structured admission workflow
- Provide real-time visibility of seat status
- Ensure admission confirmation only after fee payment
- Maintain institutional data consistency

---

# 🧩 Scope of Implementation

## 1️⃣ Master Setup Module

Admin can configure:

- Institution  
- Campus  
- Department  
- Program / Branch  
- Academic Year  
- Course Type (UG / PG)  
- Entry Type (Regular / Lateral)  
- Admission Mode (Government / Management)  

---

## 2️⃣ Seat Matrix & Quota Management (Core Engine)

For each Program:

- Define Total Intake
- Configure Quotas:
  - KCET
  - COMEDK
  - Management
- Optional Supernumerary seats
- Institution-level intake cap support

### Enforced System Rules

- Total quota seats must equal total intake
- Seat allocation blocked when quota is full
- Real-time seat counter updates
- No overbooking allowed under any condition

This module is transaction-safe and rule-enforced at the backend level.

---

## 3️⃣ Applicant Management

Applicant form (Max 15 fields):

- Basic Details
- Category (GM / SC / ST / OBC etc.)
- Entry Type
- Quota Type
- Marks / Qualifying Exam
- Document Checklist Status:
  - Pending
  - Submitted
  - Verified

Includes duplicate validation and structured tracking.

---

## 4️⃣ Admission Allocation

### Government Admission Flow

1. Create Applicant  
2. Enter Allotment Number  
3. Select Quota  
4. System validates seat availability  
5. Seat locked  

### Management Admission Flow

1. Create Applicant  
2. Select Program & Management quota  
3. Validate availability  
4. Allocate seat  

Allocation is automatically blocked if quota is full.

---

## 5️⃣ Admission Confirmation

Admission is confirmed only when:

- Documents are verified  
- Fee status = Paid  

### Admission Number Format

```
INST/2026/UG/CSE/KCET/0001
```

Rules:

- System-generated
- Globally unique
- Immutable
- Generated only once
- Created only after fee confirmation

---

## 6️⃣ Fee Status Module (Simple)

Fee States:

- Pending
- Paid

Seat is officially confirmed only when:

```
Fee Status = Paid
```

> Note: Payment gateway integration is out of scope.

---

## 7️⃣ Dashboard (Role-Based)

Displays:

- Total intake vs admitted
- Quota-wise filled seats
- Remaining seats
- Applicants with pending documents
- Fee pending list

Dashboard updates dynamically based on real-time data.

---

# 👥 User Roles

## Admin
- Configure masters
- Define quotas & intake
- Manage institutional setup
- View dashboard

## Admission Officer
- Create applicants
- Allocate seats
- Verify documents
- Mark fee status
- Confirm admission

## Management (View Only)
- Monitor dashboards
- Track seat filling progress
- Review pending documents & fees

---

# 🧭 User Journeys

## System Setup

Admin →  
Create Institution → Campus → Department → Program → Intake → Configure Quotas  

---

## Government Admission Journey

Admission Officer →  
Create Applicant →  
Enter Allotment Details →  
Select Quota →  
Seat Availability Validation →  
Seat Locked →  
Documents Verified →  
Fee Paid →  
Admission Number Generated  

---

## Management Admission Journey

Admission Officer →  
Create Applicant →  
Select Program & Management Quota →  
Validate Availability →  
Allocate Seat →  
Verify Documents →  
Fee Paid →  
Admission Confirmed  

---

## Monitoring Journey

Management →  
Login →  
View Dashboard →  
Check Filled Seats →  
Check Remaining Quota →  
Check Pending Fees/Documents  

---

# 🔐 Core System Rules (Strictly Enforced)

1. Quota seats cannot exceed total intake  
2. No seat allocation if quota is full  
3. Admission number generated only once  
4. Admission confirmed only if fee is paid  
5. Seat counters update in real time  
6. Confirmed admissions cannot be edited  

---

# 🏗 Suggested Technical Architecture

## Backend
- Node.js / Spring Boot / .NET Core
- REST APIs
- Role-based Authentication (JWT / Session)

## Frontend
- React / Angular / Vue
- Responsive UI

## Database
- PostgreSQL / MySQL

---

# 🗂 High-Level Data Model

### Program
- id
- department_id
- course_type
- entry_type
- intake
- academic_year

### Seat Matrix
- program_id
- quota_type
- total_seats
- filled_seats

### Applicant
- id
- name
- category
- quota_type
- entry_type
- marks
- document_status
- fee_status

### Admission
- applicant_id
- program_id
- quota_type
- admission_number
- status

---

# 🚫 Out of Scope

- Payment Gateway Integration  
- SMS / WhatsApp Notifications  
- Advanced CRM  
- AI-based predictions  
- Multi-college complexity  
- Marketing automation  
- Advanced analytics  

---

# 🚀 Expected Deliverable

A functional web application with:

- Master Setup
- Applicant Form
- Seat Allocation with Quota Validation
- Admission Confirmation Workflow
- Basic Real-Time Dashboard

---

# 🔄 Future Enhancements (Phase 2 – Optional)

- Online payment integration
- Export reports (Excel/PDF)
- Audit logs
- Multi-institution support
- Notification system
- Advanced analytics dashboard

---

# 📜 License

This project is intended for academic/institutional use.  
License type can be updated based on organizational policy.

---

# 👨‍💻 Author

Developed as a Minimal Admission Workflow System  
Focused on strict quota control and rule-based validation.

---
