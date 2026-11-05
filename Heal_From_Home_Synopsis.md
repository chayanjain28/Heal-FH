# HEAL FROM HOME: AN INTELLIGENT POST-DISCHARGE REMOTE PATIENT MONITORING AND HEALTHCARE COMPANION SYSTEM USING MACHINE LEARNING AND GENERATIVE AI

**A Synopsis for Project-1**  
**BACHELOR OF TECHNOLOGY in COMPUTER SCIENCE & ENGINEERING**

**BY**  
- **<Name of Student 1>** (University Roll No: **<Roll No 1>**)  
- **<Name of Student 2>** (University Roll No: **<Roll No 2>**)  
- **<Name of Student 3>** (University Roll No: **<Roll No 3>**)  

**Under the Guidance of**  
**<Name of the Guide(s)>**  
*<Designation / Department of Computer Science & Engineering>*  

---

**Department of Computer Science & Engineering, Faculty of Engineering**  
**MEDICAPS UNIVERSITY, INDORE - 453331**  
**August - December 2026**  

---

## 1. INTRODUCTION

Hospital-to-home transitions represent one of the most clinically vulnerable intervals in patient healthcare delivery. Epidemiological and health services research indicates that nearly one in every five patients (approximately 20%) discharged from acute inpatient medical services is readmitted to the hospital within thirty days [2]. This high incidence of unplanned readmissions imposes an immense clinical, psychological, and financial burden on patients, families, and healthcare infrastructures globally. The fundamental driver of avoidable readmissions is the persistent "transitional care disconnect" — the sudden cessation of continuous clinical oversight once the patient departs the hospital. At home, patients and family caregivers are abruptly expected to manage complex pharmacological regimens, track vital signs without specialized clinical training, interpret dense discharge summaries, and identify subtle physiological deterioration before it escalates into life-threatening emergencies.

Recent breakthroughs in Artificial Intelligence (AI), Natural Language Processing (NLP), and Connected Health provide transformative opportunities to bridge this transitional gap [1], [4]. Specifically, Large Language Models (LLMs) built upon Transformer architectures [5] have demonstrated state-of-the-art capabilities in medical text comprehension, clinical summarization, and interactive conversational guidance [1]. Simultaneously, clinical research has proven that Remote Patient Monitoring (RPM) capturing post-discharge daily activity patterns, sleep metrics, and longitudinal physiological parameters drastically enhances the predictive accuracy of hospital readmission models when analyzed using modern non-parametric machine learning techniques [2]. Furthermore, prompt-engineered and fine-tuned LLM architectures have established reliable mechanisms to de-identify Protected Health Information (PHI) under HIPAA regulations [3], ensuring strict patient privacy during automated clinical data processing.

Motivated by these foundational insights, this project develops **"Heal From Home" (Heal-FH)** — a full-stack, production-ready, intelligent post-discharge care companion platform. Heal From Home establishes a continuous digital ecosystem connecting recovering patients, caregivers, and attending physicians. The platform integrates continuous vital signs logging (blood pressure, heart rate, oxygen saturation, temperature, pain levels), an automated dynamic recovery scoring algorithm (0–100 index), clinical threshold-based complication risk stratification, and high-speed Generative AI (GROQ-accelerated LLaMA-3.3-70B). Through its AI-powered modules, Heal From Home decodes complex medical discharge summaries into actionable, plain-language patient guides, redacts sensitive identifiers for privacy preservation, delivers 24/7 conversational recovery guidance via "MedAI", and provides verified doctor discovery and tele-appointment scheduling.

---

## 2. LITERATURE REVIEW

The conceptual and technical foundation of "Heal From Home" is derived from rigorous cross-disciplinary literature at the intersection of medical natural language processing, post-discharge remote monitoring clinical trials, privacy-preserving LLM de-identification, and generative AI healthcare applications:

