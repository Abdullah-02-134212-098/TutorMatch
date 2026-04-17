// All supported education boards
export const BOARDS = [
    'Sindh',
    'Federal',
    'Punjab',
    'O Level',
    'A Level',
    'Aga Khan',
    'IB',
    'University',
];

// Class levels grouped by board
export const LEVELS_BY_BOARD = {
    Sindh: [
        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
        'Class 6', 'Class 7', 'Class 8',
        'Class 9', 'Class 10',
        'Class 11 (FSC)', 'Class 11 (ICS)', 'Class 11 (ICOM)', 'Class 11 (FA)',
        'Class 12 (FSC)', 'Class 12 (ICS)', 'Class 12 (ICOM)', 'Class 12 (FA)',
    ],
    Federal: [
        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
        'Class 6', 'Class 7', 'Class 8',
        'Class 9 (SSC-I)', 'Class 10 (SSC-II)',
        'Class 11 (HSSC-I)', 'Class 12 (HSSC-II)',
    ],
    Punjab: [
        'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
        'Class 6', 'Class 7', 'Class 8',
        'Class 9', 'Class 10',
        'Class 11', 'Class 12',
    ],
    'O Level': [
        'O1 (Grade 9 equivalent)',
        'O2 (Grade 10 equivalent)',
    ],
    'A Level': [
        'AS Level',
        'A2 Level',
    ],
    'Aga Khan': [
        'SSC-I', 'SSC-II',
        'HSSC-I', 'HSSC-II',
    ],
    IB: [
        'MYP Grade 6', 'MYP Grade 7', 'MYP Grade 8', 'MYP Grade 9', 'MYP Grade 10',
        'DP Grade 11', 'DP Grade 12',
    ],
    University: [
        'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
        'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8',
        'MBA', 'MS / MPhil',
    ],
};

// All levels flat (for lead form dropdowns)
export const ALL_LEVELS = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10',
    'Class 11', 'Class 12',
    'O Level', 'A Level',
    'SSC-I', 'SSC-II', 'HSSC-I', 'HSSC-II',
    'AS Level', 'A2 Level',
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
    'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8',
    'MBA', 'MS / MPhil',
];

// Subjects organised by category
export const SUBJECTS = {
    'Core (Matric / Inter)': [
        'Mathematics', 'Physics', 'Chemistry', 'Biology',
        'English', 'Urdu', 'Pakistan Studies', 'Islamiat',
        'Computer Science',
    ],
    'FSC Pre-Engineering': [
        'Mathematics', 'Physics', 'Chemistry',
    ],
    'FSC Pre-Medical': [
        'Biology', 'Physics', 'Chemistry',
    ],
    'ICS': [
        'Mathematics', 'Statistics', 'Computer Science', 'Physics',
    ],
    'ICOM': [
        'Principles of Accounting', 'Economics',
        'Commercial Geography', 'Business Mathematics',
    ],
    'O Level / A Level': [
        'Mathematics', 'Additional Mathematics', 'Physics', 'Chemistry', 'Biology',
        'English Language', 'English Literature', 'History', 'Geography',
        'Economics', 'Business Studies', 'Psychology', 'Accounting',
        'Computer Science', 'Urdu', 'Islamiat', 'Further Mathematics',
    ],
    'University': [
        'Calculus', 'Linear Algebra', 'Statistics', 'Discrete Mathematics',
        'Programming (C++)', 'Programming (Python)', 'Programming (Java)',
        'Data Structures', 'OOP', 'DBMS', 'Operating Systems',
        'Financial Accounting', 'Microeconomics', 'Macroeconomics',
        'Business Communication',
    ],
};

// Flat list of all unique subjects (for simple dropdowns)
export const ALL_SUBJECTS = [
    ...new Set(Object.values(SUBJECTS).flat())
].sort();