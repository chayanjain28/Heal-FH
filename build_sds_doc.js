const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function xmlEscape(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function para(text, options = {}) {
  const {
    align = 'both',
    bold = false,
    italic = false,
    fontSize = 24, // 24 = 12pt
    fontFamily = 'Times New Roman',
    color = '000000',
    spacingBefore = 100,
    spacingAfter = 100,
    lineSpacing = 276,
    pageBreakBefore = false,
    headingLevel = null
  } = options;

  let pPr = '<w:pPr>';
  if (headingLevel) {
    pPr += `<w:pStyle w:val="Heading${headingLevel}"/>`;
  }
  if (pageBreakBefore) {
    pPr += '<w:pageBreakBefore w:val="1"/>';
  }
  pPr += `<w:jc w:val="${align}"/>`;
  pPr += `<w:spacing w:before="${spacingBefore}" w:after="${spacingAfter}" w:line="${lineSpacing}" w:lineRule="auto"/>`;
  pPr += `<w:rPr>
    <w:rFonts w:ascii="${fontFamily}" w:cs="${fontFamily}" w:hAnsi="${fontFamily}"/>
    ${bold ? '<w:b w:val="1"/><w:bCs w:val="1"/>' : '<w:b w:val="0"/><w:bCs w:val="0"/>'}
    ${italic ? '<w:i w:val="1"/><w:iCs w:val="1"/>' : '<w:i w:val="0"/><w:iCs w:val="0"/>'}
    <w:color w:val="${color}"/>
    <w:sz w:val="${fontSize}"/>
    <w:szCs w:val="${fontSize}"/>
  </w:rPr></w:pPr>`;

  let runs = '';
  if (Array.isArray(text)) {
    for (const item of text) {
      if (typeof item === 'string') {
        runs += `<w:r><w:rPr>
          <w:rFonts w:ascii="${fontFamily}" w:cs="${fontFamily}" w:hAnsi="${fontFamily}"/>
          ${bold ? '<w:b w:val="1"/><w:bCs w:val="1"/>' : ''}
          ${italic ? '<w:i w:val="1"/><w:iCs w:val="1"/>' : ''}
          <w:color w:val="${color}"/>
          <w:sz w:val="${fontSize}"/>
          <w:szCs w:val="${fontSize}"/>
        </w:rPr><w:t xml:space="preserve">${xmlEscape(item)}</w:t></w:r>`;
      } else {
        const itemBold = item.bold !== undefined ? item.bold : bold;
        const itemItalic = item.italic !== undefined ? item.italic : italic;
        const itemSize = item.fontSize || fontSize;
        const itemColor = item.color || color;
        const itemFont = item.fontFamily || fontFamily;
        runs += `<w:r><w:rPr>
          <w:rFonts w:ascii="${itemFont}" w:cs="${itemFont}" w:hAnsi="${itemFont}"/>
          ${itemBold ? '<w:b w:val="1"/><w:bCs w:val="1"/>' : '<w:b w:val="0"/><w:bCs w:val="0"/>'}
          ${itemItalic ? '<w:i w:val="1"/><w:iCs w:val="1"/>' : '<w:i w:val="0"/><w:iCs w:val="0"/>'}
          <w:color w:val="${itemColor}"/>
          <w:sz w:val="${itemSize}"/>
          <w:szCs w:val="${itemSize}"/>
        </w:rPr><w:t xml:space="preserve">${xmlEscape(item.text)}</w:t></w:r>`;
      }
    }
  } else {
    runs = `<w:r><w:rPr>
      <w:rFonts w:ascii="${fontFamily}" w:cs="${fontFamily}" w:hAnsi="${fontFamily}"/>
      ${bold ? '<w:b w:val="1"/><w:bCs w:val="1"/>' : '<w:b w:val="0"/><w:bCs w:val="0"/>'}
      ${italic ? '<w:i w:val="1"/><w:iCs w:val="1"/>' : '<w:i w:val="0"/><w:iCs w:val="0"/>'}
      <w:color w:val="${color}"/>
      <w:sz w:val="${fontSize}"/>
      <w:szCs w:val="${fontSize}"/>
    </w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r>`;
  }

  return `<w:p>${pPr}${runs}</w:p>`;
}

function heading1(title) {
  return para(title, {
    headingLevel: 1,
    align: 'left',
    bold: true,
    fontSize: 28, // 14pt
    color: '1A365D',
    spacingBefore: 260,
    spacingAfter: 120
  });
}

function heading2(title) {
  return para(title, {
    headingLevel: 2,
    align: 'left',
    bold: true,
    fontSize: 26, // 13pt
    color: '2B6CB0',
    spacingBefore: 200,
    spacingAfter: 80
  });
}

function heading3(title) {
  return para(title, {
    headingLevel: 3,
    align: 'left',
    bold: true,
    fontSize: 24, // 12pt
    color: '2D3748',
    spacingBefore: 140,
    spacingAfter: 60
  });
}

function bullet(text, prefix = '•  ') {
  return para([
    { text: prefix, bold: true, color: '2B6CB0' },
    ...(Array.isArray(text) ? text : [{ text: text }])
  ], {
    align: 'both',
    fontSize: 24,
    spacingBefore: 50,
    spacingAfter: 50
  });
}

function mermaidBlock(code, title = '') {
  let xml = '';
  if (title) {
    xml += para(`Figure: ${title} (Mermaid Specification)`, {
      bold: true,
      fontSize: 21,
      color: '2B6CB0',
      align: 'left',
      spacingBefore: 120,
      spacingAfter: 40
    });
  }

  const lines = code.trim().split('\n');
  const codeParagraphs = lines.map(line => {
    return `<w:p>
      <w:pPr>
        <w:shd w:val="clear" w:color="auto" w:fill="F7FAFC"/>
        <w:spacing w:before="20" w:after="20" w:line="220" w:lineRule="auto"/>
        <w:ind w:left="240" w:right="240"/>
        <w:rPr>
          <w:rFonts w:ascii="Consolas" w:cs="Consolas" w:hAnsi="Consolas"/>
          <w:color w:val="2D3748"/>
          <w:sz w:val="18"/>
          <w:szCs w:val="18"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Consolas" w:cs="Consolas" w:hAnsi="Consolas"/>
          <w:color w:val="2D3748"/>
          <w:sz w:val="18"/>
          <w:szCs w:val="18"/>
        </w:rPr>
        <w:t xml:space="preserve">${xmlEscape(line)}</w:t>
      </w:r>
    </w:p>`;
  }).join('');

  return xml + codeParagraphs;
}

function imagePara(rId = 'rId6', cx = 2708010, cy = 1864532) {
  return `<w:p>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="140" w:after="140"/>
    </w:pPr>
    <w:r>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${cx}" cy="${cy}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="1" name="image1.png"/>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="0" name="image1.png"/>
                  <pic:cNvPicPr preferRelativeResize="0"/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${rId}"/>
                  <a:srcRect b="0" l="0" r="0" t="0"/>
                  <a:stretch><a:fillRect/></a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
                  <a:prstGeom prst="rect"><a:ln/></a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  </w:p>`;
}

function tableXml(rows, colWidths = []) {
  let tblPr = `<w:tblPr>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="6" w:space="0" w:color="1A365D"/>
      <w:left w:val="single" w:sz="6" w:space="0" w:color="1A365D"/>
      <w:bottom w:val="single" w:sz="6" w:space="0" w:color="1A365D"/>
      <w:right w:val="single" w:sz="6" w:space="0" w:color="1A365D"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="D2D6DC"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="D2D6DC"/>
    </w:tblBorders>
    <w:tblLook w:val="04A0"/>
  </w:tblPr>`;

  let grid = '<w:tblGrid>';
  for (const w of colWidths) {
    grid += `<w:gridCol w:w="${w}"/>`;
  }
  grid += '</w:tblGrid>';

  let rowsXml = '';
  rows.forEach((row, rIdx) => {
    let tr = '<w:tr>';
    row.forEach((cell, cIdx) => {
      const isHeader = rIdx === 0;
      const shd = isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="EBF8FF"/>' : '';
      const cellWidth = colWidths[cIdx] ? `<w:tcW w:w="${colWidths[cIdx]}" w:type="dxa"/>` : '<w:tcW w:w="0" w:type="auto"/>';
      tr += `<w:tc><w:tcPr>${cellWidth}${shd}<w:tcMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar></w:tcPr>`;
      tr += para(cell, {
        align: isHeader ? 'center' : 'left',
        bold: isHeader,
        fontSize: isHeader ? 21 : 19,
        spacingBefore: 40,
        spacingAfter: 40
      });
      tr += '</w:tc>';
    });
    tr += '</w:tr>';
  });

  return `<w:tbl>${tblPr}${grid}${rowsXml}</w:tbl>`;
}

function buildSdsDocumentXml() {
  const parts = [];

  // ==================== COVER PAGE ====================
  parts.push(para('SOFTWARE DESIGN SPECIFICATION', {
    align: 'center',
    bold: true,
    fontSize: 32,
    color: '0F294A',
    spacingBefore: 200,
    spacingAfter: 80
  }));

  parts.push(para('FOR', {
    align: 'center',
    bold: true,
    fontSize: 24,
    spacingBefore: 40,
    spacingAfter: 60
  }));

  parts.push(para('HEAL FROM HOME: AN INTELLIGENT POST-DISCHARGE CARE COMPANION SYSTEM BASED ON OBJECT ORIENTED TECHNOLOGY', {
    align: 'center',
    bold: true,
    fontSize: 30,
    color: '1A365D',
    spacingBefore: 60,
    spacingAfter: 160,
    lineSpacing: 300
  }));

  parts.push(para('Release 1.0 (Production Architecture)', {
    align: 'center',
    italic: true,
    fontSize: 24,
    color: '4A5568',
    spacingBefore: 40,
    spacingAfter: 160
  }));

  parts.push(para('SUBMITTED BY:', {
    align: 'center',
    bold: true,
    fontSize: 24,
    spacingBefore: 60,
    spacingAfter: 80
  }));

  parts.push(para([
    { text: '<Name of Student 1>', bold: true, fontSize: 24 },
    { text: '  (University Roll No: ', fontSize: 22 },
    { text: '<Roll No 1>', bold: true, fontSize: 22 },
    { text: ')\n', fontSize: 22 },
    { text: '<Name of Student 2>', bold: true, fontSize: 24 },
    { text: '  (University Roll No: ', fontSize: 22 },
    { text: '<Roll No 2>', bold: true, fontSize: 22 },
    { text: ')\n', fontSize: 22 },
    { text: '<Name of Student 3>', bold: true, fontSize: 24 },
    { text: '  (University Roll No: ', fontSize: 22 },
    { text: '<Roll No 3>', bold: true, fontSize: 22 },
    { text: ')', fontSize: 22 }
  ], {
    align: 'center',
    spacingBefore: 60,
    spacingAfter: 160,
    lineSpacing: 280
  }));

  parts.push(para('Under the Guidance of', {
    align: 'center',
    bold: true,
    fontSize: 24,
    spacingBefore: 80,
    spacingAfter: 60
  }));

  parts.push(para([
    { text: '<Name of Guide(s)>\n', bold: true, fontSize: 26, color: '1A365D' },
    { text: '<Designation, Department of Computer Science & Engineering>', italic: true, fontSize: 22 }
  ], {
    align: 'center',
    spacingBefore: 40,
    spacingAfter: 140
  }));

  // University Logo
  parts.push(imagePara('rId6', 2708010, 1864532));

  parts.push(para('Department of Computer Science & Engineering, Faculty of Engineering\nMEDICAPS UNIVERSITY, INDORE - 453331\nAcademic Year 2026 - 2027', {
    align: 'center',
    bold: true,
    fontSize: 24,
    spacingBefore: 120,
    spacingAfter: 200,
    lineSpacing: 280
  }));

  // ==================== TABLE OF CONTENTS ====================
  parts.push(para('', { pageBreakBefore: true }));
  parts.push(heading1('TABLE OF CONTENTS'));
  const tocEntries = [
    '1. INTRODUCTION ........................................................................................ 3',
    '   1.1 Purpose ......................................................................................... 3',
    '   1.2 Document Conventions ........................................................................... 3',
    '   1.3 Intended Audience and Reading Suggestions ....................................................... 3',
    '   1.4 References ...................................................................................... 4',
    '2. ANALYSIS MODEL ..................................................................................... 5',
    '   2.1 Methodology Used (Object-Oriented & Agile Process Model) ........................................ 5',
    '   2.2 Use Case Diagrams & Specifications .............................................................. 6',
    '   2.3 Activity Diagrams ............................................................................... 10',
    '   2.4 Sequence Diagrams ............................................................................... 12',
    '   2.5 Class Diagram ................................................................................... 14',
    '   2.6 State Transition Diagram ........................................................................ 16',
    '3. DESIGN MODEL ....................................................................................... 18',
    '   3.1 Architectural Design ............................................................................ 18',
    '       3.1.1 System Architecture Diagram ............................................................... 18',
    '       3.1.2 Description of Architectural Design ....................................................... 19',
    '   3.2 Database Design ................................................................................. 20',
    '       3.2.1 Data Dictionary ........................................................................... 20',
    '       3.2.2 Normalization (1NF, 2NF, 3NF Analysis) .................................................... 24',
    '   3.3 Component Design ................................................................................ 26',
    '       3.3.1 Package Diagram ........................................................................... 26',
    '       3.3.2 Component Diagram ......................................................................... 27',
    '       3.3.3 Deployment Diagram ........................................................................ 28',
    '   3.4 Interface Design ................................................................................ 29',
    '       3.4.1 Screen Layout Specifications .............................................................. 29',
    '4. APPENDICES ......................................................................................... 31',
    '   Appendix C1: Glossary ............................................................................... 31',
    '   Appendix C2: To Be Determined (TBD) List ............................................................ 32'
  ];
  tocEntries.forEach(t => parts.push(para(t, { align: 'left', fontSize: 20, fontFamily: 'Courier New', spacingBefore: 30, spacingAfter: 30 })));

  // ==================== SECTION 1: INTRODUCTION ====================
  parts.push(para('', { pageBreakBefore: true }));
  parts.push(heading1('1. INTRODUCTION'));

  parts.push(heading2('1.1 Purpose'));
  parts.push(para(
    'This Software Design Specification (SDS) document provides a comprehensive, rigorous, and systematic architectural description for "Heal From Home" (Heal-FH), Release 1.0. "Heal From Home" is an intelligent, full-stack post-discharge remote patient monitoring and healthcare companion platform. The purpose of this SDS is to formally translate functional, non-functional, and clinical requirements into concrete structural, behavioral, and deployment models. It covers all core subsystems, including Role-Based Authentication, Continuous Vitals and Behavioral Health Logging, Dynamic Multi-Factor Recovery Scoring (0–100), Rule-Based Clinical Complication Prediction & Smart Alerting, Generative AI Medical Report Analysis (GROQ LLaMA-3.3-70B), Conversational Healthcare Companion ("MedAI"), and Verified Doctor Discovery & Appointment Management.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 80 }
  ));

  parts.push(heading2('1.2 Document Conventions'));
  parts.push(para(
    'This document adheres to the IEEE 1016-2009 Standard for Information Technology — Systems and Software Engineering — Software Design Descriptions, alongside the Unified Modeling Language (UML 2.5) standard defined by the Object Management Group (OMG). The following typographical conventions are observed throughout:',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));
  parts.push(bullet('Bold Text: Used for section headings, table headers, database schema entity names, and primary keywords.'));
  parts.push(bullet('Monospaced Font (Consolas / Courier New): Used for source code references, directory paths, schema field names, API routes, and Mermaid syntax blocks.'));
  parts.push(bullet('Italic Text: Used for clinical terminology, emphasis, and Latin medical designations.'));
  parts.push(bullet('Cross-references [X]: Indicated in square brackets corresponding strictly to the numbered References list.'));

  parts.push(heading2('1.3 Intended Audience and Reading Suggestions'));
  parts.push(para(
    'This SDS is intended for software engineers, clinical informatics advisors, academic evaluators, system administrators, and quality assurance personnel. Recommended reading sequence:',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));
  parts.push(bullet('System Architects and Technical Leads: Focus on Section 2.1 (Methodology), Section 2.5 (Class Diagram), Section 3.1 (Architectural Design), and Section 3.3 (Component Design).'));
  parts.push(bullet('Full-Stack Developers: Review Section 2.2 (Use Cases), Section 2.4 (Sequence Diagrams), and Section 3.2 (Database Design & Data Dictionary).'));
  parts.push(bullet('AI/ML Specialists: Inspect Section 2.3 (AI Workflows), Section 3.1.2 (Intelligence Layer), and Section 3.2.1 (MedicalReport Data Dictionary).'));
  parts.push(bullet('QA Engineers & Evaluators: Read Section 2.2 (Use Case Specifications), Section 3.4 (Interface Design), and Appendix C2 (TBD List).'));

  parts.push(heading2('1.4 References'));
  parts.push(bullet('[1] Q. Liu et al., "A Review of Applying Large Language Models in Healthcare," IEEE Access, vol. 13, pp. 6878-6892, 2025.'));
  parts.push(bullet('[2] M. S. Patel et al., "Using remotely monitored patient activity patterns after hospital discharge to predict 30 day hospital readmission: a randomized trial," Scientific Reports, vol. 13, no. 8258, pp. 1-9, 2023.'));
  parts.push(bullet('[3] Y. S. Yashwanth and R. Shettar, "Zero and Few Short Learning Using Large Language Models for De-Identification of Medical Records," IEEE Access, vol. 12, pp. 110385-110393, 2024.'));
  parts.push(bullet('[4] S. Sai et al., "Generative AI for Transformative Healthcare: A Comprehensive Study of Emerging Models, Applications, Case Studies, and Limitations," IEEE Access, vol. 12, pp. 31078-31106, 2024.'));
  parts.push(bullet('[5] A. Vaswani et al., "Attention is all you need," Advances in Neural Information Processing Systems (NeurIPS), pp. 6000-6010, 2017.'));
  parts.push(bullet('[6] GROQ Cloud LPU Inference API Documentation, https://console.groq.com, 2026.'));

  // ==================== SECTION 2: ANALYSIS MODEL ====================
  parts.push(para('', { pageBreakBefore: true }));
  parts.push(heading1('2. ANALYSIS MODEL'));

  parts.push(heading2('2.1 Methodology Used'));
  parts.push(para(
    'The software engineering lifecycle for "Heal From Home" is implemented using an Object-Oriented Analysis and Design (OOAD) approach governed by the Agile Scrum Process Model. The object-oriented paradigm was chosen because healthcare domains feature deeply interrelated domain entities (Patients, Doctors, Vitals, Medications, Reports, Alerts) that naturally map to encapsulated objects with rich internal states, validations, and behavioral methods.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 80 }
  ));

  const scrumMermaid = 
`flowchart LR
    A["Sprint 1<br/>Auth & Core Schema"] --> B["Sprint 2<br/>Health Logs & Recovery Engine"]
    B --> C["Sprint 3<br/>GROQ AI & Report Extraction"]
    C --> D["Sprint 4<br/>Doctor Discovery & Alerting"]
    D --> E["Release 1.0<br/>Testing & Deployment"]`;
  parts.push(mermaidBlock(scrumMermaid, 'Agile Scrum Sprint Workflow'));

  parts.push(bullet('Modularity and Separation of Concerns: The backend employs the Model-View-Controller (MVC) architectural design pattern, isolating business logic, clinical rules, and data access layers.'));
  parts.push(bullet('Agile Scrum Process Model: Organized into four two-week sprints: Sprint 1 (Authentication & Core Schema), Sprint 2 (Health Logging & Recovery Algorithm), Sprint 3 (GROQ AI Integration & Report Parsing), and Sprint 4 (Doctor Discovery, Alerts & End-to-End Testing).'));

  parts.push(heading2('2.2 Use Case Diagrams & Specifications'));
  parts.push(para(
    'The Heal From Home system interacts with three primary external human actors: Patient, Doctor/Physician, and Caregiver, along with one external machine actor: GROQ AI LPU Engine. Below is the functional use case boundary diagram expressed in Mermaid notation:',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  const useCaseMermaid =
`flowchart TD
    subgraph Actors
        P(("Patient"))
        D(("Doctor"))
        C(("Caregiver"))
        AI["GROQ AI LPU Engine"]
    end

    subgraph System["Heal From Home System Boundary"]
        UC1(["UC01: Register & Login (JWT)"])
        UC2(["UC02: Log Daily Vitals & Symptoms"])
        UC3(["UC03: Trigger Smart Health Alerts"])
        UC4(["UC04: Track Medications & Adherence"])
        UC5(["UC05: View Recovery Score Dashboard"])
        UC6(["UC06: Upload & Analyze Medical Report"])
        UC7(["UC07: Redact PHI Data"])
        UC8(["UC08: Chat with MedAI Care Companion"])
        UC9(["UC09: Search Doctors & Book Appointment"])
        UC10(["UC10: Review Patient Clinical Trends"])
        UC11(["UC11: Manage Appointments & Care Plans"])
        UC12(["UC12: Monitor Linked Patient Alerts"])
    end

    P --> UC1
    P --> UC2
    UC2 -.->|<<include>>| UC3
    P --> UC4
    P --> UC5
    P --> UC6
    UC6 -.->|<<include>>| UC7
    UC6 <--> AI
    P --> UC8
    UC8 <--> AI
    P --> UC9

    D --> UC10
    D --> UC11

    C --> UC12`;
  parts.push(mermaidBlock(useCaseMermaid, 'Use Case Diagram'));

  // Use Case Specifications Tables
  parts.push(heading3('Use Case Specification 1: Log Daily Vitals & Auto-Trigger Alerts'));
  const uc1Table = [
    ['Field', 'Specification Details'],
    ['Name of Use Case', 'UC02: Log Daily Vitals & Symptoms with Automatic Alert Evaluation'],
    ['Actor(s)', 'Patient, Caregiver (Primary); Health Alert Engine (System)'],
    ['Pre-Condition', 'User is securely authenticated via JWT with role "patient" or "caregiver".'],
    ['Primary Flow of Events', 
     '1. Patient navigates to "Health Logs" screen.\n' +
     '2. Patient inputs vital measurements: Blood Pressure (Systolic/Diastolic), Heart Rate, SpO2, Temperature, Pain Level (0-10), Activity Level, and Sleep Hours.\n' +
     '3. Patient clicks "Save Vitals Log".\n' +
     '4. Frontend validates inputs against physiological boundary constraints and dispatches POST /api/health-logs.\n' +
     '5. HealthLogController saves record in MongoDB and invokes the Alert Engine.\n' +
     '6. System evaluates vitals against clinical thresholds (SpO2 < 93%, HR > 130, SBP > 160, Temp > 38.5C).\n' +
     '7. If all vitals are normal, system updates the 7-day rolling log cache and returns HTTP 201 Created.\n' +
     '8. UI confirms submission and updates real-time vital trend line charts.'
    ],
    ['Alternate Flow of Events', 
     'Alternate Flow 1 (Critical Vital Anomaly Detected):\n' +
     'If SpO2 < 93% or Systolic BP > 160 mmHg, Alert.create() generates a "critical" alert with immediate remedial advice. The response payload returns alert metadata; the UI displays an urgent warning banner and advises hospital contact.\n\n' +
     'Alternate Flow 2 (Validation Failure):\n' +
     'If input is out of human range (e.g., Heart Rate = 300 bpm), system rejects the request with HTTP 400 Bad Request and highlights the invalid input field.'
    ],
    ['Post-Condition', 'HealthLog document is persisted in MongoDB; dynamic recovery score is invalidated and recalculated; alerts are active if thresholds were breached.'],
    ['Use Case Termination', 'Success confirmation toast displayed, and dashboard metrics refresh.']
  ];
  parts.push(tableXml(uc1Table, [2500, 7100]));

  parts.push(heading3('Use Case Specification 2: AI Medical Report Analysis & JSON Extraction'));
  const uc2Table = [
    ['Field', 'Specification Details'],
    ['Name of Use Case', 'UC06: Upload & Analyze Medical Discharge Report using Generative AI'],
    ['Actor(s)', 'Patient (Primary); GROQ AI LLaMA-3.3-70B API (Secondary Service)'],
    ['Pre-Condition', 'Patient has access to an electronic medical report, clinical text, or discharge summary.'],
    ['Primary Flow of Events', 
     '1. Patient accesses the "Report Analyzer" module.\n' +
     '2. Patient uploads a PDF/image report or pastes clinical discharge text.\n' +
     '3. Frontend sends multipart/form-data to POST /api/ai/analyze-report.\n' +
     '4. Backend sanitizes text by stripping 18 HIPAA PHI identifiers (names, dates, contact numbers).\n' +
     '5. Controller formats a constrained prompt specifying the exact JSON schema and calls GROQ API.\n' +
     '6. GROQ LLaMA-3.3-70B executes inference (temperature = 0.2) and returns structured JSON.\n' +
     '7. Backend parses JSON (medications, diagnoses, abnormal labs, physical restrictions, summary).\n' +
     '8. Backend persists report in MedicalReport collection and returns parsed JSON to client.\n' +
     '9. UI renders interactive cards for medications, warnings, and simplified patient summary.'
    ],
    ['Alternate Flow of Events', 
     'Alternate Flow 1 (GROQ API Timeout or Rate Limit):\n' +
     'If the external AI gateway fails, backend catches error, flags report as "pending analysis", logs raw text, and returns a graceful HTTP 503 error instructing user to retry.\n\n' +
     'Alternate Flow 2 (Malformed JSON Output):\n' +
     'If AI response contains formatting anomalies, regex JSON extractor isolates the valid JSON block; if unrecoverable, raw summary text is stored as a fallback.'
    ],
    ['Post-Condition', 'MedicalReport document is stored; patient gains instant plain-language comprehension of instructions.'],
    ['Use Case Termination', 'Structured report cards successfully rendered in UI.']
  ];
  parts.push(tableXml(uc2Table, [2500, 7100]));

  // ==================== 2.3 ACTIVITY DIAGRAM ====================
  parts.push(heading2('2.3 Activity Diagram'));
  parts.push(para(
    'The Activity Diagram models the operational workflows of the two most critical operational scenarios in Heal From Home: (A) Patient Vitals Logging & Alert Triggering Workflow, and (B) Medical Report Upload & AI Processing Pipeline.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  const activityMermaid =
`flowchart TD
    A([Start: Patient Opens Health Log]) --> B[Input Vitals & Symptoms]
    B --> C{Physiological Range Valid?}
    C -- No --> D[Show Inline Input Error & Highlight Field]
    D --> B
    C -- Yes --> E[Dispatch POST /api/health-logs via Axios]
    E --> F[Persist HealthLog Document in MongoDB]
    
    subgraph Parallel Processing
        F --> G[Evaluate Critical Thresholds]
        F --> H[Recalculate 7-Day Dynamic Recovery Score]
    end

    G --> I{Threshold Exceeded?}
    I -- Yes --> J[Create Critical/Warning Alert in DB]
    J --> K[Push Immediate High-Risk Notification Toast]
    I -- No --> L[Mark Status as Clinically Stable]
    
    H --> M[Compute 5-Factor Weighted Index: 0-100]
    M --> N[Update Dashboard Gauge: Excellent/Good/Fair/Attention]
    
    K --> O([End: Dashboard Synchronized])
    L --> O
    N --> O`;
  parts.push(mermaidBlock(activityMermaid, 'Activity Diagram - Vitals Logging & Alert Triggering'));

  // ==================== 2.4 SEQUENCE DIAGRAM ====================
  parts.push(heading2('2.4 Sequence Diagram'));
  parts.push(para(
    'The Sequence Diagram below captures the detailed chronological message exchange for Medical Report Analysis and AI Entity Extraction across system boundaries:',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  const seqMermaid =
`sequenceDiagram
    autonumber
    actor Patient
    participant UI as React UI (Client)
    participant Router as Express Router
    participant Controller as AI Controller
    participant GROQ as GROQ LPU Cloud API
    participant DB as MongoDB Cluster

    Patient->>UI: Uploads Medical Report (PDF / Text)
    UI->>Router: POST /api/ai/analyze-report (FormData + JWT)
    Router->>Controller: analyzeReport(req, res)
    Note over Controller: Redacts 18 HIPAA PHI Identifiers
    Controller->>GROQ: chat.completions.create(model='llama-3.3-70b', schema=JSON, temp=0.2)
    Note over GROQ: Ultra-fast LPU Inference (~250 tokens/sec)
    GROQ-->>Controller: Returns Validated Structured JSON
    Controller->>DB: MedicalReport.create({ patient, analysis, rawText })
    DB-->>Controller: Confirms Persisted Document
    Controller-->>Router: HTTP 200 OK { success: true, analysis }
    Router-->>UI: Dispatches JSON Payload
    UI-->>Patient: Renders Structured Cards (Meds, Diagnoses, Summary)`;
  parts.push(mermaidBlock(seqMermaid, 'Sequence Diagram - AI Report Analysis & Extraction'));

  // ==================== 2.5 CLASS DIAGRAM ====================
  parts.push(heading2('2.5 Class Diagram'));
  parts.push(para(
    'The Class Diagram depicts the static structural model of the Heal From Home system. It defines the encapsulated entities, field data types, methods, and cardinality relationships across the domain models:',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  const classMermaid =
`classDiagram
    class User {
        -ObjectId id
        -String name
        -String email
        -String password
        -String role
        -String phone
        -Boolean isActive
        -Date createdAt
        +comparePassword(candidate) Boolean
        +toJSON() Object
    }

    class PatientProfile {
        -ObjectId id
        -ObjectId user
        -Date dateOfBirth
        -String gender
        -Object emergencyContact
        -String primaryDiagnosis
        -StringArray allergies
        +getMedicalSummary() Object
    }

    class HealthLog {
        -ObjectId id
        -ObjectId patient
        -Date timestamp
        -Object vitals
        -ObjectArray symptoms
        -Number painLevel
        -String mood
        -Number sleepHours
        -String activityLevel
        +validateVitals() Boolean
    }

    class Medication {
        -ObjectId id
        -ObjectId patient
        -String name
        -String dosage
        -String frequency
        -ObjectArray logs
        -Boolean isActive
        +recordDose(status, takenAt) void
        +getAdherenceRate(days) Number
    }

    class MedicalReport {
        -ObjectId id
        -ObjectId patient
        -String filename
        -String fileType
        -Object analysis
        -Boolean isAnalyzed
        +parseReportJSON() Object
    }

    class Alert {
        -ObjectId id
        -ObjectId patient
        -String type
        -String severity
        -String title
        -String message
        -Boolean isResolved
        +resolveAlert(userId) void
    }

    class Doctor {
        -ObjectId id
        -ObjectId user
        -String specialization
        -Number experienceYears
        -Number rating
        -Number consultationFee
        -ObjectArray availableSlots
        +isAvailable(date, slot) Boolean
    }

    class Appointment {
        -ObjectId id
        -ObjectId patient
        -ObjectId doctor
        -Date date
        -Object timeSlot
        -String type
        -String status
        -Number fee
        +confirmAppointment() void
        +reschedule(newDate, newSlot) void
    }

    User "1" <|-- "1" PatientProfile : extends
    User "1" <|-- "1" Doctor : extends
    User "1" o-- "0..*" HealthLog : logs
    User "1" o-- "0..*" Medication : manages
    User "1" o-- "0..*" MedicalReport : owns
    User "1" o-- "0..*" Alert : receives
    PatientProfile "1" --> "0..*" Appointment : books
    Doctor "1" --> "0..*" Appointment : conducts`;
  parts.push(mermaidBlock(classMermaid, 'Class Diagram - Domain Models & Methods'));

  // ==================== 2.6 STATE TRANSITION DIAGRAM ====================
  parts.push(heading2('2.6 State Transition Diagram'));
  parts.push(para(
    'The State Transition Diagram models the lifecycle of critical domain entities, including (A) Appointment Booking Lifecycle, and (B) Clinical Alert Resolution Flow:',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  const stateMermaid =
`stateDiagram-v2
    [*] --> Pending : Patient Submits Booking Request
    Pending --> Confirmed : Doctor Confirms Slot
    Pending --> Cancelled : Slot Unavailable / Patient Cancels
    Confirmed --> InConsultation : Scheduled Appointment Time Arrives
    InConsultation --> Completed : Consultation Concluded & Summary Issued
    Confirmed --> Cancelled : Patient Cancels > 24h
    Confirmed --> NoShow : Patient Misses Appointment
    Completed --> [*]
    Cancelled --> [*]
    NoShow --> [*]`;
  parts.push(mermaidBlock(stateMermaid, 'State Transition Diagram - Appointment Lifecycle'));

  // ==================== SECTION 3: DESIGN MODEL ====================
  parts.push(para('', { pageBreakBefore: true }));
  parts.push(heading1('3. DESIGN MODEL'));

  parts.push(heading2('3.1 Architectural Design'));
  parts.push(heading3('3.1.1 System Architectural Diagram'));
  parts.push(para(
    'Heal From Home is structured as a modern, decoupled four-tier web application architecture featuring high-throughput REST APIs and asynchronous cloud AI orchestration:',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  const archMermaid =
`flowchart TD
    subgraph Tier1["Tier 1: Presentation Layer (React 18 SPA)"]
        UI1["Glassmorphic Dashboard & Recovery Gauge"]
        UI2["Chart.js Longitudinal Vitals Trends"]
        UI3["MedAI Conversational Chat Console"]
        UI4["Report Analyzer & Upload Interface"]
    end

    subgraph Tier2["Tier 2: Application & API Layer (Node.js / Express)"]
        GW["REST API Gateway & Route Handlers"]
        MW["Security Middleware (JWT, Helmet, CORS, Rate-Limit)"]
        CTL1["Auth & User Controller"]
        CTL2["HealthLog & Alert Dispatch Controller"]
        CTL3["Recovery Score Engine (7-Day Rolling)"]
        CTL4["Doctor & Appointment Controller"]
    end

    subgraph Tier3["Tier 3: Intelligence Layer (AI & ML)"]
        GROQ["GROQ Cloud High-Speed LPU Engine"]
        LLM["LLaMA-3.3-70B Open-Weights Model"]
        RULES["Clinical Rule-Based Complication Engine"]
        DEID["HIPAA PHI Sanitizer"]
    end

    subgraph Tier4["Tier 4: Persistence Layer (MongoDB Cluster)"]
        DB1[("users & profiles")]
        DB2[("healthlogs & vitals")]
        DB3[("medications & logs")]
        DB4[("medicalreports & alerts")]
        DB5[("doctors & appointments")]
    end

    Tier1 <==>|HTTPS / JSON via Axios| Tier2
    Tier2 <==>|Internal SDK Call| Tier3
    Tier2 <==>|Mongoose ODM (Port 27017)| Tier4`;
  parts.push(mermaidBlock(archMermaid, 'System Architecture Diagram'));

  parts.push(heading3('3.1.2 Description of Architectural Design'));
  parts.push(bullet('Presentation Tier (Client): Built using React 18, utilizing functional components and React Hooks for state management. Uses Chart.js for rendering longitudinal physiological trends (blood pressure, pulse, SpO2) and Framer Motion for smooth glassmorphic page transitions.'));
  parts.push(bullet('Application Tier (Server): Node.js with Express.js handles incoming REST endpoints. Secures traffic using Helmet security headers, CORS origin controls, and Express-Rate-Limit against denial-of-service threats. Controllers encapsulate all business workflows.'));
  parts.push(bullet('Intelligence Tier (AI Engine): Powered by the GROQ Cloud SDK utilizing Language Processing Units (LPUs). Processes report extraction prompts in sub-second inference speeds with deterministic JSON output schemas. Includes deterministic clinical rules for instant anomaly detection.'));
  parts.push(bullet('Persistence Tier (Database): MongoDB managed database with Mongoose Object Data Modeling (ODM). Implements schema validation, compound indexing ({ patient: 1, timestamp: -1 }), and referential population.'));

  // ==================== 3.2 DATABASE DESIGN ====================
  parts.push(heading2('3.2 Database Design'));
  parts.push(heading3('3.2.1 Data Dictionary'));
  parts.push(para('The Data Dictionary provides complete technical definitions of all data entities, storage constraints, and field attributes utilized within the Heal From Home database:', { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }));

  // Table 1: User
  parts.push(para('Entity 1: Users Collection (User.js)', { bold: true, fontSize: 22, color: '1A365D', spacingBefore: 80, spacingAfter: 40 }));
  const userFields = [
    ['Field Name', 'Data Type', 'Constraints / Key', 'Description & Business Rules'],
    ['_id', 'ObjectId', 'Primary Key, Auto', 'Unique internal MongoDB identifier for the user account.'],
    ['name', 'String', 'Required, Trim', 'Full legal name of the user.'],
    ['email', 'String', 'Required, Unique, Lowercase', 'User electronic mail address used for authentication.'],
    ['password', 'String', 'Required, Min 6, Select=False', 'Hashed password using bcryptjs with 12 salt rounds.'],
    ['role', 'String', 'Enum (patient, doctor, ...)', 'Role-based access tier; defaults to "patient".'],
    ['phone', 'String', 'Optional, Trim', 'Emergency contact telephone number.'],
    ['isActive', 'Boolean', 'Default: True', 'Indicates whether account is actively authorized.'],
    ['lastLogin', 'Date', 'Optional', 'Timestamp of the most recent authentication session.'],
    ['createdAt', 'Date', 'Default: Date.now', 'System generation timestamp of user entity.']
  ];
  parts.push(tableXml(userFields, [1800, 1600, 2400, 3800]));

  // Table 2: HealthLog
  parts.push(para('Entity 2: HealthLogs Collection (HealthLog.js)', { bold: true, fontSize: 22, color: '1A365D', spacingBefore: 120, spacingAfter: 40 }));
  const logFields = [
    ['Field Name', 'Data Type', 'Constraints / Key', 'Description & Business Rules'],
    ['_id', 'ObjectId', 'Primary Key, Auto', 'Unique identifier for the health log instance.'],
    ['patient', 'ObjectId', 'Foreign Key -> User, Req', 'Identifies the recovering patient submitting the log.'],
    ['timestamp', 'Date', 'Default: Date.now, Indexed', 'Timestamp of vital measurement recording.'],
    ['vitals.heartRate', 'Number', 'Range: 30 - 250 bpm', 'Resting pulse rate; normal baseline 60–100 bpm.'],
    ['vitals.bloodPressureSystolic', 'Number', 'Range: 60 - 250 mmHg', 'Systolic arterial pressure; alert triggered if > 160.'],
    ['vitals.bloodPressureDiastolic', 'Number', 'Range: 40 - 150 mmHg', 'Diastolic arterial pressure; normal < 80 mmHg.'],
    ['vitals.temperature', 'Number', 'Range: 34.0 - 42.0 C', 'Body temperature in Celsius; alert if > 38.5 C.'],
    ['vitals.oxygenSaturation', 'Number', 'Range: 70 - 100 %', 'Blood oxygen saturation (SpO2); critical if < 93%.'],
    ['painLevel', 'Number', 'Range: 0 - 10, Default: 0', 'Self-reported visual analogue pain severity scale.'],
    ['sleepHours', 'Number', 'Range: 0 - 24 hours', 'Total sleep duration during preceding 24-hour cycle.'],
    ['activityLevel', 'String', 'Enum: bedrest, active...', 'Subjective ambulation tier used in recovery index.']
  ];
  parts.push(tableXml(logFields, [2200, 1500, 2300, 3600]));

  // Table 3: MedicalReport
  parts.push(para('Entity 3: MedicalReports Collection (MedicalReport.js)', { bold: true, fontSize: 22, color: '1A365D', spacingBefore: 120, spacingAfter: 40 }));
  const reportFields = [
    ['Field Name', 'Data Type', 'Constraints / Key', 'Description & Business Rules'],
    ['_id', 'ObjectId', 'Primary Key, Auto', 'Unique identifier of the clinical medical report.'],
    ['patient', 'ObjectId', 'Foreign Key -> User, Req', 'Associated patient account.'],
    ['filename', 'String', 'Required', 'Internal filesystem storage name.'],
    ['fileType', 'String', 'Enum: pdf, image, other', 'MIME format classification of uploaded artifact.'],
    ['analysis.medications', 'Array of Objects', 'Schema Array', 'Extracted drug name, dosage, frequency, instructions.'],
    ['analysis.diagnoses', 'Array of Strings', 'Schema Array', 'Clinical disease diagnoses identified by AI.'],
    ['analysis.summary', 'String', 'Text', 'Plain-language patient-friendly explanation generated by GROQ.'],
    ['isAnalyzed', 'Boolean', 'Default: False', 'Flag indicating whether LLM extraction completed.']
  ];
  parts.push(tableXml(reportFields, [2200, 1500, 2300, 3600]));

  // Table 4: Alert
  parts.push(para('Entity 4: Alerts Collection (Alert.js)', { bold: true, fontSize: 22, color: '1A365D', spacingBefore: 120, spacingAfter: 40 }));
  const alertFields = [
    ['Field Name', 'Data Type', 'Constraints / Key', 'Description & Business Rules'],
    ['_id', 'ObjectId', 'Primary Key, Auto', 'Unique alert identifier.'],
    ['patient', 'ObjectId', 'Foreign Key -> User, Req', 'Patient who experienced the vital anomaly.'],
    ['type', 'String', 'Enum: vital, complication..', 'Category of health alert.'],
    ['severity', 'String', 'Enum: low, medium, high, critical', 'Clinical criticality rating.'],
    ['title', 'String', 'Required', 'Concise title of clinical warning.'],
    ['message', 'String', 'Required', 'Actionable remediation instructions.'],
    ['isResolved', 'Boolean', 'Default: False', 'Resolution status flag acknowledged by doctor/patient.']
  ];
  parts.push(tableXml(alertFields, [2200, 1500, 2300, 3600]));

  parts.push(heading3('3.2.2 Normalization'));
  parts.push(para(
    'Although MongoDB is a document-oriented database, the logical schema design of Heal From Home is rigorously structured to eliminate data redundancy and anomalies in accordance with Relational Normalization principles:',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));
  parts.push(bullet('First Normal Form (1NF): All attributes contain strictly atomic, non-decomposable values. Repeated multi-valued elements (e.g. daily symptom checklists, medication dose logs) are segregated into distinct subdocument arrays with unambiguous element indexing.'));
  parts.push(bullet('Second Normal Form (2NF): Every non-key attribute is fully functionally dependent on the primary key (_id). Attributes dependent only on user authentication (e.g. passwordHash, role) reside in Users, while clinical parameters reside in HealthLogs and PatientProfiles, completely eliminating partial dependencies.'));
  parts.push(bullet('Third Normal Form (3NF): Transitive functional dependencies are eradicated. For instance, Doctor specialization and clinic details are not repeated across every Appointment record; instead, Appointments reference doctor ObjectId, preventing update and deletion anomalies.'));

  // ==================== 3.3 COMPONENT DESIGN ====================
  parts.push(heading2('3.3 Component Design'));

  parts.push(heading3('3.3.1 Package Diagram'));
  parts.push(para('The Package Diagram models the modular organization of the codebase into functional logical namespaces using Mermaid notation:', { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }));
  
  const packageMermaid =
`flowchart TD
    subgraph Root["heal-from-home Root Package"]
        subgraph ClientPkg["frontend (Client Package)"]
            P1["pages/ (Dashboard, Vitals, Chat, Reports, Doctors)"]
            P2["components/ (Sidebar, TopBar, AppLayout)"]
            P3["context/ (AuthContext, ThemeContext)"]
            P4["utils/ (api Axios Instance)"]
        end

        subgraph ServerPkg["backend (Server Package)"]
            S1["routes/ (auth, healthLog, recovery, ai, doctor)"]
            S2["middleware/ (auth JWT Verification)"]
            S3["controllers/ (ai, healthLog, recovery, appointment)"]
            S4["models/ (User, HealthLog, Medication, Alert, Report)"]
        end
    end

    ClientPkg <==>|REST Endpoints (JSON)| ServerPkg`;
  parts.push(mermaidBlock(packageMermaid, 'Package Diagram'));

  parts.push(heading3('3.3.2 Component Diagram'));
  parts.push(para('The Component Diagram displays the runtime wiring between internal micro-modules and external service endpoints:', { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }));
  
  const compMermaid =
`flowchart LR
    A["React SPA Component"] -->|HTTP REST| B["Express Router"]
    B --> C["Auth Middleware (JWT)"]
    C --> D["HealthLog Controller"]
    C --> E["Recovery Controller"]
    C --> F["AI Controller"]
    D --> G["Alert Engine"]
    D & E --> H[("MongoDB Driver")]
    F -->|HTTPS LPU API| I["GROQ Cloud Inference"]`;
  parts.push(mermaidBlock(compMermaid, 'Component Diagram'));

  parts.push(heading3('3.3.3 Deployment Diagram'));
  parts.push(para('The Deployment Diagram illustrates the physical mapping of software artifacts onto physical and cloud compute nodes:', { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }));
  
  const deployMermaid =
`flowchart TB
    subgraph ClientNode["Client Device (PC / Smartphone)"]
        Browser["Modern Web Browser<br/>(React 18 SPA Artifact)"]
    end

    subgraph AppServerNode["Application Server Node (Cloud VM / Container)"]
        NodeServer["Node.js LTS Runtime<br/>(Express.js REST Engine : Port 5000)"]
    end

    subgraph CloudDB["Database Cluster (MongoDB Atlas)"]
        MongoCluster[("healfromhome_db<br/>(Port 27017, TLS 1.3)")]
    end

    subgraph AICloud["External AI Cluster (GROQ Cloud)"]
        LPU["GROQ Inference Engine<br/>(LLaMA-3.3-70B LPU Nodes)"]
    end

    Browser <==>|HTTPS / TLS 1.3 (Port 443)| NodeServer
    NodeServer <==>|Mongoose TCP / SSL| MongoCluster
    NodeServer <==>|Secure HTTPS REST API| LPU`;
  parts.push(mermaidBlock(deployMermaid, 'Deployment Diagram'));

  // ==================== 3.4 INTERFACE DESIGN ====================
  parts.push(heading2('3.4 Interface Design'));
  parts.push(heading3('3.4.1 Screen Layout Specifications'));
  parts.push(para('The user interface of Heal From Home employs a responsive, human-centered glassmorphism design language, providing high visual hierarchy and cognitive accessibility for recovering patients:', { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }));
  parts.push(bullet('Recovery Dashboard: Features a dynamic circular SVG gauge showcasing the 0–100 Recovery Score, color-coded by category (Green for Excellent, Blue for Good, Amber for Fair, Red for Needs Attention), accompanied by 7-day trend sparklines.'));
  parts.push(bullet('Health Logging Screen: Responsive input cards with real-time numeric validation for Systolic/Diastolic BP, Heart Rate, SpO2, Temperature, pain slider (0–10), and sleep counter.'));
  parts.push(bullet('MedAI Care Companion: Interactive conversational chat drawer offering streaming responses, conversation history memory, and quick-prompt chips for common post-discharge questions.'));
  parts.push(bullet('Medical Report Analyzer: Drag-and-drop file upload zone supporting PDF and image formats, rendering categorized tabbed cards for extracted medications, diagnoses, and patient-friendly instructions.'));
  parts.push(bullet('Doctor Directory & Booking: Grid-based specialist cards with specialty filter pills, consultation fee, doctor rating stars, and date/time modal slot pickers.'));

  // ==================== SECTION 4: APPENDICES ====================
  parts.push(para('', { pageBreakBefore: true }));
  parts.push(heading1('4. APPENDICES'));

  parts.push(heading2('Appendix C1: Glossary'));
  const glossaryRows = [
    ['Term / Acronym', 'Formal Definition'],
    ['AI (Artificial Intelligence)', 'The simulation of human intelligence processes by computer algorithms and machine learning models.'],
    ['AUC-ROC', 'Area Under the Receiver Operating Characteristic curve; a performance metric evaluating classification discrimination.'],
    ['BPM', 'Beats Per Minute; the clinical measurement unit for heart rate.'],
    ['CORS', 'Cross-Origin Resource Sharing; browser security standard restricting resource requests outside the origin domain.'],
    ['DFD / CFD', 'Data Flow Diagram / Control Flow Diagram; graphical models of data transformation and control logic.'],
    ['EHR', 'Electronic Health Record; systematized digital collection of patient health information.'],
    ['GROQ LPU', 'Language Processing Unit developed by Groq designed specifically for ultra-low latency LLM inference.'],
    ['HIPAA', 'Health Insurance Portability and Accountability Act of 1996; mandates strict safeguarding of Protected Health Information.'],
    ['JWT', 'JSON Web Token; compact, URL-safe means of cryptographically representing claims between two parties.'],
    ['LLM', 'Large Language Model; deep learning model trained on massive text corpora using Transformer architectures.'],
    ['MERN Stack', 'Full-stack software suite comprising MongoDB, Express.js, React, and Node.js.'],
    ['ODM', 'Object Data Modeling; mapping library (e.g. Mongoose) translating JSON objects to MongoDB documents.'],
    ['PHI', 'Protected Health Information; 18 personal identifiers defined under HIPAA regulations.'],
    ['RBAC', 'Role-Based Access Control; security mechanism restricting system access based on user role.'],
    ['RPM', 'Remote Patient Monitoring; technology enabling continuous digital collection of patient health data outside clinical settings.'],
    ['SpO2', 'Peripheral Capillary Oxygen Saturation; percentage of oxygen-saturated hemoglobin relative to total hemoglobin.']
  ];
  parts.push(tableXml(glossaryRows, [2400, 7200]));

  parts.push(heading2('Appendix C2: To Be Determined (TBD) List'));
  const tbdRows = [
    ['Item No.', 'TBD Topic', 'Current Working Assumption', 'Target Milestone'],
    ['TBD-01', 'Direct Bluetooth IoT Vitals Sync', 'Vitals currently entered manually via validated forms; Web-Bluetooth API integration planned for automatic pulse oximeter pairing.', 'Release 2.0 (Phase 2)'],
    ['TBD-02', 'Automated SMS / WhatsApp Gateway', 'Notifications currently surfaced via in-app toast and dashboard alerts; Twilio SMS gateway planned for emergency contacts.', 'Sprint 5 Testing'],
    ['TBD-03', 'Multi-Language Audio Transcription', 'Medical reports accepted in text/PDF; multi-lingual voice dictation via Whisper planned for rural patients.', 'Release 2.1']
  ];
  parts.push(tableXml(tbdRows, [1400, 2600, 3600, 2000]));

  const bodyXml = parts.join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

// 1. Write the new document.xml to template_extracted/word/document.xml
const targetXmlPath = path.join(__dirname, 'backend/template_extracted/word/document.xml');
fs.writeFileSync(targetXmlPath, buildSdsDocumentXml(), 'utf8');
console.log('Successfully generated new SDS document.xml with Mermaid blocks');

// 2. Package into Heal_From_Home_Software_Design_Specification.docx
const docxOutputPath = path.join(__dirname, 'Heal_From_Home_Software_Design_Specification.docx');
if (fs.existsSync(docxOutputPath)) {
  fs.unlinkSync(docxOutputPath);
}

const compressCmd = `powershell -Command "$ProgressPreference = 'SilentlyContinue'; Compress-Archive -Path 'backend/template_extracted/*' -DestinationPath 'Heal_From_Home_SDS.zip' -Force; Move-Item -Path 'Heal_From_Home_SDS.zip' -Destination 'Heal_From_Home_Software_Design_Specification.docx' -Force"`;
execSync(compressCmd);
console.log('Successfully generated Heal_From_Home_Software_Design_Specification.docx with Mermaid specifications!');

// Also create a copy in backend/
const backendCopyPath = path.join(__dirname, 'backend/Heal_From_Home_Software_Design_Specification.docx');
fs.copyFileSync(docxOutputPath, backendCopyPath);
console.log('Successfully copied to backend/Heal_From_Home_Software_Design_Specification.docx');