- **Liu et al. (2025) [1]** conducted a comprehensive systematic literature review evaluating the architecture, training frameworks, and clinical deployment of Large Language Models in healthcare across SCI-indexed literature. The authors established that Transformer-based pre-trained models (such as BioBERT, Clinical BERT, Med-PaLM 2, and Huatuo-GPT) demonstrate exceptional generalization across downstream clinical tasks, including disease diagnosis, clinical decision support, medical knowledge popularization, and automated discharge summarization. The review highlighted critical open challenges, most notably the "black-box" interpretability problem, the heterogeneity of structured and unstructured Electronic Health Record (EHR) data, strict data privacy compliance (HIPAA and GDPR), and the hazard of medical hallucination. Liu et al. emphasized that clinical language models must be paired with domain-specific prompting, honest expert validation, and constrained decoding to ensure patient safety. Heal From Home directly implements these recommendations by employing zero/few-shot structured JSON schemas, deterministic risk-alerting safeguards, and mandatory physician consultation disclaimers.

- **Patel et al. (2023) [2]** conducted a pivotal two-arm randomized clinical trial (the PREDICT trial) across 500 hospitalized patients discharged from inpatient medicine services at two Penn Medicine hospitals to evaluate whether remote patient monitoring (RPM) activity data collected post-discharge improves 30-day hospital readmission prediction. The authors demonstrated that conventional parametric regression models (logistic regression and Lasso) relying solely on static electronic health record data available at discharge achieved poor predictive discrimination, with Area Under the Receiver Operating Characteristic Curve (AUC) values ranging between 0.60 and 0.70. However, when models incorporated remotely monitored post-discharge behavioral data — specifically daily step counts, physical activity intensity minutes, sleep duration, and daily vitals — paired with non-parametric machine learning approaches (Random Forest, Gradient Boosting, and Ensemble Learning), predictive accuracy increased substantially to an AUC of 0.84 to 0.85 (P < 0.001). This empirical proof establishes that tracking patient behavior and vitals dynamically after discharge is crucial for anticipating deterioration. Heal From Home builds directly upon Patel et al.’s findings by incorporating daily vitals, physical activity levels, sleep duration, and medication adherence into its real-time multi-factorial recovery scoring engine.

- **Yashwanth and Shettar (2024) [3]** investigated zero-shot and few-shot learning methodologies using Large Language Models (including GPT-3.5, GPT-4, PaLM, and LLaMA) for automated de-identification of Protected Health Information (PHI) from unstructured clinical narratives based on the 2014 i2b2/UTHealth benchmark dataset. The authors demonstrated that few-shot fine-tuning with as few as 30 to 50 domain-specific examples enabled models to achieve over 99% entity-wise de-identification accuracy across all 18 HIPAA identifier categories, outperforming zero-shot counterparts and demonstrating strong resilience against diverse medical record formats. Furthermore, the authors demonstrated that fine-tuning smaller, specialized models resulted in a tenfold reduction in operational API token costs compared to larger closed-source models ($0.003 vs $0.03 per 1K tokens), making scalable, privacy-preserving automated clinical report processing practically viable. Heal From Home incorporates these prompt engineering and de-identification principles within its Medical Report Analyzer module to sanitize uploaded discharge summaries and clinical documents before AI synthesis, upholding patient data confidentiality.

- **Sai et al. (2024) [4]** presented an extensive survey on the transformative applications and limitations of Generative AI across diverse healthcare domains. The study explored how foundational models (including Med-PaLM, BioGPT, BART, and ChatGPT) facilitate medical chatbots, clinical documentation summarization, medication administration guidance, and clinical triage support. Crucially, Sai et al. analyzed key systemic bottlenecks, including the "attribution problem" (the difficulty of elucidating AI decision rationale), contextualization deficits, data bias, and regulatory liabilities. The authors underscored the necessity of a "human-in-the-loop" paradigm where generative AI acts as an assistive companion that augments human clinical competence rather than replacing it. In Heal From Home, this principle is strictly instantiated: the AI assistant (MedAI) provides patient-friendly educational explanations and structured report breakdowns, while serious clinical risks trigger deterministic alerts and direct patients to book consultations with verified medical specialists.

