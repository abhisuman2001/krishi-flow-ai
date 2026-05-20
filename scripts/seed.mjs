/**
 * Standalone seed script — run with:
 *   node scripts/seed.mjs
 *
 * Reads MONGODB_URI from .env.local or environment.
 * Seeds the 8 demo tickets into MongoDB Atlas.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (no dotenv dependency needed)
function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local');
  try {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.warn('Could not read .env.local — using existing environment variables');
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set. Add it to .env.local');
  process.exit(1);
}

// Dynamic import of mongoose (ESM-compatible)
const { default: mongoose } = await import('mongoose');

const TicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    farmerName: String,
    phone: String,
    district: String,
    state: String,
    language: String,
    crop: String,
    issue: String,
    severity: String,
    category: String,
    status: String,
    assignedOfficer: String,
    department: String,
    suggestedAction: String,
    aiSummary: String,
  },
  { timestamps: true }
);

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);

const MOCK_TICKETS = [
  {
    ticketId: 'KF-2024-001', farmerName: 'Ramesh Kumar', phone: '+91 98765 43210',
    district: 'Nashik', state: 'Maharashtra', language: 'Hindi', crop: 'Tomato',
    issue: 'My tomato plants are showing yellow leaves and the fruits are not growing properly. The leaves have brown spots and are falling off.',
    severity: 'High', category: 'Crop Disease', status: 'In Review',
    assignedOfficer: 'Dr. Priya Sharma', department: 'Plant Protection',
    suggestedAction: 'Apply copper-based fungicide. Ensure proper drainage. Remove infected leaves immediately.',
    aiSummary: 'Farmer reports tomato crop showing symptoms consistent with early blight (Alternaria solani). Immediate fungicide application recommended.',
    createdAt: '2024-11-15T08:30:00Z', updatedAt: '2024-11-15T10:00:00Z',
  },
  {
    ticketId: 'KF-2024-002', farmerName: 'Sunita Devi', phone: '+91 87654 32109',
    district: 'Amravati', state: 'Maharashtra', language: 'Marathi', crop: 'Cotton',
    issue: 'Cotton crop is being attacked by pink bollworm. Many bolls are damaged and I am losing my crop.',
    severity: 'Critical', category: 'Pest Attack', status: 'Escalated',
    assignedOfficer: 'Mr. Vijay Patil', department: 'Pest Management',
    suggestedAction: 'Emergency pheromone trap deployment. Apply recommended insecticide. Contact district agriculture office.',
    aiSummary: 'Critical pink bollworm infestation in cotton crop. Immediate intervention required to prevent total crop loss.',
    createdAt: '2024-11-14T14:20:00Z', updatedAt: '2024-11-15T09:15:00Z',
  },
  {
    ticketId: 'KF-2024-003', farmerName: 'Arjun Singh', phone: '+91 76543 21098',
    district: 'Pune', state: 'Maharashtra', language: 'Hindi', crop: 'Wheat',
    issue: 'Soil is very hard and water is not absorbing properly. Wheat seeds are not germinating well.',
    severity: 'Medium', category: 'Soil Health', status: 'Pending',
    department: 'Soil Science',
    suggestedAction: 'Conduct soil test. Add organic matter. Consider deep plowing before next season.',
    createdAt: '2024-11-15T11:00:00Z', updatedAt: '2024-11-15T11:00:00Z',
  },
  {
    ticketId: 'KF-2024-004', farmerName: 'Meena Bai', phone: '+91 65432 10987',
    district: 'Aurangabad', state: 'Maharashtra', language: 'Marathi', crop: 'Sugarcane',
    issue: 'Drip irrigation system is not working properly. Water pressure is low and some emitters are blocked.',
    severity: 'Medium', category: 'Irrigation', status: 'Resolved',
    assignedOfficer: 'Er. Suresh Jadhav', department: 'Irrigation Engineering',
    suggestedAction: 'Clean blocked emitters. Check pump pressure. Replace damaged drip lines.',
    aiSummary: 'Irrigation system maintenance required. Issue resolved after field visit and system repair.',
    createdAt: '2024-11-13T09:00:00Z', updatedAt: '2024-11-14T16:30:00Z',
  },
  {
    ticketId: 'KF-2024-005', farmerName: 'Prakash Rao', phone: '+91 54321 09876',
    district: 'Nagpur', state: 'Maharashtra', language: 'Telugu', crop: 'Orange',
    issue: 'Orange trees are not producing enough fruits. The leaves are pale and the tree looks weak.',
    severity: 'Low', category: 'Fertilizer', status: 'Resolved',
    assignedOfficer: 'Dr. Anita Kulkarni', department: 'Horticulture',
    suggestedAction: 'Apply micronutrient mix. Increase nitrogen fertilizer. Conduct leaf analysis.',
    aiSummary: 'Nutrient deficiency identified in orange orchard. Micronutrient supplementation recommended.',
    createdAt: '2024-11-12T10:30:00Z', updatedAt: '2024-11-13T14:00:00Z',
  },
  {
    ticketId: 'KF-2024-006', farmerName: 'Kavitha Reddy', phone: '+91 43210 98765',
    district: 'Solapur', state: 'Maharashtra', language: 'Kannada', crop: 'Soybean',
    issue: 'Unexpected hailstorm damaged my soybean crop. About 40% of the crop is destroyed.',
    severity: 'High', category: 'Weather', status: 'In Review',
    assignedOfficer: 'Mr. Ravi Deshmukh', department: 'Crop Insurance',
    suggestedAction: 'File crop insurance claim immediately. Document damage with photographs. Contact district collector office.',
    aiSummary: 'Weather-related crop damage. Insurance claim process initiated. Damage assessment team dispatched.',
    createdAt: '2024-11-15T07:00:00Z', updatedAt: '2024-11-15T12:00:00Z',
  },
  {
    ticketId: 'KF-2024-007', farmerName: 'Balram Yadav', phone: '+91 32109 87654',
    district: 'Kolhapur', state: 'Maharashtra', language: 'Hindi', crop: 'Rice',
    issue: 'The seeds I bought from the market are not germinating. Only 30% germination rate.',
    severity: 'High', category: 'Seed Quality', status: 'Escalated',
    assignedOfficer: 'Dr. Sanjay Patil', department: 'Seed Certification',
    suggestedAction: 'Test seed germination rate. File complaint with seed supplier. Provide replacement seeds.',
    aiSummary: 'Poor seed quality detected. Seed certification authority notified. Replacement seeds being arranged.',
    createdAt: '2024-11-14T08:00:00Z', updatedAt: '2024-11-15T11:30:00Z',
  },
  {
    ticketId: 'KF-2024-008', farmerName: 'Geeta Sharma', phone: '+91 21098 76543',
    district: 'Jalgaon', state: 'Maharashtra', language: 'Hindi', crop: 'Banana',
    issue: 'Banana plants are showing signs of Panama disease. Leaves are yellowing and wilting.',
    severity: 'Critical', category: 'Crop Disease', status: 'In Review',
    assignedOfficer: 'Dr. Priya Sharma', department: 'Plant Protection',
    suggestedAction: 'Quarantine affected area. Remove and destroy infected plants. Apply soil fumigation.',
    aiSummary: 'Fusarium wilt (Panama disease) suspected. Immediate quarantine measures required to prevent spread.',
    createdAt: '2024-11-15T06:00:00Z', updatedAt: '2024-11-15T13:00:00Z',
  },
];

async function seed() {
  console.log('🌱  Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected');

  let inserted = 0;
  let skipped = 0;

  for (const mock of MOCK_TICKETS) {
    const exists = await Ticket.findOne({ ticketId: mock.ticketId });
    if (exists) {
      console.log(`  ⏭  Skipped ${mock.ticketId} (already exists)`);
      skipped++;
      continue;
    }
    await Ticket.create({
      ...mock,
      createdAt: new Date(mock.createdAt),
      updatedAt: new Date(mock.updatedAt),
    });
    console.log(`  ✅  Inserted ${mock.ticketId} — ${mock.farmerName}`);
    inserted++;
  }

  const total = await Ticket.countDocuments();
  console.log(`\n🎉  Done! Inserted: ${inserted}, Skipped: ${skipped}, Total in DB: ${total}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
