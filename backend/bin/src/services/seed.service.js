const { User, Doctor } = require('../models');
const bcrypt = require('bcryptjs');

const seedDoctors = async () => {
  try {
    console.log('Checking database and seeding doctor profiles...');

    const doctorsData = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@telehealth.com',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, FACC',
        experience: 12,
        consultation_fee: 150.00
      },
      {
        name: 'Dr. Robert Chen',
        email: 'robert.chen@telehealth.com',
        specialization: 'Neurology',
        qualification: 'MD, PhD',
        experience: 15,
        consultation_fee: 200.00
      },
      {
        name: 'Dr. Amanda Ross',
        email: 'amanda.ross@telehealth.com',
        specialization: 'Pediatrics',
        qualification: 'MD, IBCLC',
        experience: 8,
        consultation_fee: 90.00
      },
      {
        name: 'Dr. John Watson',
        email: 'john.watson@telehealth.com',
        specialization: 'General Medicine',
        qualification: 'MD, Generalist',
        experience: 10,
        consultation_fee: 80.00
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'elena.rostova@telehealth.com',
        specialization: 'Dermatology',
        qualification: 'MD, FAAD',
        experience: 7,
        consultation_fee: 110.00
      },
      {
        name: 'Dr. Marcus Vance',
        email: 'marcus.vance@telehealth.com',
        specialization: 'Psychiatry',
        qualification: 'MD, Psychiatrist',
        experience: 14,
        consultation_fee: 160.00
      },
      // Pop culture doctors
      {
        name: 'Dr. Gregory House',
        email: 'gregory.house@telehealth.com',
        specialization: 'General Medicine',
        qualification: 'MD, Diagnostics Specialist',
        experience: 20,
        consultation_fee: 250.00
      },
      {
        name: 'Dr. Meredith Grey',
        email: 'meredith.grey@telehealth.com',
        specialization: 'General Medicine',
        qualification: 'MD, FACS',
        experience: 11,
        consultation_fee: 180.00
      },
      {
        name: 'Dr. Shaun Murphy',
        email: 'shaun.murphy@telehealth.com',
        specialization: 'Pediatrics',
        qualification: 'MD, Surgery Specialist',
        experience: 6,
        consultation_fee: 95.00
      },
      {
        name: 'Dr. Stephen Strange',
        email: 'stephen.strange@telehealth.com',
        specialization: 'Neurology',
        qualification: 'MD, PhD, Neurosurgery',
        experience: 16,
        consultation_fee: 220.00
      },
      {
        name: 'Dr. Miranda Bailey',
        email: 'miranda.bailey@telehealth.com',
        specialization: 'General Medicine',
        qualification: 'MD, Chief Surgeon',
        experience: 18,
        consultation_fee: 170.00
      },
      {
        name: 'Dr. Allison Cameron',
        email: 'allison.cameron@telehealth.com',
        specialization: 'Dermatology',
        qualification: 'MD, Immunology Fellow',
        experience: 9,
        consultation_fee: 130.00
      }
    ];

    let newSeedCount = 0;

    for (const doc of doctorsData) {
      // 1. Check if user already exists
      const [user, created] = await User.findOrCreate({
        where: { email: doc.email },
        defaults: {
          name: doc.name,
          password: 'password123', // auto-hashed by User model hooks
          role: 'doctor'
        }
      });

      if (created) {
        // 2. Create matching Doctor profile
        await Doctor.create({
          user_id: user.id,
          specialization: doc.specialization,
          qualification: doc.qualification,
          experience: doc.experience,
          consultation_fee: doc.consultation_fee,
          verification_status: 'approved'
        });
        newSeedCount++;
      }
    }

    if (newSeedCount > 0) {
      console.log(`Seeded ${newSeedCount} new doctor profiles successfully.`);
    } else {
      console.log('All doctor profiles are already present in the database.');
    }
  } catch (error) {
    console.error('Failed to seed doctor profiles:', error.message);
  }
};

module.exports = { seedDoctors };
