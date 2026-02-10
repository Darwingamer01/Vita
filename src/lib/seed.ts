const { PrismaClient } = require('../generated/client/client');
require('dotenv/config');

const prisma = new PrismaClient();

// Using Delhi Coordinates as base
const BASE_LAT = 28.6139;
const BASE_LNG = 77.2090;

// Helper to generate dynamic location
const rLoc = (latOffset: number, lngOffset: number, addr: string) => ({
    lat: BASE_LAT + latOffset,
    lng: BASE_LNG + lngOffset,
    address: addr,
    city: 'Delhi',
    district: 'Central Delhi'
});

const MOCK_RESOURCES = [
    // --- v1.0/2.0 Legacy (Enhanced) ---
    {
        id: 'h1', type: 'HOSPITAL', title: 'AIIMS Delhi', description: 'Premier Govt Medical Institute',
        location: rLoc(-0.048, 0.002, 'Ansari Nagar'),
        contact: { phone: '011-26588500', name: 'Control Room' },
        status: 'LIMITED', verificationLevel: 'GOVERNMENT', lastUpdated: new Date().toISOString(),
        metadata: {
            hospital: {
                beds: { general: 50, icu: 5, ventilator: 2, oxygen: 20 },
                specialties: ['Cardiology', 'Neurology', 'Trauma', 'Oncology'],
                insuranceAccepted: ['CGHS', 'ECHS', 'Ayushman Bharat'],
                ayushmanBharat: true
            },
            bloodStock: {
                groups: { 'A+': 10, 'A-': 2, 'B+': 15, 'B-': 0, 'AB+': 5, 'AB-': 0, 'O+': 20, 'O-': 4 },
                plasmaAvailable: true, apheresisAvailable: true
            },
            operatingHours: '24x7'
        }, reportCount: 0, upvoteCount: 1200
    },
    {
        id: 'h2', type: 'HOSPITAL', title: 'Safdarjung Hospital', description: 'Multispeciality Central Govt Hospital',
        location: rLoc(-0.050, 0.005, 'New Delhi'),
        contact: { phone: '011-26165060' },
        status: 'AVAILABLE', verificationLevel: 'GOVERNMENT', lastUpdated: new Date().toISOString(),
        metadata: {
            hospital: {
                beds: { general: 120, icu: 15, ventilator: 5, oxygen: 40 },
                specialties: ['Burns', 'Pediatrics', 'General Surgery'],
                insuranceAccepted: ['Ayushman Bharat'],
                ayushmanBharat: true
            },
            bloodStock: {
                groups: { 'A+': 5, 'A-': 0, 'B+': 8, 'B-': 1, 'AB+': 2, 'AB-': 0, 'O+': 12, 'O-': 2 },
                plasmaAvailable: false, apheresisAvailable: false
            },
            operatingHours: '24x7'
        }, reportCount: 0, upvoteCount: 800
    },
    {
        id: 'h3', type: 'HOSPITAL', title: 'Max Super Speciality', description: 'Private Healthcare Provider',
        location: rLoc(-0.02, 0.08, 'Saket'),
        contact: { phone: '011-26515050' },
        status: 'AVAILABLE', verificationLevel: 'OFFICIAL_PARTNER', lastUpdated: new Date().toISOString(),
        metadata: {
            hospital: {
                beds: { general: 40, icu: 10, ventilator: 8, oxygen: 25 },
                specialties: ['Cardiac Sciences', 'Neurosciences', 'Orthopedics'],
                insuranceAccepted: ['Private', 'TPA', 'Corporate'],
                ayushmanBharat: false
            },
            bloodStock: {
                groups: { 'A+': 20, 'A-': 5, 'B+': 25, 'B-': 3, 'AB+': 10, 'AB-': 2, 'O+': 30, 'O-': 6 },
                plasmaAvailable: true, apheresisAvailable: true
            },
            operatingHours: '24x7'
        }, reportCount: 0, upvoteCount: 350
    },
    {
        id: 'h4', type: 'HOSPITAL', title: 'Apollo Hospital', description: 'Tertiary Care Hospital',
        location: rLoc(0.04, 0.06, 'Sarita Vihar'),
        contact: { phone: '011-26925858' },
        status: 'BUSY', verificationLevel: 'VERIFIED', lastUpdated: new Date().toISOString(),
        metadata: {
            hospital: {
                beds: { general: 20, icu: 2, ventilator: 0, oxygen: 10 },
                specialties: ['Transplants', 'Robotic Surgery', 'Cancer Care'],
                insuranceAccepted: ['Private', 'TPA'],
                ayushmanBharat: false
            },
            bloodStock: {
                groups: { 'A+': 8, 'A-': 1, 'B+': 12, 'B-': 2, 'AB+': 4, 'AB-': 1, 'O+': 15, 'O-': 3 },
                plasmaAvailable: true, apheresisAvailable: false
            },
            operatingHours: '24x7'
        }, reportCount: 0, upvoteCount: 500
    },

    // --- Track A: DOCTORS ---
    {
        id: 'd1', type: 'DOCTOR', title: 'Dr. Naresh Trehan', description: 'Senior Cardiologist',
        location: rLoc(-0.06, 0.07, 'Escorts Heart Inst'),
        contact: { phone: '011-47135000' },
        status: 'AVAILABLE', verificationLevel: 'OFFICIAL_PARTNER', lastUpdated: new Date().toISOString(),
        metadata: {
            doctor: {
                specialty: 'Cardiologist', qualification: 'MBBS, FRACS', experienceYears: 40,
                availableToday: true, consultationFee: 2000, videoConsult: true,
                hospitalAffiliation: 'Medanta'
            }
        }, reportCount: 0, upvoteCount: 500
    },
    {
        id: 'd2', type: 'SPECIALIST', title: 'Dr. Randeep Guleria', description: 'Pulmonologist & Respiratory Expert',
        location: rLoc(-0.05, 0.01, 'Green Park'),
        contact: { phone: '011-20003000' },
        status: 'ON_CALL', verificationLevel: 'OFFICIAL_PARTNER', lastUpdated: new Date().toISOString(),
        metadata: {
            doctor: {
                specialty: 'Pulmonologist', qualification: 'MD, DM', experienceYears: 30,
                availableToday: false, nextAvailableSlot: 'Tomorrow 10 AM', videoConsult: false
            }
        }, reportCount: 0, upvoteCount: 890
    },

    // --- Track A: PATHOLOGY & LABS ---
    {
        id: 'l1', type: 'PATHOLOGY', title: 'Dr. Lal PathLabs', description: 'Central Processing Lab',
        location: rLoc(0.02, -0.01, 'Rohini Sector 18'),
        contact: { phone: '011-39885050' },
        status: 'AVAILABLE', verificationLevel: 'OFFICIAL_PARTNER', lastUpdated: new Date().toISOString(),
        metadata: {
            labTests: [
                { name: 'RT-PCR', turnaroundTime: '6 Hours', homeCollection: true, price: 500 },
                { name: 'D-Dimer', turnaroundTime: '4 Hours', homeCollection: true, price: 1200 },
                { name: 'CBC', turnaroundTime: '2 Hours', homeCollection: true, price: 300 }
            ],
            operatingHours: '07:00-21:00'
        }, reportCount: 0, upvoteCount: 300
    },

    // --- Track A: EQUIPMENT ---
    {
        id: 'eq1', type: 'EQUIPMENT', title: 'Sewa Bharti Kendra', description: 'Free medical equipment bank',
        location: rLoc(0.05, 0.05, 'Civil Lines'),
        contact: { phone: '9811XXXXXX', name: 'Ashok Ji' },
        status: 'AVAILABLE', verificationLevel: 'NGO', lastUpdated: new Date().toISOString(),
        metadata: {
            equipment: [
                { type: 'Oxygen Concentrator (5L)', rentalPrice: 0, deposit: 5000, isRental: true },
                { type: 'Wheelchair', rentalPrice: 0, deposit: 1000, isRental: true },
                { type: 'Fowler Bed', rentalPrice: 0, deposit: 10000, isRental: true }
            ]
        }, reportCount: 0, upvoteCount: 150
    },

    // --- Track A: BLOOD BANK ---
    {
        id: 'bb1', type: 'BLOOD_BANK', title: 'Rotary Blood Bank', description: 'High volume modern blood bank',
        location: rLoc(-0.08, 0.02, 'Tughlakabad'),
        contact: { phone: '011-66005500' },
        status: 'AVAILABLE', verificationLevel: 'NGO', lastUpdated: new Date().toISOString(),
        metadata: {
            bloodStock: {
                groups: { 'A+': 50, 'A-': 5, 'B+': 40, 'B-': 2, 'AB+': 15, 'AB-': 0, 'O+': 60, 'O-': 8 },
                plasmaAvailable: true, apheresisAvailable: true
            },
            operatingHours: '24x7'
        }, reportCount: 0, upvoteCount: 410
    },

    // --- New Track: CLINICS / DIALYSIS ---
    {
        id: 'c1', type: 'DIALYSIS', title: 'Neptune Dialysis Center', description: 'Emergency Dialysis Available',
        location: rLoc(0.01, -0.04, 'Janakpuri'),
        contact: { phone: '011-2555XXXX' },
        status: 'AVAILABLE', verificationLevel: 'OFFICIAL_PARTNER', lastUpdated: new Date().toISOString(),
        metadata: { operatingHours: '08:00-20:00' },
        reportCount: 0, upvoteCount: 40
    },

    // --- Track A: OXYGEN ---
    {
        id: 'ox1', type: 'OXYGEN', title: 'O2 For All Foundation', description: 'Free Oxygen Cylinder Refills',
        location: rLoc(-0.02, 0.03, 'Lajpat Nagar'),
        contact: { phone: '9999000011' },
        status: 'AVAILABLE', verificationLevel: 'NGO', lastUpdated: new Date().toISOString(),
        metadata: { oxygenType: 'REFILL', operatingHours: '24x7' },
        reportCount: 0, upvoteCount: 250
    },
    {
        id: 'ox2', type: 'OXYGEN', title: 'MediGas Suppliers', description: 'Medical Oxygen Cylinders for Rent/Sale',
        location: rLoc(0.04, -0.02, 'Kirti Nagar'),
        contact: { phone: '9810012345' },
        status: 'AVAILABLE', verificationLevel: 'COMMUNITY', lastUpdated: new Date().toISOString(),
        metadata: { oxygenType: 'CYLINDER', operatingHours: '09:00-20:00' },
        reportCount: 1, upvoteCount: 45
    },

    // --- Track A: AMBULANCE ---
    {
        id: 'amb1', type: 'AMBULANCE', title: 'Rapid Response ALS', description: 'Advanced Life Support Ambulance',
        location: rLoc(0.01, 0.01, 'Connaught Place'),
        contact: { phone: '102', whatsapp: '9999111122' },
        status: 'AVAILABLE', verificationLevel: 'GOVERNMENT', lastUpdated: new Date().toISOString(),
        metadata: { ambulanceType: 'ICU', operatingHours: '24x7' },
        reportCount: 0, upvoteCount: 500
    },
    {
        id: 'amb2', type: 'AMBULANCE', title: 'City Private Ambulance', description: 'Basic Transport',
        location: rLoc(-0.03, -0.05, 'Dwarka'),
        contact: { phone: '9876543210' },
        status: 'BUSY', verificationLevel: 'COMMUNITY', lastUpdated: new Date().toISOString(),
        metadata: { ambulanceType: 'BASIC', operatingHours: '24x7' },
        reportCount: 0, upvoteCount: 120
    },

    // --- Track A: SHELTERS ---
    {
        id: 'sh1', type: 'SHELTER', title: 'Yamuna Sports Complex Shelter', description: 'Temporary Relief Camp',
        location: rLoc(0.06, 0.04, 'East Delhi'),
        contact: { phone: '011-22003300' },
        status: 'AVAILABLE', verificationLevel: 'GOVERNMENT', lastUpdated: new Date().toISOString(),
        metadata: {
            shelter: {
                capacity: 500, occupancy: 120,
                facilities: ['Food', 'Medical Desk', 'Wifi', 'Beds'],
                petFriendly: false
            }
        },
        reportCount: 0, upvoteCount: 300
    },
    {
        id: 'sh2', type: 'SHELTER', title: 'Community Hall Shelter', description: 'Night Shelter for Homeless',
        location: rLoc(-0.02, -0.02, 'Karol Bagh'),
        contact: { phone: '9811223344' },
        status: 'LIMITED', verificationLevel: 'NGO', lastUpdated: new Date().toISOString(),
        metadata: {
            shelter: {
                capacity: 50, occupancy: 45,
                facilities: ['Blankets', 'Tea', 'First Aid'],
                petFriendly: true
            }
        },
        reportCount: 0, upvoteCount: 80
    },
];

