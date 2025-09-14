export interface PrayerStatus {
  fajr: "completed" | "missed" | "masbuq"
  zuhr: "completed" | "missed" | "masbuq"
  asr: "completed" | "missed" | "masbuq"
  maghrib: "completed" | "missed" | "masbuq"
  isha: "completed" | "missed" | "masbuq"
}

export interface DailySubmission {
  id?: string
  userId: string
  date: string // YYYY-MM-DD format
  prayers: PrayerStatus
  tilawat: boolean // Quran recitation
  dua: boolean // Supplication
  sadaqah: boolean // Charity
  zikr: boolean // Dhikr/Remembrance
  masnunDua: boolean // Sunnah prayers
  bookReading: boolean // Book reading (assigned portion)
  sleepTime: string // e.g., "10 PM"
  comments: string
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id: string
  email: string
  displayName: string
  isAdmin: boolean
  joinedAt: Date
  totalSubmissions: number
  currentStreak: number
  longestStreak: number
}

export interface CommunityStats {
  totalMembers: number
  activeToday: number
  averageCompletion: number
  topPerformers: Array<{
    userId: string
    displayName: string
    completionRate: number
  }>
}
