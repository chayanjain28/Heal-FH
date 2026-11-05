# MEETING 2: LITERATURE SURVEY & SYSTEM DESIGN
## HEAL FROM HOME (Heal-FH)
### Intelligent Post-Discharge Remote Patient Monitoring & Care Companion

---

## 🖥️ SLIDE 1: TITLE SLIDE
- **Project Title:** Heal From Home (Heal-FH): An Intelligent Post-Discharge Remote Patient Monitoring and Healthcare Companion System
- **Meeting Focus:** Meeting 2 – Literature Survey & System Design
- **Department:** Department of Computer Science & Engineering, Faculty of Engineering
- **Institution:** Medi-Caps University, Indore
- **Team Members:**
  - `<Student 1 Name>` (`<Roll No 1>`)
  - `<Student 2 Name>` (`<Roll No 2>`)
  - `<Student 3 Name>` (`<Roll No 3>`)
- **Under the Guidance of:** `<Name of Guide(s)>`, `<Designation>`
- **Academic Session:** August – December 2026

---

## 🖥️ SLIDE 2: LITERATURE SURVEY / RELATED WORK
- **Liu et al. (IEEE Access, 2025):** Systematic review of LLMs in healthcare. Confirms Transformer models excel in clinical Q&A and summarization; highlights hallucination risks, black-box decisions, and HIPAA privacy rules.
- **Patel et al. (Nature Sci Rep, 2023):** Randomized clinical trial ($n=500$). Proved static discharge data yields poor 30-day readmission prediction (AUC 0.60–0.70), while post-discharge remote patient monitoring (RPM) of vitals, activity, and sleep boosts predictive AUC to **0.85**.
- **Yashwanth & Shettar (IEEE Access, 2024):** Few-shot LLM prompt engineering achieved **99% accuracy** in redacting 18 HIPAA PHI identifiers from clinical narratives, reducing token costs tenfold ($0.003 vs $0.03/1K).
- **Sai et al. (IEEE Access, 2024):** Generative AI applications in clinical triage, medical report summarization, and virtual assistants; emphasizes human-in-the-loop validation with doctor oversight.

---

## 🖥️ SLIDE 3: EXISTING TECHNOLOGIES VS. HEAL FROM HOME
- **Paper Discharge Portals:** Static, jargon-dense discharge instructions leading to poor patient comprehension, missed warning signs, and medication non-adherence.
- **Traditional Telemedicine (Practo, Teladoc):** Purely episodic, reactive video calls with no continuous vitals tracking or proactive post-acute recovery monitoring.
- **Consumer Health Trackers (Fitbit, Apple Health):** Focus on fitness metrics without clinical threshold alerting, medical report parsing, or doctor connectivity.
- **The Heal From Home Solution:** An end-to-end companion combining daily vitals logging, dynamic recovery scoring ($0$–$100$), automated high-risk alerting, Generative AI report simplification, and verified doctor booking.

---

## 🖥️ SLIDE 4: PROPOSED SYSTEM ARCHITECTURE
- **Presentation Tier (React 18 SPA):** Glassmorphic UI, Chart.js interactive vital trends, MedAI chat drawer, and report upload console.
- **Application & API Gateway Tier (Python / Node.js Engine):** JWT authentication, role-based authorization (Patient, Doctor, Caregiver), alert dispatching, and appointment management.
- **Intelligence Tier (AI/ML Services):** High-speed LLM inference (Gemini API / LLaMA engine) for structured clinical JSON extraction, HIPAA PHI de-identification, and rule-based risk prediction.
- **Persistence Tier (Database):** ACID-compliant relational storage (SQLite / PostgreSQL) or document database (MongoDB) indexed for fast longitudinal time-series retrieval.

---