### Table 1: Comprehensive Synthesis and Comparative Analysis of Referenced Literature

| Reference & Year | Core Methodology & Domain | Key Findings & Benchmarks | Integration in Heal From Home |
|---|---|---|---|
| **Liu et al. (2025) [1]** *IEEE Access* | Systematic Literature Review of LLMs in healthcare (Transformer, Pre-training, Fine-tuning, Prompting). | LLMs achieve expert-level medical Q&A; identifies hallucination, black-box, and HIPAA privacy risks. | Guides prompt engineering, structured JSON extraction schemas, and physician disclaimer safeguards. |
| **Patel et al. (2023) [2]** *Scientific Reports* | Randomized clinical trial (n=500) using post-discharge RPM (smartphones/wearables) & non-parametric ML. | Adding RPM activity/sleep/vitals to ML models boosted 30-day readmission prediction AUC from 0.63 to 0.85. | Forms the empirical foundation of the 5-component dynamic Recovery Score & daily vital logging. |
| **Yashwanth & Shettar (2024) [3]** *IEEE Access* | Zero-shot & few-shot LLM de-identification of 18 HIPAA PHI identifiers on i2b2/UTHealth clinical records. | Few-shot prompt-tuned models reached 99% accuracy; achieved 10x cost reduction per 1K tokens. | Establishes the privacy-preserving sanitization protocol for patient report upload & processing. |
| **Sai et al. (2024) [4]** *IEEE Access* | Comprehensive study of Generative AI, healthcare LLMs (Med-PaLM, BioGPT), chatbots, and triage. | Identifies attribution, data bias, and safety issues; mandates human-in-the-loop clinical supervision. | Directs MedAI conversational companion design and seamless integration with doctor appointment booking. |

---

## 3. PROBLEM DEFINITION

The transition from acute hospital inpatient care to self-management at home is fraught with structural, clinical, and informational vulnerabilities that precipitate high readmission rates and adverse health outcomes:

1. **Lack of Real-Time Post-Discharge Monitoring:** Conventional healthcare operates on episodic, reactive care. Once discharged, patients are unmonitored until their scheduled follow-up visit (typically 2 to 4 weeks later). Physiological deterioration (such as dropping SpO2, worsening hypertension, or spiking fever) often occurs silently, leaving no opportunity for early outpatient intervention.
2. **Complex Discharge Instructions and Poor Medical Comprehension:** Discharge summaries and diagnostic lab reports are filled with intricate medical terminology, Latin abbreviations, and dense clinical phrasing. Patients and elderly caregivers struggle to decipher medication regimens, dosage frequencies, activity restrictions, and red-flag symptoms, directly causing medication non-adherence and therapeutic failure.
3. **Ineffective Complication Risk Stratification:** As demonstrated by Patel et al. [2], static discharge-time EHR data alone cannot reliably predict post-discharge complications (AUC 0.60–0.70). Existing patient portals lack intelligent multi-parametric scoring algorithms capable of synthesizing vitals, activity levels, sleep duration, and medication adherence into an actionable recovery index.
4. **Data Privacy Concerns in Automated Clinical Processing:** As identified by Liu et al. [1] and Yashwanth & Shettar [3], deploying AI in healthcare without strict de-identification risks catastrophic leaks of Protected Health Information (PHI), violating statutory HIPAA and GDPR mandates.
5. **Absence of an Integrated Care Ecosystem:** Current solutions are fragmented: telemedicine apps offer only synchronous video calls, fitness wearables record raw step counts without clinical context, and patient portals act as static document repositories without intelligent conversational guidance or direct doctor discovery.

---

## 4. OBJECTIVES

The primary aim of "Heal From Home" is to develop and deploy an end-to-end, intelligent, full-stack post-discharge healthcare companion platform that continuously tracks patient recovery, predicts clinical complications, demystifies medical records through Generative AI, and connects patients with verified physicians. The specific objectives are as follows:

