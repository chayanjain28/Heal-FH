import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, FileText, Sparkles, CheckCircle2, AlertTriangle, 
  Clock, ShieldAlert, Pill, Dumbbell, Utensils, AlertOctagon,
  ArrowRight, Check, Activity
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SAMPLE_DISCHARGE_SUMMARY = `HOSPITAL DISCHARGE SUMMARY
Apollo Multispecialty Hospitals, New Delhi
Department of Surgical Gastroenterology

PATIENT INFORMATION:
Patient Name: John Doe | Age: 52 Yrs | Gender: Male
IP No: IP-94821 | Admission Date: 12-Nov-2026 | Discharge Date: 16-Nov-2026
Consultant: Dr. Rajesh Gupta (MS, MCh - Surgical Gastroenterology)

PRIMARY DIAGNOSIS & PROCEDURE:
- Diagnosis: Symptomatic Cholelithiasis with Acute Cholecystitis
- Procedure Performed: Laparoscopic Cholecystectomy (Four-port technique) under General Anesthesia on 13-Nov-2026.
- Operative Findings: Distended gallbladder with multiple gallstones. No bile duct injury. Hemostasis secured. Incisions closed subcuticularly.
- Post-Operative Course: Patient tolerated oral liquids on POD 1, soft diet on POD 2. Vitals stable, afebrile, passing flatus.

DISCHARGE MEDICATIONS:
1. Tab. Augmentin 625mg (Amoxicillin 500mg + Clavulanic Acid 125mg) - 1 tablet TDS (three times daily) after meals for 5 days.
2. Tab. Pantocid 40mg (Pantoprazole) - 1 tablet OD (once daily) in morning 30 minutes before breakfast for 10 days.
3. Tab. Ultracet (Tramadol 37.5mg + Paracetamol 325mg) - 1 tablet SOS (as needed for severe pain, maximum 2 tablets in 24 hours).
4. Gelusil Antacid Syrup - 10ml as needed for gastric acidity. (Note: Do not take within 2 hours of Augmentin).
5. Tab. Dulcolax (Bisacodyl 5mg) - 1 tablet at bedtime if constipated.

DIETARY GUIDELINES:
- Follow a low-fat, easily digestible diet for 3 weeks (steamed vegetables, lean proteins, soups).
- Avoid oily, fried, heavily spiced foods and carbonated drinks.
- Maintain adequate hydration: 2 to 2.5 Liters of water daily.
- Absolutely NO alcohol consumption while taking pain medication (Tramadol).

POST-OPERATIVE REHABILITATION & EXERCISES:
- Incentive Spirometry: 10 deep breathing cycles every 2 hours while awake to prevent atelectasis.
- DVT Prophylaxis: Ankle pump exercises 20 times every hour while resting in bed.
- Ambulation: Short assisted walks for 10-15 minutes, 3 times daily.
- Activity Restrictions: Strictly no lifting objects heavier than 5 kg (10 lbs) for 3 weeks. No driving for 7 days. Keep dressing clean and dry.

FOLLOW-UP & RED FLAGS:
- Suture removal / Wound check on 24-Nov-2026 with Dr. Rajesh Gupta.
- EMERGENCY RED FLAGS (Call 108 or hospital immediately):
  * Temperature > 100.4°F (38°C) with chills.
  * Spreading redness, swelling, or foul-smelling yellow discharge from port sites.
  * Severe persistent abdominal pain or abdominal distension.
  * Jaundice (yellowing of eyes or skin).`;