const MOCK_PHARMACIES = [
    {
        id: 'ph1', type: 'MEDICINE', title: 'Apollo Pharmacy 24x7', description: 'Round the clock chemist',
        location: rLoc(0.02, 0.02, 'Lajpat Nagar'),
        contact: { phone: '011-29830000' },
        status: 'AVAILABLE', verificationLevel: 'OFFICIAL_PARTNER', lastUpdated: new Date().toISOString(),
        metadata: {
            pharmacy: {
                availableMedicines: ['Paracetamol', 'Remdesivir', 'Fabiflu', 'Azithromycin', 'Dolo 650', 'Insulin'],
                homeDelivery: true
            }
        }, reportCount: 0, upvoteCount: 200
    },
    {
        id: 'ph2', type: 'MEDICINE', title: 'Guardian Pharmacy', description: 'Trusted chain',
        location: rLoc(-0.03, 0.01, 'Vasant Vihar'),
        contact: { phone: '011-41660000' },
        status: 'AVAILABLE', verificationLevel: 'VERIFIED', lastUpdated: new Date().toISOString(),
        metadata: {
            pharmacy: {
                availableMedicines: ['Augmentin', 'Pan D', 'Vitamin C', 'Zinc', 'Cough Syrup'],
                homeDelivery: false
            }
        }, reportCount: 0, upvoteCount: 150
    }
];