- **Objective 1: Full-Stack Web Platform Architecture:** Design and engineer a responsive, accessible, production-ready web application using the MERN stack (MongoDB, Express.js, React 18, Node.js) featuring modern glassmorphic design and light/dark mode adaptability.
- **Objective 2: Multi-Parametric Dynamic Recovery Score (0–100):** Formulate and implement an automated 5-component recovery index synthesizing vitals (30%), symptoms/pain (20%), physical activity (20%), sleep patterns (15%), and medication adherence (15%) to quantify patient healing trajectories over a rolling 7-day window.
- **Objective 3: Clinical Threshold Complication Predictor & Smart Alerting:** Implement a rule-based clinical risk engine that continuously monitors physiological thresholds (SpO2 < 93%, abnormal heart rates, severe hypertension, fever > 38.5°C, high pain scores) and automatically generates categorized (High/Medium/Low) alerts with immediate remedial recommendations.
- **Objective 4: Generative AI Medical Report Analyzer:** Integrate the high-speed GROQ API (LLaMA-3.3-70B) to parse uploaded medical reports and clinical text, automatically extracting structured JSON entities (medications, diagnoses, lab values, restrictions, follow-ups) and generating a plain-language summary for patient understanding.
- **Objective 5: 24/7 Conversational Care Assistant (MedAI):** Deploy an intelligent, context-aware AI chatbot equipped with conversational history memory, medical knowledge dissemination, and strict safety guardrails prioritizing clinical consultation for alarming symptoms.
- **Objective 6: HIPAA-Aligned Privacy & Role-Based Security:** Incorporate JSON Web Token (JWT) authentication, bcrypt password hashing, role-based authorization (Patient, Doctor, Caregiver, Admin), and prompt-based PHI de-identification mechanisms to guarantee data confidentiality.
- **Objective 7: Doctor Discovery & Appointment Management System:** Build an interactive directory of verified medical specialists searchable by specialization, consultation fee, and rating, complete with date/time slot booking and status tracking.

---

## 5. METHODOLOGY

The methodology of "Heal From Home" follows an agile, modular software engineering paradigm grounded in clinical data science and modern AI integration. The architecture is organized into four distinct tiers:

### 5.1 System Architecture

```
+-----------------------------------------------------------------------------------+
|                        PRESENTATION LAYER (React 18)                              |
|   Glassmorphic UI | Chart.js Vitals Trends | MedAI Chat | Report Analyzer Upload   |
+-----------------------------------------+-----------------------------------------+
                                          | REST API (Axios / JSON)
                                          v
+-----------------------------------------------------------------------------------+
|                     APPLICATION & API LAYER (Node.js / Express)                   |
|   JWT Authentication | Role-Based Access Control | Alert Engine | Health Logging   |
+-------------------+-------------------------------------+-------------------------+
                    |                                     |
                    v                                     v
+---------------------------------------+   +---------------------------------------+
|     INTELLIGENCE LAYER (AI / ML)      |   |       PERSISTENCE LAYER (MongoDB)     |
|   • GROQ API (LLaMA-3.3-70B Engine)   |   |   • Users & Profiles                  |
|   • Report JSON Entity Extraction     |   |   • Health Logs & Vitals              |
|   • 5-Factor Dynamic Recovery Score   |   |   • Prescriptions & Adherence Logs    |
|   • Rule-Based Complication Engine    |   |   • Doctors, Records & Appointments   |
+---------------------------------------+   +---------------------------------------+
```

1. **Presentation Layer (Frontend):** Built with React 18, React Router v6, and Framer Motion. Implements an ultra-modern glassmorphic interface with real-time interactive health charts powered by Chart.js, responsive layouts for mobile and desktop, and dual-theme (light/dark) support.
2. **Application & API Layer (Backend):** Developed using Node.js and Express.js RESTful architecture. Manages authentication, middleware validation, vital sign ingestion, recovery score computation, automated alert dispatching, and appointment scheduling.
3. **Intelligence Layer (AI & ML Engine):** Leverages the GROQ cloud inference SDK running the LLaMA-3.3-70B model for ultra-low-latency natural language processing, report parsing, and conversational care, complemented by a deterministic clinical rule engine.
4. **Persistence Layer (Database):** Utilizes MongoDB with Mongoose ODM for scalable, schema-driven document storage of user credentials, health logs, medication schedules, hospital records, and analyzed medical reports.

