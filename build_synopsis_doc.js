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
    lineSpacing = 276, // 1.15 line spacing
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
    spacingBefore: 240,
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
    spacingBefore: 180,
    spacingAfter: 80
  });
}

function bullet(text, prefix = '•  ') {
  return para([
    { text: prefix, bold: true, color: '2B6CB0' },
    ...(Array.isArray(text) ? text : [{ text: text }])
  ], {
    align: 'both',
    fontSize: 24,
    spacingBefore: 60,
    spacingAfter: 60
  });
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
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
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

// Assemble full XML body
function buildFullDocumentXml() {
  const parts = [];

  // ==================== COVER PAGE ====================
  parts.push(para('HEAL FROM HOME: AN INTELLIGENT POST-DISCHARGE REMOTE PATIENT MONITORING AND HEALTHCARE COMPANION SYSTEM USING MACHINE LEARNING AND GENERATIVE AI', {
    align: 'center',
    bold: true,
    fontSize: 32, // 16pt
    color: '0F294A',
    spacingBefore: 200,
    spacingAfter: 180,
    lineSpacing: 300
  }));

  parts.push(para('A Synopsis for\nProject-1', {
    align: 'center',
    bold: true,
    fontSize: 26, // 13pt
    color: '2B6CB0',
    spacingBefore: 80,
    spacingAfter: 80
  }));

  parts.push(para('BACHELOR OF TECHNOLOGY in COMPUTER SCIENCE & ENGINEERING', {
    align: 'center',
    bold: true,
    fontSize: 28, // 14pt
    color: '000000',
    spacingBefore: 100,
    spacingAfter: 180
  }));

  parts.push(para('BY', {
    align: 'center',
    bold: true,
    fontSize: 24,
    spacingBefore: 60,
    spacingAfter: 100
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
    spacingBefore: 80,
    spacingAfter: 180,
    lineSpacing: 280
  }));

  parts.push(para('Under the Guidance of', {
    align: 'center',
    bold: true,
    fontSize: 24,
    spacingBefore: 100,
    spacingAfter: 60
  }));

  parts.push(para([
    { text: '<Name of the Guide(s)>\n', bold: true, fontSize: 26, color: '1A365D' },
    { text: '<Designation / Department of Computer Science & Engineering>', italic: true, fontSize: 22 }
  ], {
    align: 'center',
    spacingBefore: 40,
    spacingAfter: 160
  }));

  // University Logo
  parts.push(imagePara('rId6', 2708010, 1864532));

  parts.push(para('Department of Computer Science & Engineering, Faculty of Engineering\nMEDICAPS UNIVERSITY, INDORE - 453331\nAugust - December 2026', {
    align: 'center',
    bold: true,
    fontSize: 24,
    color: '000000',
    spacingBefore: 140,
    spacingAfter: 200,
    lineSpacing: 280
  }));

  // ==================== SECTION 1: INTRODUCTION ====================
  parts.push(para('', { pageBreakBefore: true }));
  parts.push(heading1('1. INTRODUCTION'));

  parts.push(para(
    'Hospital-to-home transitions represent one of the most clinically vulnerable intervals in patient healthcare delivery. Epidemiological and health services studies reveal that nearly one in every five patients discharged from acute inpatient medical services is readmitted within thirty days [2]. This high rate of unplanned readmission imposes a severe clinical, psychological, and financial burden on patients, families, and healthcare infrastructures globally. The fundamental driver of avoidable readmissions is the persistent "transitional care disconnect" — the sudden cessation of continuous clinical oversight once the patient leaves the hospital wards. At home, patients and family caregivers are abruptly expected to manage complex pharmacological schedules, track vital signs without specialized medical training, interpret dense laboratory and discharge documentation, and identify subtle physiological deterioration before it escalates into life-threatening emergencies.',
    { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 100 }
  ));

  parts.push(para(
    'Recent breakthroughs in Artificial Intelligence (AI), Natural Language Processing (NLP), and Connected Health have demonstrated tremendous transformative potential in revolutionizing healthcare delivery [1], [4]. Specifically, Large Language Models (LLMs) built upon Transformer architectures [5] possess state-of-the-art capabilities in contextual language comprehension, medical entity extraction, clinical summarization, and human-like conversational interaction [1]. Simultaneously, clinical research has proven that Remote Patient Monitoring (RPM) data capturing post-discharge daily physical activity patterns, sleep metrics, and longitudinal physiological parameters drastically enhances the predictive accuracy of hospital readmission models when analyzed using modern non-parametric machine learning techniques [2]. Furthermore, prompt-engineered and fine-tuned LLM architectures have established reliable mechanisms to de-identify Protected Health Information (PHI) under HIPAA regulations [3], ensuring strict patient privacy during automated clinical data processing.',
    { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 100 }
  ));

  parts.push(para(
    'Motivated by these foundational insights, this project presents "Heal From Home" (Heal-FH) — a full-stack, production-ready, intelligent post-discharge care companion platform. Heal From Home bridges the hospital-to-home divide by establishing a continuous digital ecosystem that connects recovering patients, caregivers, and attending physicians. The platform integrates continuous vital signs logging (blood pressure, heart rate, oxygen saturation, temperature, pain levels), automated dynamic recovery scoring (0–100 index), clinical threshold-based complication risk stratification, and high-speed Generative AI (GROQ-accelerated LLaMA-3.3-70B). Through its AI-powered modules, Heal From Home decodes complex medical discharge summaries into actionable, plain-language patient guides, redacts sensitive identifiers for privacy preservation, delivers 24/7 conversational recovery guidance via "MedAI", and provides verified doctor discovery and tele-appointment scheduling.',
    { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 120 }
  ));

  // ==================== SECTION 2: LITERATURE REVIEW ====================
  parts.push(heading1('2. LITERATURE REVIEW'));

  parts.push(para(
    'The conceptual and technical foundation of "Heal From Home" is derived from rigorous cross-disciplinary literature at the intersection of medical natural language processing, post-discharge remote monitoring clinical trials, privacy-preserving LLM de-identification, and generative AI healthcare applications. The following studies provide the direct theoretical and empirical justification for the system:',
    { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 100 }
  ));

  parts.push(para([
    { text: 'Liu et al. (2025) [1] ', bold: true, color: '1A365D' },
    { text: 'conducted a comprehensive systematic literature review evaluating the architecture, training frameworks, and clinical deployment of Large Language Models in healthcare across SCI-indexed literature. The authors established that Transformer-based pre-trained models (such as BioBERT, Clinical BERT, Med-PaLM 2, and Huatuo-GPT) demonstrate exceptional generalization across downstream clinical tasks, including disease diagnosis, clinical decision support, medical knowledge popularization, and automated discharge summarization. The review highlighted critical open challenges, most notably the "black-box" interpretability problem, the heterogeneity of structured and unstructured Electronic Health Record (EHR) data, strict data privacy compliance (HIPAA and GDPR), and the hazard of medical hallucination. Liu et al. emphasized that clinical language models must be paired with domain-specific prompting, honest expert validation, and constrained decoding to ensure patient safety. Heal From Home directly implements these recommendations by employing zero/few-shot structured JSON schemas, deterministic risk-alerting safeguards, and mandatory physician consultation disclaimers.' }
  ], { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 100 }));

  parts.push(para([
    { text: 'Patel et al. (2023) [2] ', bold: true, color: '1A365D' },
    { text: 'conducted a pivotal two-arm randomized clinical trial (the PREDICT trial) across 500 hospitalized patients discharged from inpatient medicine services at two Penn Medicine hospitals to evaluate whether remote patient monitoring (RPM) activity data collected post-discharge improves 30-day hospital readmission prediction. The authors demonstrated that conventional parametric regression models (logistic regression and Lasso) relying solely on static electronic health record data available at discharge achieved poor predictive discrimination, with Area Under the Receiver Operating Characteristic Curve (AUC) values ranging between 0.60 and 0.70. However, when models incorporated remotely monitored post-discharge behavioral data — specifically daily step counts, physical activity intensity minutes, sleep duration, and daily vitals — paired with non-parametric machine learning approaches (Random Forest, Gradient Boosting, and Ensemble Learning), predictive accuracy increased substantially to an AUC of 0.84 to 0.85 (P < 0.001). This empirical proof establishes that tracking patient behavior and vitals dynamically after discharge is crucial for anticipating deterioration. Heal From Home builds directly upon Patel et al.’s findings by incorporating daily vitals, physical activity levels, sleep duration, and medication adherence into its real-time multi-factorial recovery scoring engine.' }
  ], { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 100 }));

  parts.push(para([
    { text: 'Yashwanth and Shettar (2024) [3] ', bold: true, color: '1A365D' },
    { text: 'investigated zero-shot and few-shot learning methodologies using Large Language Models (including GPT-3.5, GPT-4, PaLM, and LLaMA) for automated de-identification of Protected Health Information (PHI) from unstructured clinical narratives based on the 2014 i2b2/UTHealth benchmark dataset. The authors demonstrated that few-shot fine-tuning with as few as 30 to 50 domain-specific examples enabled models to achieve over 99% entity-wise de-identification accuracy across all 18 HIPAA identifier categories, outperforming zero-shot counterparts and demonstrating strong resilience against diverse medical record formats. Furthermore, the authors demonstrated that fine-tuning smaller, specialized models resulted in a tenfold reduction in operational API token costs compared to larger closed-source models ($0.003 vs $0.03 per 1K tokens), making scalable, privacy-preserving automated clinical report processing practically viable. Heal From Home incorporates these prompt engineering and de-identification principles within its Medical Report Analyzer module to sanitize uploaded discharge summaries and clinical documents before AI synthesis, upholding patient data confidentiality.' }
  ], { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 100 }));

  parts.push(para([
    { text: 'Sai et al. (2024) [4] ', bold: true, color: '1A365D' },
    { text: 'presented an extensive survey on the transformative applications and limitations of Generative AI across diverse healthcare domains. The study explored how foundational models (including Med-PaLM, BioGPT, BART, and ChatGPT) facilitate medical chatbots, clinical documentation summarization, medication administration guidance, and clinical triage support. Crucially, Sai et al. analyzed key systemic bottlenecks, including the "attribution problem" (the difficulty of elucidating AI decision rationale), contextualization deficits, data bias, and regulatory liabilities. The authors underscored the necessity of a "human-in-the-loop" paradigm where generative AI acts as an assistive companion that augments human clinical competence rather than replacing it. In Heal From Home, this principle is strictly instantiated: the AI assistant (MedAI) provides patient-friendly educational explanations and structured report breakdowns, while serious clinical risks trigger deterministic alerts and direct patients to book consultations with verified medical specialists.' }
  ], { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 120 }));

  // Comparative Literature Table
  parts.push(para('Table 1: Comprehensive Synthesis and Comparative Analysis of Referenced Literature', {
    align: 'center',
    bold: true,
    fontSize: 22,
    color: '1A365D',
    spacingBefore: 100,
    spacingAfter: 60
  }));

  const tableRows = [
    [
      'Reference & Year',
      'Core Methodology & Domain',
      'Key Findings & Benchmarks',
      'Integration in Heal From Home'
    ],
    [
      'Liu et al. (2025) [1]\nIEEE Access',
      'Systematic Literature Review of LLMs in healthcare (Transformer, Pre-training, Fine-tuning, Prompting).',
      'LLMs achieve expert-level medical Q&A; identifies hallucination, black-box, and HIPAA privacy risks.',
      'Guides prompt engineering, structured JSON extraction schemas, and physician disclaimer safeguards.'
    ],
    [
      'Patel et al. (2023) [2]\nScientific Reports',
      'Randomized clinical trial (n=500) using post-discharge RPM (smartphones/wearables) & non-parametric ML.',
      'Adding RPM activity/sleep/vitals to ML models boosted 30-day readmission prediction AUC from 0.63 to 0.85.',
      'Forms the empirical foundation of the 5-component dynamic Recovery Score & daily vital logging.'
    ],
    [
      'Yashwanth & Shettar (2024) [3]\nIEEE Access',
      'Zero-shot & few-shot LLM de-identification of 18 HIPAA PHI identifiers on i2b2/UTHealth clinical records.',
      'Few-shot prompt-tuned models reached 99% accuracy; achieved 10x cost reduction per 1K tokens.',
      'Establishes the privacy-preserving sanitization protocol for patient report upload & processing.'
    ],
    [
      'Sai et al. (2024) [4]\nIEEE Access',
      'Comprehensive study of Generative AI, healthcare LLMs (Med-PaLM, BioGPT), chatbots, and triage.',
      'Identifies attribution, data bias, and safety issues; mandates human-in-the-loop clinical supervision.',
      'Directs MedAI conversational companion design and seamless integration with doctor appointment booking.'
    ]
  ];

  parts.push(tableXml(tableRows, [2100, 2600, 2500, 2400]));

  // ==================== SECTION 3: PROBLEM DEFINITION ====================
  parts.push(heading1('3. PROBLEM DEFINITION'));

  parts.push(para(
    'The transition from acute hospital inpatient care to self-management at home is fraught with structural, clinical, and informational vulnerabilities that precipitate high readmission rates and adverse health outcomes:',
    { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 80 }
  ));

  parts.push(bullet([
    { text: 'Lack of Real-Time Post-Discharge Monitoring: ', bold: true },
    { text: 'Conventional healthcare models operate on episodic, reactive care. Once discharged, patients are unmonitored until their scheduled follow-up visit (typically 2 to 4 weeks later). Physiological deterioration (such as dropping SpO2, worsening hypertension, or spiking fever) often occurs silently, leaving no opportunity for early outpatient intervention.' }
  ]));

  parts.push(bullet([
    { text: 'Complex Discharge Instructions and Poor Medical Comprehension: ', bold: true },
    { text: 'Discharge summaries and diagnostic lab reports are filled with intricate medical terminology, Latin abbreviations, and dense clinical phrasing. Patients and elderly caregivers struggle to decipher medication regimens, dosage frequencies, activity restrictions, and red-flag symptoms, directly causing medication non-adherence and therapeutic failure.' }
  ]));

  parts.push(bullet([
    { text: 'Ineffective Complication Risk Stratification: ', bold: true },
    { text: 'As demonstrated by Patel et al. [2], static discharge-time EHR data alone cannot reliably predict post-discharge complications (AUC 0.60–0.70). Existing patient portals lack intelligent multi-parametric scoring algorithms capable of synthesizing vitals, activity levels, sleep duration, and medication adherence into an actionable recovery index.' }
  ]));

  parts.push(bullet([
    { text: 'Data Privacy Concerns in Automated Clinical Processing: ', bold: true },
    { text: 'As identified by Liu et al. [1] and Yashwanth & Shettar [3], deploying AI in healthcare without strict de-identification risks catastrophic leaks of Protected Health Information (PHI), violating statutory HIPAA and GDPR mandates.' }
  ]));

  parts.push(bullet([
    { text: 'Absence of an Integrated Care Ecosystem: ', bold: true },
    { text: 'Current solutions are siloed: telemedicine apps offer only synchronous video calls, fitness wearables record raw step counts without clinical context, and patient portals act as static document repositories without intelligent conversational guidance or direct doctor discovery.' }
  ]));

  // ==================== SECTION 4: OBJECTIVES ====================
  parts.push(heading1('4. OBJECTIVES'));

  parts.push(para(
    'The primary aim of "Heal From Home" is to develop and deploy an end-to-end, intelligent, full-stack post-discharge healthcare companion platform that continuously tracks patient recovery, predicts clinical complications, demystifies medical records through Generative AI, and connects patients with verified physicians. The specific objectives are as follows:',
    { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 80 }
  ));

  parts.push(bullet([
    { text: 'Objective 1: Full-Stack Web Platform Architecture: ', bold: true },
    { text: 'Design and engineer a responsive, accessible, production-ready web application using the MERN stack (MongoDB, Express.js, React 18, Node.js) featuring modern glassmorphic design and light/dark mode adaptability.' }
  ]));

  parts.push(bullet([
    { text: 'Objective 2: Multi-Parametric Dynamic Recovery Score (0–100): ', bold: true },
    { text: 'Formulate and implement an automated 5-component recovery index synthesizing vitals (30%), symptoms/pain (20%), physical activity (20%), sleep patterns (15%), and medication adherence (15%) to quantify patient healing trajectories over a rolling 7-day window.' }
  ]));

  parts.push(bullet([
    { text: 'Objective 3: Clinical Threshold Complication Predictor & Smart Alerting: ', bold: true },
    { text: 'Implement a rule-based clinical risk engine that continuously monitors physiological thresholds (SpO2 < 93%, abnormal heart rates, severe hypertension, fever > 38.5°C, high pain scores) and automatically generates categorized (High/Medium/Low) alerts with immediate remedial recommendations.' }
  ]));

  parts.push(bullet([
    { text: 'Objective 4: Generative AI Medical Report Analyzer: ', bold: true },
    { text: 'Integrate the high-speed GROQ API (LLaMA-3.3-70B) to parse uploaded medical reports and clinical text, automatically extracting structured JSON entities (medications, diagnoses, lab values, restrictions, follow-ups) and generating a plain-language summary for patient understanding.' }
  ]));

  parts.push(bullet([
    { text: 'Objective 5: 24/7 Conversational Care Assistant (MedAI): ', bold: true },
    { text: 'Deploy an intelligent, context-aware AI chatbot equipped with conversational history memory, medical knowledge dissemination, and strict safety guardrails prioritizing clinical consultation for alarming symptoms.' }
  ]));

  parts.push(bullet([
    { text: 'Objective 6: HIPAA-Aligned Privacy & Role-Based Security: ', bold: true },
    { text: 'Incorporate JSON Web Token (JWT) authentication, bcrypt password hashing, role-based authorization (Patient, Doctor, Caregiver, Admin), and prompt-based PHI de-identification mechanisms to guarantee data confidentiality.' }
  ]));

  parts.push(bullet([
    { text: 'Objective 7: Doctor Discovery & Appointment Management System: ', bold: true },
    { text: 'Build an interactive directory of verified medical specialists searchable by specialization, consultation fee, and rating, complete with date/time slot booking and status tracking.' }
  ]));

  // ==================== SECTION 5: METHODOLOGY ====================
  parts.push(heading1('5. METHODOLOGY'));

  parts.push(para(
    'The methodology of "Heal From Home" follows an agile, modular software engineering paradigm grounded in clinical data science and modern AI integration. The architecture is organized into four distinct tiers:',
    { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 100 }
  ));

  parts.push(heading2('5.1 System Architecture'));

  parts.push(bullet([
    { text: 'Presentation Layer (Frontend): ', bold: true },
    { text: 'Built with React 18, React Router v6, and Framer Motion. Implements an ultra-modern glassmorphic interface with real-time interactive health charts powered by Chart.js, responsive layouts for mobile and desktop, and dual-theme (light/dark) support.' }
  ]));

  parts.push(bullet([
    { text: 'Application & API Layer (Backend): ', bold: true },
    { text: 'Developed using Node.js and Express.js RESTful architecture. Manages authentication, middleware validation, vital sign ingestion, recovery score computation, automated alert dispatching, and appointment scheduling.' }
  ]));

  parts.push(bullet([
    { text: 'Intelligence Layer (AI & ML Engine): ', bold: true },
    { text: 'Leverages the GROQ cloud inference SDK running the LLaMA-3.3-70B model for ultra-low-latency natural language processing, report parsing, and conversational care, complemented by a deterministic clinical rule engine.' }
  ]));

  parts.push(bullet([
    { text: 'Persistence Layer (Database): ', bold: true },
    { text: 'Utilizes MongoDB with Mongoose ODM for scalable, schema-driven document storage of user credentials, health logs, medication schedules, hospital records, and analyzed medical reports.' }
  ]));

  parts.push(heading2('5.2 Mathematical Formulation of the Dynamic Recovery Score'));
  parts.push(para(
    'To evaluate post-discharge recovery dynamically as advocated by Patel et al. [2], Heal From Home implements a multi-factorial recovery score evaluated over a rolling 7-day window. The overall score S_recovery (ranging from 0 to 100) is defined as:',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  parts.push(para('S_recovery = S_vitals + S_symptoms + S_activity + S_sleep + S_medication', {
    align: 'center',
    bold: true,
    fontSize: 26,
    color: '1A365D',
    spacingBefore: 80,
    spacingAfter: 80
  }));

  parts.push(bullet([
    { text: 'Vitals Score (30 Points Maximum): ', bold: true },
    { text: 'Evaluates the most recent vital parameters. Starting from a base of 30: deductions occur if Heart Rate < 50 or > 100 bpm (-8 pts), SpO2 < 95% (-12 pts), or Systolic BP < 90 or > 140 mmHg (-10 pts). Minimum score is 0.' }
  ]));

  parts.push(bullet([
    { text: 'Symptoms and Pain Score (20 Points Maximum): ', bold: true },
    { text: 'Computed from the average self-reported visual analogue pain score (0 to 10) over the previous 7 days: S_symptoms = max(0, 20 - 2 × Pain_avg).' }
  ]));

  parts.push(bullet([
    { text: 'Physical Activity Score (20 Points Maximum): ', bold: true },
    { text: 'Mapped from daily ambulation tiers: Bedrest (5 pts), Minimal mobility (10 pts), Light activity (15 pts), Moderate walking (18 pts), and Fully Active (20 pts).' }
  ]));

  parts.push(bullet([
    { text: 'Sleep Hygiene Score (15 Points Maximum): ', bold: true },
    { text: 'Derived from 7-day average sleep duration: Optimal sleep (7–9 hours) yields 15 pts, 6–7 hours yields 10 pts, and < 6 or > 9 hours yields 5 pts.' }
  ]));

  parts.push(bullet([
    { text: 'Medication Adherence Score (15 Points Maximum): ', bold: true },
    { text: 'Calculated as: S_medication = round((Doses_taken / Doses_scheduled) × 15) across all active prescriptions over the last 7 days.' }
  ]));

  parts.push(para(
    'Recovery scores are automatically classified into clinical status categories: Excellent (80–100), Good (60–79), Fair (40–59), and Needs Attention (< 40), triggering corresponding visual cues and physician dashboard updates.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 100 }
  ));

  parts.push(heading2('5.3 Rule-Based Complication Prediction & Smart Alerting'));
  parts.push(para(
    'Heal From Home continuously compares logged vitals against established clinical crisis thresholds. When critical thresholds are breached, the system instantly logs an alert, assigns a severity rating, and presents an immediate recommendation:',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  const alertRows = [
    ['Clinical Parameter', 'Alert Trigger Threshold', 'Assigned Severity', 'Automated Remedial Recommendation'],
    ['Oxygen Saturation (SpO2)', '< 93%', 'HIGH (Critical)', 'Immediate supplemental oxygen check; seek emergency medical care.'],
    ['Heart Rate (Pulse)', '> 130 bpm or < 45 bpm', 'HIGH (Critical)', 'Severe tachycardia/bradycardia detected; consult cardiologist immediately.'],
    ['Systolic Blood Pressure', '> 160 mmHg or < 90 mmHg', 'HIGH (Critical)', 'Hypertensive crisis or severe hypotension; administer medication and notify doctor.'],
    ['Body Temperature', '> 38.5 °C (101.3 °F)', 'MEDIUM (Warning)', 'Fever detected; monitor temperature progression and take prescribed antipyretics.'],
    ['Pain Severity Scale', 'Score ≥ 7 / 10', 'MEDIUM (Warning)', 'Severe acute pain; review analgesic regimen and contact attending physician.']
  ];
  parts.push(tableXml(alertRows, [2200, 2000, 1800, 3600]));

  parts.push(heading2('5.4 Generative AI Medical Report Analysis & MedAI Pipeline'));
  parts.push(para(
    'The AI subsystem integrates GROQ’s LPU (Language Processing Unit) inference infrastructure running the open-weights LLaMA-3.3-70B model. To overcome the hallucination and attribution issues highlighted by Liu et al. [1] and Sai et al. [4], the Medical Report Analyzer employs strict zero-shot constrained JSON prompting (Temperature = 0.2). It parses complex reports and outputs structured fields: medications (name, dosage, frequency, instructions), primary diagnoses, abnormal lab values, physical restrictions, follow-up instructions, and a simplified patient-friendly summary.',
    { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 80 }
  ));

  parts.push(para(
    'In accordance with Yashwanth & Shettar [3], Protected Health Information (PHI) identifiers are redacted prior to model ingestion. Furthermore, the conversational assistant "MedAI" maintains a rolling 10-turn dialogue memory, utilizes empathetic and medically grounded system prompts, and enforces strict ethical boundaries by mandating professional consultation whenever red-flag symptoms are presented.',
    { align: 'both', fontSize: 24, spacingBefore: 80, spacingAfter: 100 }
  ));

  parts.push(heading2('5.5 Hardware and Software Specifications'));
  const specRows = [
    ['Component Category', 'Development Environment', 'Deployment / Production Environment'],
    ['Operating System', 'Windows 11 / Linux (Ubuntu 22.04 LTS)', 'Cloud Linux (Ubuntu Server / Alpine Container)'],
    ['Processor (CPU)', 'Intel Core i5 / AMD Ryzen 5 or higher', '2+ vCPU Cloud Compute Instance'],
    ['System Memory (RAM)', '8 GB minimum (16 GB recommended)', '4 GB RAM minimum'],
    ['Frontend Framework', 'React 18, React Router v6, Framer Motion', 'HTML5, CSS3, ES6+ bundled via Webpack / Vite'],
    ['Backend Runtime', 'Node.js v18.0+, Express.js v4.18', 'Node.js LTS with PM2 Process Manager'],
    ['Database Server', 'MongoDB Community Server v7.0 (Local)', 'MongoDB Atlas Cloud Managed Database Cluster'],
    ['AI Inference Engine', 'GROQ SDK (llama-3.3-70b-versatile)', 'GROQ Cloud API with High-Speed LPUs'],
    ['Authentication & Security', 'JWT, bcryptjs, Helmet, CORS, Rate Limit', 'HTTPS/TLS 1.3, Encrypted Environment Secrets']
  ];
  parts.push(tableXml(specRows, [2400, 3600, 3600]));

  // ==================== SECTION 6: REFERENCES ====================
  parts.push(heading1('6. REFERENCES'));

  parts.push(para('Journal References', {
    bold: true,
    fontSize: 24,
    color: '1A365D',
    spacingBefore: 120,
    spacingAfter: 60
  }));

  parts.push(para(
    '[1]. Liu Q., Yang R., Gao Q., Liang T., Wang X., Li S., Lei B., Gao K., “A Review of Applying Large Language Models in Healthcare.”, IEEE Access, Volume 13, pp: 6878-6892, 2025.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  parts.push(para(
    '[2]. Patel M.S., Volpp K.G., Small D.S., Kanter G.P., Park S.H., Evans C.N., Polsky D., “Using remotely monitored patient activity patterns after hospital discharge to predict 30 day hospital readmission: a randomized trial.”, Scientific Reports, Volume 13, Article no: 8258, pp: 1-9, 2023.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  parts.push(para(
    '[3]. Yashwanth Y.S., Shettar R., “Zero and Few Short Learning Using Large Language Models for De-Identification of Medical Records.”, IEEE Access, Volume 12, pp: 110385-110393, 2024.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  parts.push(para(
    '[4]. Sai S., Gaur A., Sai R., Chamola V., Guizani M., Rodrigues J.J.P.C., “Generative AI for Transformative Healthcare: A Comprehensive Study of Emerging Models, Applications, Case Studies, and Limitations.”, IEEE Access, Volume 12, pp: 31078-31106, 2024.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  parts.push(para('Conference References', {
    bold: true,
    fontSize: 24,
    color: '1A365D',
    spacingBefore: 120,
    spacingAfter: 60
  }));

  parts.push(para(
    '[5]. Vaswani A., Shazeer N., Parmar N., Uszkoreit J., Jones L., Gomez A.N., Kaiser Ł., Polosukhin I., “Attention is all you need.”, Thirty-first Conference on Neural Information Processing Systems (NeurIPS), pp: 6000-6010, 2017.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  parts.push(para('URL References', {
    bold: true,
    fontSize: 24,
    color: '1A365D',
    spacingBefore: 120,
    spacingAfter: 60
  }));

  parts.push(para(
    '[6]. GROQ Cloud High-Performance AI Inference Platform https://console.groq.com, accessed on 03/11/2026 at 08:30 PM.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

  parts.push(para(
    '[7]. U.S. Department of Health and Human Services, Health Insurance Portability and Accountability Act (HIPAA) Privacy Rule https://www.hhs.gov/hipaa/, accessed on 03/11/2026 at 08:45 PM.',
    { align: 'both', fontSize: 24, spacingBefore: 60, spacingAfter: 60 }
  ));

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
fs.writeFileSync(targetXmlPath, buildFullDocumentXml(), 'utf8');
console.log('Successfully generated new document.xml');

// 2. Package into Heal_From_Home_Synopsis.docx using PowerShell Compress-Archive
const docxOutputPath = path.join(__dirname, 'Heal_From_Home_Synopsis.docx');
if (fs.existsSync(docxOutputPath)) {
  fs.unlinkSync(docxOutputPath);
}

const compressCmd = `powershell -Command "$ProgressPreference = 'SilentlyContinue'; Compress-Archive -Path 'backend/template_extracted/*' -DestinationPath 'Heal_From_Home_Synopsis.zip' -Force; Move-Item -Path 'Heal_From_Home_Synopsis.zip' -Destination 'Heal_From_Home_Synopsis.docx' -Force"`;
execSync(compressCmd);
console.log('Successfully generated Heal_From_Home_Synopsis.docx at root!');

// Also create an identical copy in backend/ for convenience
const backendCopyPath = path.join(__dirname, 'backend/Heal_From_Home_Synopsis.docx');
fs.copyFileSync(docxOutputPath, backendCopyPath);
console.log('Successfully copied to backend/Heal_From_Home_Synopsis.docx');