const MOCK_REQUESTS = [
    {
        id: 'req1',
        title: 'Urgent Oxygen Needed',
        description: 'Patient SPO2 dropping below 85, need B-type cylinder immediately.',
        type: 'OXYGEN',
        contact: '9998887776',
        location: 'Sector 4, Dwarka, Delhi',
        urgency: 'CRITICAL',
        status: 'IN_PROGRESS',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        responseCount: 3,
        timeline: [
            {
                id: 'tl1', type: 'CREATED', timestamp: new Date(Date.now() - 3600000).toISOString(),
                message: 'Request created', actor: 'USER'
            },
            {
                id: 'tl2', type: 'STATUS_CHANGE', timestamp: new Date(Date.now() - 3000000).toISOString(),
                message: 'Priority set to CRITICAL due to rapid SPO2 drop', actor: 'ADMIN'
            },
            {
                id: 'tl3', type: 'MATCH_FOUND', timestamp: new Date(Date.now() - 2500000).toISOString(),
                message: 'System found 3 verified oxygen suppliers nearby', actor: 'SYSTEM'
            },
            {
                id: 'tl4', type: 'STATUS_CHANGE', timestamp: new Date(Date.now() - 1800000).toISOString(),
                message: 'Status changed to In Progress (Volunteer Assigned)', actor: 'ADMIN'
            }
        ],
        matches: [],
        adminNotes: 'Volunteer Rahul is on the way.'
    }
];