### 5.2 Mathematical Formulation of the Dynamic Recovery Score

To evaluate post-discharge recovery dynamically as advocated by Patel et al. [2], Heal From Home implements a multi-factorial recovery score evaluated over a rolling 7-day window. The overall score $S_{recovery}$ (ranging from 0 to 100) is defined as:

$$S_{recovery} = S_{vitals} + S_{symptoms} + S_{activity} + S_{sleep} + S_{medication}$$

- **Vitals Score ($S_{vitals}$, 30 Points Maximum):** Evaluates the most recent vital parameters. Starting from a base of 30: deductions occur if Heart Rate < 50 or > 100 bpm (-8 pts), SpO2 < 95% (-12 pts), or Systolic BP < 90 or > 140 mmHg (-10 pts). Minimum score is 0.
- **Symptoms and Pain Score ($S_{symptoms}$, 20 Points Maximum):** Computed from the average self-reported visual analogue pain score (0 to 10) over the previous 7 days:  
  $$S_{symptoms} = \max(0, 20 - 2 \times \text{Pain}_{avg})$$
- **Physical Activity Score ($S_{activity}$, 20 Points Maximum):** Mapped from daily ambulation tiers: Bedrest (5 pts), Minimal mobility (10 pts), Light activity (15 pts), Moderate walking (18 pts), and Fully Active (20 pts).
- **Sleep Hygiene Score ($S_{sleep}$, 15 Points Maximum):** Derived from 7-day average sleep duration: Optimal sleep (7–9 hours) yields 15 pts, 6–7 hours yields 10 pts, and < 6 or > 9 hours yields 5 pts.
- **Medication Adherence Score ($S_{medication}$, 15 Points Maximum):** Calculated as:  
  $$S_{medication} = \text{round}\left(\frac{\text{Doses}_{\text{taken}}}{\text{Doses}_{\text{scheduled}}} \times 15\right)$$  
  across all active prescriptions over the last 7 days.

Recovery scores are automatically classified into clinical status categories: **Excellent** (80–100), **Good** (60–79), **Fair** (40–59), and **Needs Attention** (< 40), triggering corresponding visual cues and physician dashboard updates.

### 5.3 Rule-Based Complication Prediction & Smart Alerting

Heal From Home continuously compares logged vitals against established clinical crisis thresholds. When critical thresholds are breached, the system instantly logs an alert, assigns a severity rating, and presents an immediate recommendation:

| Clinical Parameter | Alert Trigger Threshold | Assigned Severity | Automated Remedial Recommendation |
|---|---|---|---|
| **Oxygen Saturation (SpO2)** | < 93% | **HIGH (Critical)** | Immediate supplemental oxygen check; seek emergency medical care. |
| **Heart Rate (Pulse)** | > 130 bpm or < 45 bpm | **HIGH (Critical)** | Severe tachycardia/bradycardia detected; consult cardiologist immediately. |
| **Systolic Blood Pressure** | > 160 mmHg or < 90 mmHg | **HIGH (Critical)** | Hypertensive crisis or severe hypotension; administer medication and notify doctor. |
| **Body Temperature** | > 38.5 °C (101.3 °F) | **MEDIUM (Warning)** | Fever detected; monitor temperature progression and take prescribed antipyretics. |
| **Pain Severity Scale** | Score ≥ 7 / 10 | **MEDIUM (Warning)** | Severe acute pain; review analgesic regimen and contact attending physician. |

### 5.4 Generative AI Medical Report Analysis & MedAI Pipeline

