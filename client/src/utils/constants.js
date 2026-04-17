// Lead unlock pricing (Rs.)
export const LEAD_PRICES = {
    default: 150,
    premium: 300,
};

// Subscription plans
export const PLANS = {
    free: { label: 'Free', price: 0, leadsPerMonth: 3 },
    pro: { label: 'Pro', price: 999, leadsPerMonth: 999 },
};

// Cities supported
export const CITIES = [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Hyderabad',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
];

// Karachi areas (primary market)
export const KARACHI_AREAS = [
    'DHA Phase 1', 'DHA Phase 2', 'DHA Phase 3', 'DHA Phase 4',
    'DHA Phase 5', 'DHA Phase 6', 'DHA Phase 7', 'DHA Phase 8',
    'Clifton', 'Bath Island', 'Boat Basin',
    'Gulshan-e-Iqbal', 'Gulshan-e-Hadeed',
    'North Nazimabad', 'Nazimabad',
    'Federal B Area', 'Buffer Zone',
    'Gulberg', 'Scheme 33',
    'PECHS', 'Tariq Road',
    'Saddar', 'Garden',
    'Malir', 'Malir Cantt',
    'Korangi', 'Landhi',
    'Orangi Town', 'Baldia',
    'Liaquatabad', 'New Karachi',
    'Surjani Town', 'Sohrab Goth',
    'Shahrah-e-Faisal', 'Bahadurabad',
    'Johar', 'Gulistan-e-Johar',
    'Safoora', 'Askari',
    'Model Colony', 'Quaidabad',
    'Defence View', 'Cantt',
    'Kemari', 'Lyari',
];

// All areas (other cities minimal for now)
export const ALL_AREAS = [
    ...KARACHI_AREAS,
    'Lahore (All Areas)',
    'Islamabad (All Areas)',
    'Rawalpindi (All Areas)',
];

// Payment methods accepted
export const PAYMENT_METHODS = [
    { value: 'jazzcash', label: 'JazzCash' },
    { value: 'easypaisa', label: 'Easypaisa' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'manual', label: 'Manual / Cash' },
];

// Lead status labels
export const LEAD_STATUS_LABELS = {
    open: 'Open',
    pending: 'Payment Pending',
    unlocked: 'Unlocked',
    closed: 'Closed',
    expired: 'Expired',
};