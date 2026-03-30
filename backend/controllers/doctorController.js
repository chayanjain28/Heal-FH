const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, minRating, maxFee, search, condition, page = 1, limit = 12 } = req.query;
    const query = { isAvailable: true };

    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (maxFee) query.consultationFee = { $lte: parseInt(maxFee) };
    if (condition) query.conditions = { $in: [new RegExp(condition, 'i')] };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
      { hospital: { $regex: search, $options: 'i' } }
    ];

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .sort({ rating: -1, experience: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / limit), doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.suggestDoctors = async (req, res) => {
  try {
    const { conditions, specialization } = req.body;
    const query = { isAvailable: true };
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (conditions?.length) query.conditions = { $in: conditions.map(c => new RegExp(c, 'i')) };

    const doctors = await Doctor.find(query).sort({ rating: -1 }).limit(6);
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.seedDoctors = async (req, res) => {
  try {
    const count = await Doctor.countDocuments();
    if (count > 0) return res.json({ success: true, message: 'Doctors already seeded' });

    const sampleDoctors = [
      { name: 'Dr. Priya Sharma', specialization: 'Cardiologist', qualifications: ['MBBS', 'MD', 'DM Cardiology'], experience: 15, hospital: 'Apollo Hospital Mumbai', rating: 4.8, reviewCount: 342, consultationFee: 1500, conditions: ['heart failure', 'hypertension', 'arrhythmia'], bio: 'Expert in interventional cardiology with 15+ years of experience.', languages: ['English', 'Hindi', 'Marathi'], location: { city: 'Mumbai', state: 'Maharashtra' }, photo: 'https://i.pravatar.cc/150?img=47' },
      { name: 'Dr. Rajesh Kumar', specialization: 'Orthopedic Surgeon', qualifications: ['MBBS', 'MS Orthopedics'], experience: 12, hospital: 'Fortis Hospital', rating: 4.7, reviewCount: 289, consultationFee: 1200, conditions: ['fractures', 'joint replacement', 'spine', 'sports injury'], bio: 'Specialist in minimally invasive orthopedic surgery.', languages: ['English', 'Hindi'], location: { city: 'Delhi', state: 'Delhi' }, photo: 'https://i.pravatar.cc/150?img=11' },
      { name: 'Dr. Ananya Nair', specialization: 'Neurologist', qualifications: ['MBBS', 'MD Neurology', 'DM'], experience: 10, hospital: 'NIMHANS', rating: 4.9, reviewCount: 412, consultationFee: 1800, conditions: ['stroke', 'epilepsy', 'migraine', 'parkinson'], bio: 'Leading neurologist specializing in stroke rehabilitation.', languages: ['English', 'Hindi', 'Malayalam'], location: { city: 'Bangalore', state: 'Karnataka' }, photo: 'https://i.pravatar.cc/150?img=48' },
      { name: 'Dr. Suresh Patel', specialization: 'General Physician', qualifications: ['MBBS', 'MD General Medicine'], experience: 18, hospital: 'City Care Hospital', rating: 4.6, reviewCount: 521, consultationFee: 600, conditions: ['diabetes', 'hypertension', 'fever', 'infections', 'post-discharge care'], bio: 'Experienced general physician with focus on preventive care.', languages: ['English', 'Hindi', 'Gujarati'], location: { city: 'Ahmedabad', state: 'Gujarat' }, photo: 'https://i.pravatar.cc/150?img=15' },
      { name: 'Dr. Meera Reddy', specialization: 'Pulmonologist', qualifications: ['MBBS', 'MD Pulmonology'], experience: 8, hospital: 'Krishna Institute', rating: 4.7, reviewCount: 198, consultationFee: 1100, conditions: ['asthma', 'COPD', 'pneumonia', 'tuberculosis', 'breathing disorders'], bio: 'Expert in respiratory diseases and pulmonary rehabilitation.', languages: ['English', 'Telugu', 'Hindi'], location: { city: 'Hyderabad', state: 'Telangana' }, photo: 'https://i.pravatar.cc/150?img=49' },
      { name: 'Dr. Arjun Mehta', specialization: 'Endocrinologist', qualifications: ['MBBS', 'MD', 'DM Endocrinology'], experience: 11, hospital: 'Max Hospital', rating: 4.8, reviewCount: 267, consultationFee: 1600, conditions: ['diabetes', 'thyroid', 'obesity', 'hormonal disorders'], bio: 'Specialist in diabetes management and hormonal disorders.', languages: ['English', 'Hindi'], location: { city: 'Delhi', state: 'Delhi' }, photo: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Dr. Lakshmi Iyer', specialization: 'Gastroenterologist', qualifications: ['MBBS', 'MD', 'DM Gastroenterology'], experience: 14, hospital: 'Medanta Hospital', rating: 4.6, reviewCount: 183, consultationFee: 1400, conditions: ['IBS', 'liver disease', 'gastric ulcer', 'crohn disease'], bio: 'Expert in digestive system disorders and liver diseases.', languages: ['English', 'Tamil', 'Hindi'], location: { city: 'Chennai', state: 'Tamil Nadu' }, photo: 'https://i.pravatar.cc/150?img=50' },
      { name: 'Dr. Vikram Singh', specialization: 'Physiotherapist', qualifications: ['BPT', 'MPT Neurology'], experience: 9, hospital: 'Rehabilitation Center', rating: 4.9, reviewCount: 445, consultationFee: 800, conditions: ['post-surgery recovery', 'stroke recovery', 'sports injury', 'back pain'], bio: 'Specialized in post-surgical rehabilitation and neurological physiotherapy.', languages: ['English', 'Hindi', 'Punjabi'], location: { city: 'Chandigarh', state: 'Punjab' }, photo: 'https://i.pravatar.cc/150?img=13' }
    ];

    await Doctor.insertMany(sampleDoctors);
    res.json({ success: true, message: `${sampleDoctors.length} doctors seeded successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