The AI subsystem integrates GROQ’s LPU (Language Processing Unit) inference infrastructure running the open-weights LLaMA-3.3-70B model. To overcome the hallucination and attribution issues highlighted by Liu et al. [1] and Sai et al. [4], the Medical Report Analyzer employs strict zero-shot constrained JSON prompting (Temperature = 0.2). It parses complex reports and outputs structured fields:
- Medications (name, dosage, frequency, duration, instructions)
- Primary and secondary diagnoses
- Abnormal laboratory values and reference ranges
- Physical and dietary restrictions
- Follow-up instructions and timelines
- Plain-language summary for patient understanding

In accordance with Yashwanth & Shettar [3], Protected Health Information (PHI) identifiers are redacted prior to model ingestion. Furthermore, the conversational assistant "MedAI" maintains a rolling 10-turn dialogue memory, utilizes empathetic and medically grounded system prompts, and enforces strict ethical boundaries by mandating professional consultation whenever red-flag symptoms are presented.

### 5.5 Hardware and Software Specifications

| Component Category | Development Environment | Deployment / Production Environment |
|---|---|---|
| **Operating System** | Windows 11 / Linux (Ubuntu 22.04 LTS) | Cloud Linux (Ubuntu Server / Alpine Container) |
| **Processor (CPU)** | Intel Core i5 / AMD Ryzen 5 or higher | 2+ vCPU Cloud Compute Instance |
| **System Memory (RAM)** | 8 GB minimum (16 GB recommended) | 4 GB RAM minimum |
| **Frontend Framework** | React 18, React Router v6, Framer Motion | HTML5, CSS3, ES6+ bundled via Webpack / Vite |
| **Backend Runtime** | Node.js v18.0+, Express.js v4.18 | Node.js LTS with PM2 Process Manager |
| **Database Server** | MongoDB Community Server v7.0 (Local) | MongoDB Atlas Cloud Managed Database Cluster |
| **AI Inference Engine** | GROQ SDK (llama-3.3-70b-versatile) | GROQ Cloud API with High-Speed LPUs |
| **Authentication & Security** | JWT, bcryptjs, Helmet, CORS, Rate Limit | HTTPS/TLS 1.3, Encrypted Environment Secrets |

---

## 6. REFERENCES

### Journal References
- **[1].** Liu Q., Yang R., Gao Q., Liang T., Wang X., Li S., Lei B., Gao K., “A Review of Applying Large Language Models in Healthcare.”, IEEE Access, Volume 13, pp: 6878-6892, 2025.
- **[2].** Patel M.S., Volpp K.G., Small D.S., Kanter G.P., Park S.H., Evans C.N., Polsky D., “Using remotely monitored patient activity patterns after hospital discharge to predict 30 day hospital readmission: a randomized trial.”, Scientific Reports, Volume 13, Article no: 8258, pp: 1-9, 2023.
- **[3].** Yashwanth Y.S., Shettar R., “Zero and Few Short Learning Using Large Language Models for De-Identification of Medical Records.”, IEEE Access, Volume 12, pp: 110385-110393, 2024.
- **[4].** Sai S., Gaur A., Sai R., Chamola V., Guizani M., Rodrigues J.J.P.C., “Generative AI for Transformative Healthcare: A Comprehensive Study of Emerging Models, Applications, Case Studies, and Limitations.”, IEEE Access, Volume 12, pp: 31078-31106, 2024.

### Conference References
- **[5].** Vaswani A., Shazeer N., Parmar N., Uszkoreit J., Jones L., Gomez A.N., Kaiser Ł., Polosukhin I., “Attention is all you need.”, Thirty-first Conference on Neural Information Processing Systems (NeurIPS), pp: 6000-6010, 2017.

### URL References
- **[6].** GROQ Cloud High-Performance AI Inference Platform http://console.groq.com, accessed on 03/11/2026 at 08:30 PM.
- **[7].** U.S. Department of Health and Human Services, Health Insurance Portability and Accountability Act (HIPAA) Privacy Rule http://www.hhs.gov/hipaa/, accessed on 03/11/2026 at 08:45 PM.

