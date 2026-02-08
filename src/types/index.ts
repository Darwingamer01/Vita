export type ResourceType =
  | 'BLOOD' | 'OXYGEN' | 'AMBULANCE' | 'SHELTER' | 'MEDICAL_CAMP' | 'HOSPITAL'
  | 'MEDICINE' | 'POLICE' | 'FIRE'
  // v4.0 New Types
  | 'DOCTOR' | 'SPECIALIST' | 'PATHOLOGY' | 'EQUIPMENT' | 'BLOOD_BANK'
  | 'CLINIC' | 'PLASMA' | 'NURSE' | 'DIALYSIS' | 'MEDICAL';

export type AvailabilityStatus = 'AVAILABLE' | 'SCARCE' | 'CRITICAL' | 'OUT_OF_STOCK' | 'BUSY' | 'LIMITED' | 'UNAVAILABLE' | 'ON_CALL' | 'ON_LEAVE';

export type VerificationLevel = 'UNVERIFIED' | 'COMMUNITY' | 'VERIFIED' | 'GOVERNMENT' | 'FLAGGED' | 'NGO' | 'OFFICIAL_PARTNER';

export type UrgencyLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  district?: string; // For alerts
}

export interface ContactInfo {
  phone: string;
  whatsapp?: string;
  website?: string;
  email?: string;
  name?: string;
}

// --- Specific Metadata Interfaces ---

export interface DoctorProfile {
  specialty: string; // e.g. Cardiologist, Neurologist
  qualification: string;
  experienceYears: number;
  availableToday: boolean;
  nextAvailableSlot?: string;
  consultationFee?: number;
  videoConsult: boolean;
  hospitalAffiliation?: string;
}

export interface HospitalFacilities {
  beds: {
    general: number;
    icu: number;
    ventilator: number;
    oxygen: number;
    burns?: number;
    pediatric?: number;
  };
  specialties: string[];
  insuranceAccepted: string[];
  ayushmanBharat: boolean;
}

export interface MedicineStock {
  name: string;
  quantity: number;
  unit: string; // strip, vial, bottle
  price?: number;
  genericName?: string;
  lastUpdated: string;
}

export interface BloodStock {
  groups: {
    [key in 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-']: number; // units
  };
  plasmaAvailable: boolean;
  apheresisAvailable: boolean;
}

export interface LabTest {
  name: string; // e.g. RT-PCR, CBC, D-Dimer
  turnaroundTime: string; // e.g. "6 hours"
  homeCollection: boolean;
  price: number;
}

export interface EmergencyEquipment {
  type: string; // Wheelchair, Oxygen Concentrator, Stretcher
  rentalPrice?: number;
  deposit?: number;
  isRental: boolean; // false = sale
}

export interface Pharmacy {
  availableMedicines: string[];
  homeDelivery: boolean;
}

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description?: string;
  location: Location;
  contact: ContactInfo;
  status: AvailabilityStatus;
  verificationLevel: VerificationLevel;
  lastUpdated: string; // ISO Date string

  // Extended Metadata (Union type feel)
  metadata?: {
    // Shared
    operatingHours?: string; // "24x7" or "09:00-17:00"

    // Type Specific
    doctor?: DoctorProfile;
    hospital?: HospitalFacilities;
    medicines?: MedicineStock[];
    pharmacy?: Pharmacy;
    bloodStock?: BloodStock;
    labTests?: LabTest[];
    equipment?: EmergencyEquipment[];

    // Legacy/Simple
    oxygenType?: 'CYLINDER' | 'CONCENTRATOR' | 'REFILL';
    ambulanceType?: 'BASIC' | 'ADVANCED' | 'ICU' | 'NEONATAL';
    shelter?: { capacity: number; occupancy: number; facilities: string[]; petFriendly: boolean };
    serviceType?: string; // Police/Fire
  };

  reportCount: number;
  upvoteCount: number;
  distance?: number; // Calculated at runtime
}

export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED' | 'CANCELLED' | 'FULFILLED' | 'EXPIRED';

export interface ActivityLogItem {
  id: string;
  type: 'STATUS_CHANGE' | 'NOTE_ADDED' | 'MATCH_FOUND' | 'CREATED' | 'ALERT_SENT';
  timestamp: string;
  message: string;
  actor: 'ADMIN' | 'SYSTEM' | 'USER';
  metadata?: any;
}

export interface MatchSuggestion {
  resourceId: string;
  resourceName: string;
  type: ResourceType;
  distance: number; // km
  matchScore: number; // 0-100
  verificationLevel: VerificationLevel;
  contact: string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  contact: string;
  location: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  createdAt: string;
  responseCount: number;

  // v4.0 Enhanced Lifecycle
  timeline: ActivityLogItem[];
  matches: MatchSuggestion[];
  adminNotes?: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  district: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  type: 'TRAFFIC' | 'WEATHER' | 'MEDICAL' | 'SECURITY';
  createdAt: string;
  expiresAt: string;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: string[]; // Driver, Paramedic, Doctor
  location: string;
  status: 'AVAILABLE' | 'BUSY';
  points: number;
  badges: string[];
}
