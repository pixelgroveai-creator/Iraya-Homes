import { 
  StaffUser, 
  Lead, 
  Booking, 
  Guest, 
  Activity, 
  Task, 
  AreaChecklist, 
  Issue 
} from '../types';

export const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'STF-01',
    name: 'Kunal Singh',
    role: 'Senior Social Media Manager',
    email: 'kunal.singh@irayahomes.in',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    active: true,
    pin: '1234',
    department: 'Digital Marketing & Social Media'
  }
];

export const INITIAL_CHECKLISTS: AreaChecklist[] = [
  {
    areaId: 'suite-1',
    areaName: 'Suite 1 — Royal Parkview',
    areaSubtitle: 'King Bed, Ensuite Luxury Bath & Scenic Park Vista',
    iconName: 'BedDouble',
    status: 'Ready',
    lastInspectedAt: '2026-09-01T07:30:00Z',
    lastInspectedBy: 'Kunal Singh',
    items: [
      { id: 's1-1', label: 'Fresh high-thread linen replacement & pillow dressing', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:15:00Z' },
      { id: 's1-2', label: 'Toiletry restock (organic soaps, shampoo, conditioner, dental kit)', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:18:00Z' },
      { id: 's1-3', label: 'AC remote test, thermostat set to 23°C & filter check', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:22:00Z' },
      { id: 's1-4', label: 'Washroom deep cleanliness, mirror shine & hot water geyser test', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:28:00Z' }
    ]
  },
  {
    areaId: 'suite-2',
    areaName: 'Suite 2 — Garden Haven',
    areaSubtitle: 'King Bed, Ensuite Bathroom & Smart Entertainment Unit',
    iconName: 'Bed',
    status: 'Ready',
    lastInspectedAt: '2026-09-01T07:45:00Z',
    lastInspectedBy: 'Kunal Singh',
    items: [
      { id: 's2-1', label: 'Crisp linen dressing & wardrobe hanger replenishment', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:32:00Z' },
      { id: 's2-2', label: 'Toiletry kit, plush bath towels & floor mat layout', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:35:00Z' },
      { id: 's2-3', label: 'Dual AC & ceiling fan speed regulation verification', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:40:00Z' },
      { id: 's2-4', label: 'Ensuite washroom sanitation & drain flow check', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:44:00Z' }
    ]
  },
  {
    areaId: 'suite-3',
    areaName: 'Suite 3 — Terrace Suite',
    areaSubtitle: 'King Bed, Attached Bath & Direct Private Terrace Access',
    iconName: 'Building',
    status: 'Needs Attention',
    lastInspectedAt: '2026-09-01T07:55:00Z',
    lastInspectedBy: 'Kunal Singh',
    items: [
      { id: 's3-1', label: 'Linen replacement & blackout curtain tracks check', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:48:00Z' },
      { id: 's3-2', label: 'Restock premium bath amenities & vanity mirrors wipe', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:50:00Z' },
      { id: 's3-3', label: 'AC cooling test & ambient side-lamp check', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:52:00Z' },
      { id: 's3-4', label: 'Washroom water pressure & geyser operation check', completed: false, isFailed: true, notes: 'Geyser outlet valve leaking slightly. Maintenance ticket logged.' }
    ]
  },
  {
    areaId: 'suite-4',
    areaName: 'Suite 4 — Courtyard Suite',
    areaSubtitle: 'Family Configuration (Queen + Twin Bed) & Attached Bath',
    iconName: 'Users',
    status: 'Ready',
    lastInspectedAt: '2026-09-01T08:00:00Z',
    lastInspectedBy: 'Kunal Singh',
    items: [
      { id: 's4-1', label: 'Double bed linen change & extra cozy duvet preparation', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:50:00Z' },
      { id: 's4-2', label: 'Toiletry kit for multi-guest occupancy & fresh towels', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:54:00Z' },
      { id: 's4-3', label: 'In-room AC check and lighting ambiance preset', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:57:00Z' },
      { id: 's4-4', label: 'Washroom deep disinfection & exhaust fan check', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T08:00:00Z' }
    ]
  },
  {
    areaId: 'pool',
    areaName: 'Indoor Swimming Pool',
    areaSubtitle: 'Private Heated Pool, Deck Lounge & Mood Lighting',
    iconName: 'Waves',
    status: 'Ready',
    lastInspectedAt: '2026-09-01T07:10:00Z',
    lastInspectedBy: 'Kunal Singh',
    items: [
      { id: 'p-1', label: 'Water pH level check (Target: 7.2 - 7.6 pH, Chlorine 1.5ppm)', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:02:00Z', notes: 'pH tested at 7.4 pH - Crystal clear' },
      { id: 'p-2', label: 'Recirculation filtration system verification & skimmer basket cleanup', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:05:00Z' },
      { id: 'p-3', label: 'Pool deck floor mop, anti-skid mats & poolside loungers sanitize', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:08:00Z' },
      { id: 'p-4', label: 'Clean pool towel basket restock (12 fresh micro-fiber towels)', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:10:00Z' }
    ]
  },
  {
    areaId: 'kitchen',
    areaName: 'Fully Equipped Kitchen',
    areaSubtitle: 'Modular Island, Double Door Refrigerator, Microwave & Crockery',
    iconName: 'UtensilsCrossed',
    status: 'Ready',
    lastInspectedAt: '2026-09-01T07:20:00Z',
    lastInspectedBy: 'Kunal Singh',
    items: [
      { id: 'k-1', label: 'Appliance functionality test (Microwave, Induction/Gas, Refrigerator, RO purifier)', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:12:00Z' },
      { id: 'k-2', label: 'Premium crockery, wine glasses & cutlery inventory verification (16 sets)', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:15:00Z' },
      { id: 'k-3', label: 'Gas pipeline / electric induction safety & regulator inspection', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:17:00Z' },
      { id: 'k-4', label: 'Tea/Coffee bar restock (Gourmet tea bags, coffee pods, sugar, dairy sachets)', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:20:00Z' }
    ]
  },
  {
    areaId: 'lounge-pool-table',
    areaName: 'Entertainment & Pool Table Lounge',
    areaSubtitle: '8-ft Tournament Slate Pool Table, Leather Seating & Audio',
    iconName: 'Trophy',
    status: 'Ready',
    lastInspectedAt: '2026-09-01T07:40:00Z',
    lastInspectedBy: 'Kunal Singh',
    items: [
      { id: 'l-1', label: 'Pool table felt brush & vacuum, level balance verification', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:33:00Z' },
      { id: 'l-2', label: 'Full 16-ball set present, 4 straight cue sticks & cue chalk in tray', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:35:00Z' },
      { id: 'l-3', label: 'Overhead tournament spotlight & ambient accent lighting test', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:38:00Z' },
      { id: 'l-4', label: 'Soundbar Bluetooth reset & leather lounger upholstery polish', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:40:00Z' }
    ]
  },
  {
    areaId: 'terrace-balcony',
    areaName: 'Private Terrace & Scenic Balcony',
    areaSubtitle: 'Park-facing Overlook, Outdoor Seating & Garden Accents',
    iconName: 'Trees',
    status: 'Ready',
    lastInspectedAt: '2026-09-01T07:25:00Z',
    lastInspectedBy: 'Kunal Singh',
    items: [
      { id: 'tb-1', label: 'Terrace cane lounge setup & weather-resistant cushions deployed', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:21:00Z' },
      { id: 'tb-2', label: 'Balcony glass balustrades wiped & safety rail anchor check', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:23:00Z' },
      { id: 'tb-3', label: 'Garden view floor swept & potted exotic palms watered', completed: true, checkedBy: 'Kunal Singh', checkedAt: '2026-09-01T07:25:00Z' }
    ]
  }
];

export const INITIAL_GUESTS: Guest[] = [
  {
    id: 'GST-3091',
    name: 'Vikramaditya Roy',
    phone: '+91 98112 34567',
    email: 'vikram.roy@techcap.in',
    city: 'New Delhi',
    totalStays: 3,
    lifetimeValue: 185000,
    vipStatus: true,
    preferences: [
      { category: 'Pool & Recreation', note: 'Prefers pool heated early morning (7 AM)' },
      { category: 'Dietary', note: 'Strictly vegetarian breakfast prep (Almond milk required)' },
      { category: 'Room Setup', note: 'Suite 1 Royal Parkview is their favorite room' }
    ],
    serviceNotes: 'High-value tech corporate client. Host welcome with fruit basket & Lucknow sweets.',
    firstStayDate: '2025-11-14',
    lastStayDate: '2026-09-01',
    bookingIds: ['BK-2026-101'],
    createdAt: '2025-11-01T10:00:00Z'
  },
  {
    id: 'GST-3092',
    name: 'Dr. Ananya Mishra',
    phone: '+91 94152 88990',
    email: 'ananya.mishra@apollo.org',
    city: 'Varanasi',
    totalStays: 2,
    lifetimeValue: 95000,
    vipStatus: false,
    preferences: [
      { category: 'Timing', note: 'Early check-in around 11:30 AM requested whenever feasible' },
      { category: 'Room Setup', note: 'Extra feathered pillows in all suites' }
    ],
    serviceNotes: 'Family holiday trips with elderly parents. Ground floor Suite 4 preferred for easy access.',
    firstStayDate: '2026-03-20',
    lastStayDate: '2026-07-15',
    bookingIds: ['BK-2026-095'],
    createdAt: '2026-03-10T12:30:00Z'
  },
  {
    id: 'GST-3093',
    name: 'Karan Mehra',
    phone: '+91 98200 44556',
    email: 'karan.mehra@mumbaiproductions.com',
    city: 'Mumbai',
    totalStays: 1,
    lifetimeValue: 75000,
    vipStatus: false,
    preferences: [
      { category: 'Pool & Recreation', note: 'Pool table tournament cues set & late evening terrace access' },
      { category: 'Dietary', note: 'Non-vegetarian barbecue grill setup requested' }
    ],
    serviceNotes: 'Creative crew shoot & private retreat. Highly values privacy and fast Wi-Fi.',
    firstStayDate: '2026-09-04',
    lastStayDate: '2026-09-06',
    bookingIds: ['BK-2026-102'],
    createdAt: '2026-08-20T14:15:00Z'
  },
  {
    id: 'GST-3094',
    name: 'Shweta Singhal',
    phone: '+91 98391 77665',
    email: 'shweta.singhal@gmail.com',
    city: 'Lucknow',
    totalStays: 1,
    lifetimeValue: 48000,
    vipStatus: false,
    preferences: [
      { category: 'Room Setup', note: 'Kids cot needed in Suite 2' }
    ],
    serviceNotes: 'Local family reunion staycation.',
    firstStayDate: '2026-08-10',
    lastStayDate: '2026-08-12',
    bookingIds: ['BK-2026-088'],
    createdAt: '2026-08-01T09:00:00Z'
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'LD-10024',
    name: 'Sameer Kapoor',
    phone: '+91 98711 22334',
    email: 'sameer.kapoor@innovate.co',
    source: 'WhatsApp',
    checkInDate: '2026-09-12',
    checkOutDate: '2026-09-14',
    guestCount: 8,
    stayPurpose: 'Family',
    status: 'FOLLOW-UP',
    assignedStaffId: 'STF-01', // Kunal Singh
    scheduledFollowUp: '2026-09-01T14:00:00Z',
    quoteAmount: 65000,
    notes: 'Inquired on WhatsApp for 2-night family reunion weekend. Wants private indoor pool & chef service options.',
    createdAt: '2026-08-29T11:20:00Z',
    updatedAt: '2026-08-31T16:00:00Z'
  },
  {
    id: 'LD-10025',
    name: 'Nandini Gupta',
    phone: '+91 99350 99881',
    email: 'nandini.g@architects.in',
    source: 'Instagram',
    checkInDate: '2026-09-18',
    checkOutDate: '2026-09-20',
    guestCount: 10,
    stayPurpose: 'Friends',
    status: 'NEW',
    assignedStaffId: 'STF-01', // Kunal Singh
    scheduledFollowUp: '2026-09-01T11:00:00Z',
    quoteAmount: 70000,
    notes: 'Saw villa terrace & pool photos on Instagram Reel. Looking for a weekend friends getaway.',
    createdAt: '2026-09-01T06:30:00Z',
    updatedAt: '2026-09-01T06:30:00Z'
  },
  {
    id: 'LD-10026',
    name: 'Rajesh Aggarwal',
    phone: '+91 98100 87654',
    email: 'raggarwal@delhiexports.com',
    source: 'Phone',
    checkInDate: '2026-09-25',
    checkOutDate: '2026-09-27',
    guestCount: 6,
    stayPurpose: 'Group',
    status: 'QUALIFIED',
    assignedStaffId: 'STF-01', // Kunal Singh
    scheduledFollowUp: '2026-09-02T15:30:00Z',
    quoteAmount: 60000,
    notes: 'Direct phone call enquiry. Budget approved. Sending hold agreement & advance payment link.',
    createdAt: '2026-08-28T09:40:00Z',
    updatedAt: '2026-08-31T14:10:00Z'
  },
  {
    id: 'LD-10027',
    name: 'Meenal Chawla',
    phone: '+91 97170 33221',
    email: 'meenal.c@weddingsutra.com',
    source: 'Website',
    checkInDate: '2026-10-02',
    checkOutDate: '2026-10-05',
    guestCount: 12,
    stayPurpose: 'Event',
    status: 'BOOKING PENDING',
    assignedStaffId: 'STF-01', // Kunal Singh
    scheduledFollowUp: '2026-09-01T16:00:00Z',
    quoteAmount: 110000,
    notes: 'Pre-wedding intimate cocktail night & family stay. Sent custom quote for 3 nights + catering support.',
    createdAt: '2026-08-26T18:00:00Z',
    updatedAt: '2026-08-31T10:45:00Z'
  },
  {
    id: 'LD-10028',
    name: 'Harshit Saxena',
    phone: '+91 94155 11223',
    source: 'Direct Walk-in',
    checkInDate: '2026-09-08',
    checkOutDate: '2026-09-09',
    guestCount: 4,
    stayPurpose: 'Family',
    status: 'CONTACTED',
    assignedStaffId: 'STF-01',
    scheduledFollowUp: '2026-09-01T17:00:00Z',
    quoteAmount: 35000,
    notes: 'Local Gomti Nagar resident looking for a 1-night birthday staycation for parents.',
    createdAt: '2026-08-30T16:15:00Z',
    updatedAt: '2026-08-31T12:00:00Z'
  },
  {
    id: 'LD-10029',
    name: 'Pooja Bhatia',
    phone: '+91 98211 99002',
    source: 'Referral',
    checkInDate: '2026-09-15',
    checkOutDate: '2026-09-17',
    guestCount: 8,
    stayPurpose: 'Friends',
    status: 'LOST',
    assignedStaffId: 'STF-01',
    lostReason: 'Dates clashed with another booking already held.',
    quoteAmount: 58000,
    notes: 'Referred by Vikramaditya Roy. Dates unavailable.',
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-08-27T11:00:00Z'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-2026-101',
    guestId: 'GST-3091',
    guestName: 'Vikramaditya Roy',
    guestPhone: '+91 98112 34567',
    checkInDate: '2026-09-01',
    checkOutDate: '2026-09-03',
    guestCount: 7,
    stayPurpose: 'Family',
    status: 'Checked-in',
    totalQuote: 70000,
    advanceDepositPaid: 35000,
    balanceDue: 35000,
    securityDepositAmount: 15000,
    securityDepositRefunded: false,
    preArrivalInspectionDone: true,
    postCheckoutInspectionDone: false,
    specialRequests: 'Warm pool at 7:00 AM, Lucknow Galouti kebab dinner recommendations, 2 extra sets of pool towels.',
    notes: 'Checked in at 12:45 PM by Kunal Singh. Keys handed over. Welcome drinks served in lounge.',
    assignedHostId: 'STF-01',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-01T07:15:00Z'
  },
  {
    id: 'BK-2026-102',
    guestId: 'GST-3093',
    guestName: 'Karan Mehra',
    guestPhone: '+91 98200 44556',
    checkInDate: '2026-09-04',
    checkOutDate: '2026-09-06',
    guestCount: 9,
    stayPurpose: 'Group',
    status: 'Confirmed',
    totalQuote: 75000,
    advanceDepositPaid: 40000,
    balanceDue: 35000,
    securityDepositAmount: 15000,
    securityDepositRefunded: false,
    preArrivalInspectionDone: false,
    postCheckoutInspectionDone: false,
    specialRequests: 'Pool table cues straight & chalk ready, evening barbecue setup on terrace.',
    notes: 'Advance 50% received via IMPS. Balance due on arrival. Housekeeping scheduled for Friday morning.',
    assignedHostId: 'STF-01',
    createdAt: '2026-08-20T14:30:00Z',
    updatedAt: '2026-08-30T11:00:00Z'
  },
  {
    id: 'BK-2026-103',
    guestId: 'GST-3092',
    guestName: 'Dr. Ananya Mishra',
    guestPhone: '+91 94152 88990',
    checkInDate: '2026-09-09',
    checkOutDate: '2026-09-11',
    guestCount: 6,
    stayPurpose: 'Family',
    status: 'Hold',
    totalQuote: 62000,
    advanceDepositPaid: 10000,
    balanceDue: 52000,
    securityDepositAmount: 15000,
    securityDepositRefunded: false,
    preArrivalInspectionDone: false,
    postCheckoutInspectionDone: false,
    specialRequests: 'Ground floor Suite 4 for grandparents, wheelchair-friendly ramp assistance at entrance.',
    notes: 'Token hold amount received. Full advance expected by Sep 3rd.',
    assignedHostId: 'STF-01',
    createdAt: '2026-08-28T16:00:00Z',
    updatedAt: '2026-08-31T09:00:00Z'
  },
  {
    id: 'BK-2026-088',
    guestId: 'GST-3094',
    guestName: 'Shweta Singhal',
    guestPhone: '+91 98391 77665',
    checkInDate: '2026-08-10',
    checkOutDate: '2026-08-12',
    guestCount: 5,
    stayPurpose: 'Family',
    status: 'Checked-out',
    totalQuote: 48000,
    advanceDepositPaid: 48000,
    balanceDue: 0,
    securityDepositAmount: 15000,
    securityDepositRefunded: true,
    preArrivalInspectionDone: true,
    postCheckoutInspectionDone: true,
    specialRequests: 'Cot in Suite 2.',
    notes: 'Stay completed successfully. Post-checkout inspection cleared, security deposit 100% refunded.',
    assignedHostId: 'STF-01',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-12T13:00:00Z'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'ACT-901',
    type: 'Pool Check',
    title: 'Daily Morning Pool Quality Verification',
    description: 'Indoor pool pH tested at 7.4 pH. Chlorine 1.5 ppm. Water clarity pristine. Filter backwash completed.',
    timestamp: '2026-09-01T07:10:00Z',
    staffId: 'STF-01',
    staffName: 'Kunal Singh',
    relatedBookingId: 'BK-2026-101',
    outcome: 'Pool certified ready for guest use'
  },
  {
    id: 'ACT-902',
    type: 'Room Inspection',
    title: 'Pre-Arrival Inspection Suite 1 & Suite 4',
    description: 'All 4 suites inspected. AC tested, linen dressed, organic toiletries restocked for Vikramaditya Roy party.',
    timestamp: '2026-09-01T07:30:00Z',
    staffId: 'STF-01',
    staffName: 'Kunal Singh',
    relatedBookingId: 'BK-2026-101',
    outcome: 'Property passed pre-arrival readiness'
  },
  {
    id: 'ACT-903',
    type: 'Call',
    title: 'Follow-up Call with Sameer Kapoor',
    description: 'Discussed family reunion requirements for Sep 12-14. Sent villa video tour link via WhatsApp.',
    timestamp: '2026-08-31T15:45:00Z',
    staffId: 'STF-01',
    staffName: 'Kunal Singh',
    relatedLeadId: 'LD-10024',
    outcome: 'Guest confirmed interest, scheduling final confirmation call today at 2 PM'
  },
  {
    id: 'ACT-904',
    type: 'WhatsApp',
    title: 'Enquiry Received from Instagram Lead',
    description: 'Nandini Gupta asked about booking villa for 10 friends for a weekend celebration.',
    timestamp: '2026-09-01T06:35:00Z',
    staffId: 'STF-01',
    staffName: 'Kunal Singh',
    relatedLeadId: 'LD-10025',
    outcome: 'Shared brochure and tariffs'
  },
  {
    id: 'ACT-905',
    type: 'Payment',
    title: 'Advance Deposit Received - Karan Mehra',
    description: '₹40,000 advance received for Sep 4-6 stay via Bank Transfer (Ref #AXIS883921).',
    timestamp: '2026-08-30T11:00:00Z',
    staffId: 'STF-01',
    staffName: 'Kunal Singh',
    relatedBookingId: 'BK-2026-102',
    outcome: 'Booking transitioned to Confirmed'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'TSK-501',
    title: 'Warm Indoor Pool & Set Ambient Lighting',
    description: 'Turn on pool heating system to 28°C and arrange clean towel stack by 7:00 AM for in-house guests.',
    priority: 'Urgent',
    status: 'In Progress',
    category: 'Housekeeping',
    assignedStaffId: 'STF-01',
    dueDate: '2026-09-01',
    linkedBookingId: 'BK-2026-101',
    linkedAreaId: 'pool',
    createdAt: '2026-08-31T18:00:00Z'
  },
  {
    id: 'TSK-502',
    title: 'Follow-up with Sameer Kapoor (WhatsApp Lead)',
    description: 'Call back Sameer regarding Sep 12-14 dates and confirm catering preferences.',
    priority: 'High',
    status: 'To Do',
    category: 'Follow-up',
    assignedStaffId: 'STF-01',
    dueDate: '2026-09-01',
    createdAt: '2026-08-31T16:00:00Z'
  },
  {
    id: 'TSK-503',
    title: 'Fix Suite 3 Geyser Valve Pressure Leak',
    description: 'Plumbing vendor Ram Lal scheduled to replace inlet pressure washer before weekend check-in.',
    priority: 'High',
    status: 'To Do',
    category: 'Maintenance',
    assignedStaffId: 'STF-01',
    dueDate: '2026-09-01',
    linkedAreaId: 'suite-3',
    createdAt: '2026-08-31T17:00:00Z'
  },
  {
    id: 'TSK-504',
    title: 'Pre-Arrival Setup for Karan Mehra Group',
    description: 'Check pool table cues, restock barbecue coal on terrace, setup 16-person dinner crockery.',
    priority: 'Medium',
    status: 'To Do',
    category: 'Housekeeping',
    assignedStaffId: 'STF-01',
    dueDate: '2026-09-03',
    linkedBookingId: 'BK-2026-102',
    linkedAreaId: 'lounge-pool-table',
    createdAt: '2026-08-30T12:00:00Z'
  },
  {
    id: 'TSK-505',
    title: 'End of Month Linen Audit & Dry Cleaning Dispatch',
    description: 'Count master bedsheets, duvets, poolside towels and restock backup closet.',
    priority: 'Low',
    status: 'Done',
    category: 'Housekeeping',
    assignedStaffId: 'STF-01',
    dueDate: '2026-08-31',
    completedAt: '2026-08-31T18:30:00Z',
    completedByStaffId: 'STF-01',
    createdAt: '2026-08-29T10:00:00Z'
  },
  {
    id: 'TSK-506',
    title: 'Overdue: Weekly RO Purifier Filter Sanitization',
    description: 'Kitchen RO water filtration TDS test & UV cartridge sanitization.',
    priority: 'Urgent',
    status: 'To Do',
    category: 'Inspection',
    assignedStaffId: 'STF-01',
    dueDate: '2026-08-30', // Overdue!
    linkedAreaId: 'kitchen',
    createdAt: '2026-08-28T09:00:00Z'
  }
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'ISS-401',
    title: 'Suite 3 Bathroom Geyser Outlet Valve Drip',
    description: 'Slow water drip at inlet valve reducing hot water flow. Needs pipe seal washer replacement.',
    category: 'Plumbing',
    propertyAreaId: 'suite-3',
    severity: 'High',
    status: 'In Progress',
    reportedByStaffId: 'STF-01',
    assignedToStaffOrVendor: 'Ram Lal Plumbing Services (Lucknow)',
    impactsUpcomingStay: true,
    reportedAt: '2026-08-31T17:00:00Z',
    estimatedCost: 850
  },
  {
    id: 'ISS-402',
    title: 'Pool Underwater Blue LED Spotlight Intermittent Flicker',
    description: 'Left underwater pool accent light flickering when filtration pump switches to high speed.',
    category: 'Electrical',
    propertyAreaId: 'pool',
    severity: 'Medium',
    status: 'Open',
    reportedByStaffId: 'STF-01',
    assignedToStaffOrVendor: 'Sharma Electricals',
    impactsUpcomingStay: false,
    reportedAt: '2026-08-30T19:30:00Z',
    estimatedCost: 1500
  },
  {
    id: 'ISS-403',
    title: 'Lounge Pool Table Cue #3 Tip Scuffed',
    description: 'One 57-inch pool cue tip needs re-chalking and leather ferrule replacement.',
    category: 'Amenities',
    propertyAreaId: 'lounge-pool-table',
    severity: 'Low',
    status: 'Resolved',
    reportedByStaffId: 'STF-01',
    assignedToStaffOrVendor: 'Kunal Singh',
    impactsUpcomingStay: false,
    reportedAt: '2026-08-28T14:00:00Z',
    resolvedAt: '2026-08-29T11:00:00Z',
    resolutionNotes: 'Replaced with spare cue tip from inventory stock.',
    estimatedCost: 200
  }
];