## 🖥️ SLIDE 5: TECHNOLOGY STACK
- **Frontend:** React.js (React 18), React Router v6, Chart.js, Framer Motion, Vanilla CSS Glassmorphism.
- **Backend API:** Python (FastAPI / Flask) or Node.js (Express.js RESTful API).
- **Database:** SQLite (Lightweight, ACID-compliant relational storage) / MongoDB.
- **Generative AI Engine:** Gemini API / GROQ LPU Inference (Sub-second clinical report parsing, JSON schema extraction, conversational care).
- **Security & Authentication:** JWT (JSON Web Tokens), bcrypt salted hashing, CORS, Helmet security headers, rate limiting.

---

## 🖥️ SLIDE 6: SYSTEM WORKFLOW
1. **Hospital Discharge:** Patient receives initial post-discharge care profile and target metrics.
2. **Daily Health Logging:** Patient records systolic/diastolic BP, pulse, $\text{SpO}_2$, temperature, pain score (0–10), and sleep.
3. **Dual Risk Evaluation:**
   - *Clinical Rule Engine:* Checks critical thresholds ($\text{SpO}_2 < 93\%$, $\text{BP} > 160$, $\text{Temp} > 38.5^\circ\text{C}$) $\rightarrow$ triggers immediate high/medium alerts.
   - *Recovery Algorithm:* Re-evaluates 7-day rolling data to update the 0–100 Recovery Score.
4. **AI Report Demystification:** Uploaded lab reports/discharge PDFs are de-identified and parsed into structured cards (Meds, Diagnoses, Plain Summary).
5. **Specialist Tele-Consultation:** High-risk scores or patient queries seamlessly transition to verified doctor appointment booking.

---

## 🖥️ SLIDE 7: USE CASE MODEL
- **Actors:** Patient (Primary), Doctor (Clinical Reviewer), Caregiver (Support Monitor), AI Service (Machine Actor).
- **Primary Use Cases:**
  - `UC01`: Register & Login (JWT Authentication)
  - `UC02`: Log Daily Vitals & Symptoms
  - `UC03`: Trigger Automated Smart Health Alerts (<<include>>)
  - `UC04`: View Dynamic Recovery Score Dashboard
  - `UC05`: Upload & Analyze Medical Report via AI (<<include>> Redact PHI)
  - `UC06`: 24/7 MedAI Conversational Support
  - `UC07`: Search Specialists & Schedule Appointments
  - `UC08`: Physician Review of Longitudinal Vitals & Care Plan Management

---

## 🖥️ SLIDE 8: DATA FLOW DIAGRAMS (DFD)
- **Context Level (DFD Level 0):** High-level data boundaries between Patient, Doctor, Caregiver, and External AI Engine interacting with the Heal From Home system.
- **Decomposed Subsystems (DFD Level 1):**
  - `Process 1.0:` Authentication & Token Manager $\rightarrow$ Users Store (`D1`)
  - `Process 2.0:` Vitals Ingestion & Boundary Checks $\rightarrow$ HealthLogs Store (`D2`)
  - `Process 3.0:` 7-Day Dynamic Recovery Scoring Engine $\rightarrow$ Real-Time Score Gauge
  - `Process 4.0:` Clinical Threshold Alert Engine $\rightarrow$ Alerts Store (`D3`) & Push Notifications
  - `Process 5.0:` PHI Sanitization & AI Report Analyzer $\rightarrow$ MedicalReports Store (`D4`)
  - `Process 6.0:` Doctor Discovery & Booking Engine $\rightarrow$ Appointments Store (`D5`)

---

## 🖥️ SLIDE 9: KEY INNOVATIONS & CONCLUSION
- **Multi-Parametric Dynamic Scoring:** Quantifies recovery across Vitals ($30\%$), Symptoms/Pain ($20\%$), Activity ($20\%$), Sleep ($15\%$), and Medication Adherence ($15\%$).
- **Deterministic Alert Safety:** Life-threatening vital drops bypass LLMs and trigger immediate deterministic alerts.
- **Privacy First:** 18 HIPAA PHI identifiers redacted prior to AI cloud inference.
- **Status:** Complete architecture, schema design, and UI wireframes ready; progressing into full multi-modal report OCR and IoT Bluetooth sync in the next phase.