const DischargeAutomationModal = ({ isOpen, onClose, onPathwayApplied }) => {
  const [file, setFile] = useState(null);
  const [dischargeText, setDischargeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState('input'); // 'input', 'processing', 'result'
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('meds');

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setDischargeText(SAMPLE_DISCHARGE_SUMMARY);
    toast.success('Sample hospital discharge summary loaded!');
  };

  const handleProcess = async () => {
    if (!file && !dischargeText.trim()) {
      return toast.error('Please upload a discharge summary PDF or paste summary text.');
    }

    setLoading(true);
    setActiveStep('processing');
    setProgressMsg('Extracting surgical history and clinical diagnoses...');

    const timer1 = setTimeout(() => {
      setProgressMsg('Cross-referencing medications and checking drug-drug interactions...');
    }, 1800);

    const timer2 = setTimeout(() => {
      setProgressMsg('Generating personalized timeline, rehabilitation exercises, and safety alerts...');
    }, 3800);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('dischargeSummary', file);
      }
      formData.append('dischargeText', dischargeText);
      formData.append('applyDirectly', 'true');

      const { data } = await api.post('/ai/auto-pathway', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (data.success) {
        setResult(data);
        setActiveStep('result');
        toast.success(data.message || 'Automated care pathway created!');
        if (onPathwayApplied) onPathwayApplied(data);
      } else {
        toast.error(data.message || 'Failed to process discharge summary');
        setActiveStep('input');
      }
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error(err);
      toast.error(err.response?.data?.message || 'Processing failed. Check API connection.');
      setActiveStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setDischargeText('');
    setActiveStep('input');
    setResult(null);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(3, 7, 18, 0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        style={{
          width: '100%', maxWidth: 840, maxHeight: '90vh',
          background: 'var(--bg-card)', borderRadius: 24,
          border: '1px solid var(--glass-border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(16, 185, 129, 0.1))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Zero-Click Care Pathway Automation
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Instant AI ingestion: converts hospital discharge papers into active schedules, drug safety checks & milestones.
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeStep === 'input' && (
            <div>
              <div style={{
                padding: '14px 18px', borderRadius: 14,
                background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.2)',
                marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    💡 Real-World Problem Solved
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Patients never type 10 medications manually. Upload or paste the discharge sheet, and the system automates everything.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  style={{
                    padding: '8px 14px', borderRadius: 10,
                    background: 'var(--gradient-main)', color: '#fff',
                    border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0
                  }}
                >
                  <Sparkles size={14} /> Load Realistic Sample
                </button>
              </div>

              {/* Upload Dropzone */}
              <div style={{
                border: '2px dashed var(--glass-border)', borderRadius: 16,
                padding: 24, textAlign: 'center', background: 'var(--glass-bg)',
                marginBottom: 20, cursor: 'pointer', position: 'relative'
              }}>
                <input
                  type="file"
                  accept=".pdf,.txt,image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(14, 165, 233, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={22} color="#0ea5e9" />
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {file ? file.name : 'Drop Discharge Summary (PDF / Image / TXT)'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'Or click to browse files from your computer'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: '12px 0', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ── OR PASTE HOSPITAL SUMMARY TEXT ──
              </div>

              <textarea
                value={dischargeText}
                onChange={(e) => setDischargeText(e.target.value)}
                placeholder="Paste the doctor's discharge summary, medication list, or clinical instructions here..."
                rows={8}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14,
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'monospace',
                  lineHeight: 1.5, resize: 'vertical', outline: 'none'
                }}
              />
            </div>
          )}

          {activeStep === 'processing' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{ width: 56, height: 56, margin: '0 auto 24px', borderWidth: 4 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Autonomous Healthcare Engine Running
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, minHeight: 24 }}>
                {progressMsg}
              </p>
              <div style={{ maxWidth: 400, margin: '24px auto 0', height: 6, borderRadius: 4, background: 'var(--glass-border)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: '10%' }}
                  animate={{ width: '90%' }}
                  transition={{ duration: 5, ease: 'easeInOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #10b981)' }}
                />
              </div>
            </div>
          )}

          {activeStep === 'result' && result && (
            <div>
              {/* Success Badge Banner */}
              <div style={{
                padding: '16px 20px', borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(14, 165, 233, 0.15))',
                border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <CheckCircle2 size={20} color="#10b981" />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    Care Pathway Autonomously Ingested & Active
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  <strong>{result.analysis?.procedureOrDiagnosis || 'Post-Op Condition'}</strong>: Scheduled {result.medicationsCount} medications, generated daily exercise regimen, and activated {result.alertsCreatedCount} safety monitors.
                </p>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--glass-border)', paddingBottom: 12, marginBottom: 16 }}>
                {[
                  { id: 'meds', label: `Medications (${result.analysis?.medications?.length || 0})`, icon: Pill },
                  { id: 'interactions', label: `Drug & Food Safety (${(result.analysis?.drugInteractions?.length || 0) + (result.analysis?.foodConflicts?.length || 0)})`, icon: ShieldAlert },
                  { id: 'exercises', label: 'Milestones & Rehab', icon: Dumbbell },
                  { id: 'warnings', label: 'Red-Flags & Nutrition', icon: AlertOctagon }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6,
                        background: activeTab === tab.id ? 'var(--gradient-main)' : 'var(--glass-bg)',
                        color: activeTab === tab.id ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      <Icon size={14} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab: Medications */}
              {activeTab === 'meds' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(result.analysis?.medications || []).map((med, idx) => (
                    <div key={idx} style={{
                      padding: '14px 16px', borderRadius: 14, background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {med.name} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>({med.genericName})</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {med.dosage} · {med.frequency} · Route: {med.route}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginTop: 4 }}>
                          📝 {med.instructions}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                          AUTO-SCHEDULED
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(med.reminderTimes || []).map((time, tIdx) => (
                            <span key={tIdx} style={{
                              padding: '2px 8px', borderRadius: 6, background: 'rgba(14, 165, 233, 0.15)',
                              color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem'
                            }}>
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Interactions */}
              {activeTab === 'interactions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    🔬 Clinical Drug-Drug Safety Interactions
                  </div>
                  {(result.analysis?.drugInteractions || []).length > 0 ? (
                    result.analysis.drugInteractions.map((inter, idx) => (
                      <div key={idx} style={{
                        padding: '12px 16px', borderRadius: 12,
                        background: inter.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        border: `1px solid ${inter.severity === 'critical' ? '#ef444430' : '#f59e0b30'}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: inter.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
                            ⚠️ {(inter.drugs || []).join(' + ')}
                          </span>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                            padding: '2px 8px', borderRadius: 6, background: `${inter.severity === 'critical' ? '#ef4444' : '#f59e0b'}20`,
                            color: inter.severity === 'critical' ? '#ef4444' : '#f59e0b'
                          }}>
                            {inter.severity} Conflict
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: '4px 0' }}>{inter.description}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}><strong>Action:</strong> {inter.recommendation}</p>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#10b981', padding: 12 }}>
                      ✓ No severe drug-drug interactions detected between prescribed medications.
                    </div>
                  )}

                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 8 }}>
                    🥗 Food & Nutrient Contraindications
                  </div>
                  {(result.analysis?.foodConflicts || []).map((food, idx) => (
                    <div key={idx} style={{
                      padding: '12px 16px', borderRadius: 12, background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)'
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {food.drug} ⚡ {food.food}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0' }}>{food.warning}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--primary)', margin: 0 }}><strong>Recommendation:</strong> {food.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Exercises & Milestones */}
              {activeTab === 'exercises' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    🏃 Automated Post-Op Rehabilitation Exercises
                  </div>
                  {(result.analysis?.recoveryPlan?.exercises || []).map((ex, idx) => (
                    <div key={idx} style={{
                      padding: '12px 16px', borderRadius: 12, background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ex.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{ex.description}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 12 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(14, 165, 233, 0.1)', padding: '4px 8px', borderRadius: 6 }}>
                          {ex.frequency}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 8 }}>
                    📅 Dynamic Healing Milestones
                  </div>
                  {(result.analysis?.recoveryPlan?.milestones || []).map((ms, idx) => (
                    <div key={idx} style={{
                      padding: '12px 16px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: 12
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                        D{ms.targetDay || (idx + 1) * 3}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{ms.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ms.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Warnings & Nutrition */}
              {activeTab === 'warnings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ef4444' }}>
                    🚨 Emergency Red-Flag Warning Signs (Trigger for 108 / Doctor Call)
                  </div>
                  {(result.analysis?.recoveryPlan?.warningSigns || []).map((sign, idx) => (
                    <div key={idx} style={{
                      padding: '10px 14px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600
                    }}>
                      ⚠️ {sign}
                    </div>
                  ))}

                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 8 }}>
                    🛑 Activity Restrictions
                  </div>
                  {(result.analysis?.recoveryPlan?.restrictions || []).map((res, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      • {res}
                    </div>
                  ))}

                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: 8 }}>
                    🥗 Dietary Guidelines
                  </div>
                  {(result.analysis?.recoveryPlan?.dietaryGuidelines || []).map((dg, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      ✓ {dg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-card)'
        }}>
          {activeStep === 'input' ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '10px 20px', borderRadius: 12,
                  background: 'transparent', border: '1px solid var(--glass-border)',
                  color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcess}
                disabled={loading}
                style={{
                  padding: '10px 24px', borderRadius: 12,
                  background: 'var(--gradient-main)', border: 'none',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <Sparkles size={16} /> Run Autonomous Ingestion
              </button>
            </>
          ) : activeStep === 'result' ? (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '10px 28px', borderRadius: 12,
                  background: 'var(--gradient-main)', border: 'none',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                <Check size={16} /> Done & View Dashboard
              </button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export default DischargeAutomationModal;