const MOCK_VOLUNTEER_TASKS = [
    { title: 'Deliver Oxygen Cylinder', location: 'Sec 14 to Civil Hospital', urgent: true, points: 50 },
    { title: 'Verify Bed Availability', location: 'City Care Hospital', urgent: false, points: 20 },
    { title: 'Assist Blood Donation Camp', location: 'Community Center', urgent: false, points: 30 },
];

const MOCK_ALERTS = [
    {
        title: 'Heavy Traffic on Ring Road',
        message: 'Avoid Ring Road near AIIMS due to construction work. Expected delay: 45 mins.',
        district: 'South Delhi',
        severity: 'WARNING',
        type: 'TRAFFIC',
        expiresAt: new Date(Date.now() + 86400000).toISOString() // Tomorrow
    },
    {
        title: 'Flash Flood Warning',
        message: 'Yamuna water levels rising. Low lying areas being evacuated.',
        district: 'East Delhi',
        severity: 'CRITICAL',
        type: 'WEATHER',
        expiresAt: new Date(Date.now() + 172800000).toISOString() // 2 days
    },
    {
        title: 'Free Health Checkup Camp',
        message: 'Organized by Rotary Club at Community Center, Pitampura.',
        district: 'North West Delhi',
        severity: 'INFO',
        type: 'MEDICAL',
        expiresAt: new Date(Date.now() + 604800000).toISOString() // 1 week
    }
];

async function main() {
    console.log('Start seeding...');

    // Clear existing
    await prisma.resource.deleteMany();
    await prisma.request.deleteMany();
    await prisma.volunteerTask.deleteMany();
    await prisma.alert.deleteMany();

    const allResources = [...MOCK_RESOURCES, ...MOCK_PHARMACIES];

    for (const r of allResources) {
        await prisma.resource.create({
            data: {
                id: r.id,
                type: r.type,
                title: r.title,
                description: r.description,
                lat: r.location.lat,
                lng: r.location.lng,
                address: r.location.address,
                city: r.location.city,
                district: r.location.district,
                contact: JSON.stringify(r.contact),
                status: r.status,
                verificationLevel: r.verificationLevel,
                lastUpdated: new Date(r.lastUpdated),
                metadata: r.metadata ? JSON.stringify(r.metadata) : null,
                reportCount: r.reportCount,
                upvoteCount: r.upvoteCount
            }
        });
    }

    for (const req of MOCK_REQUESTS) {
        await prisma.request.create({
            data: {
                id: req.id,
                title: req.title,
                description: req.description,
                type: req.type,
                contact: req.contact,
                location: req.location,
                urgency: req.urgency,
                status: req.status,
                createdAt: new Date(req.createdAt),
                responseCount: req.responseCount || 0,
                timeline: JSON.stringify(req.timeline),
                matches: JSON.stringify(req.matches || []),
                adminNotes: req.adminNotes
            }
        });
    }

    for (const task of MOCK_VOLUNTEER_TASKS) {
        await prisma.volunteerTask.create({
            data: {
                title: task.title,
                location: task.location,
                urgent: task.urgent,
                points: task.points,
                status: 'OPEN'
            }
        });
    }

    for (const alert of MOCK_ALERTS) {
        await prisma.alert.create({
            data: {
                title: alert.title,
                message: alert.message,
                district: alert.district,
                severity: alert.severity,
                type: alert.type,
                expiresAt: new Date(alert.expiresAt)
            }
        });
    }

    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
