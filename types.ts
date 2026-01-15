
export enum AcademicYear {
  Y1 = '1AS',
  Y2 = '2AS',
  Y3 = '3AS'
}

export enum Major {
  SCIENTIFIC = 'علوم تجريبية',
  MATH = 'رياضيات',
  TECH_MATH = 'تقني رياضي',
  MGM_ECON = 'تسيير واقتصاد',
  LIT_PHIL = 'آداب وفلسفة',
  LANGUAGES = 'لغات أجنبية'
}

export interface UserProfile {
  name: string;
  avatar: string;
  isLoggedIn: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: number;
}
