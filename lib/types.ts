export interface PrayerStatus {
  fajr: "completed" | "munfarid" | "masbuq"
  zuhr: "completed" | "munfarid" | "masbuq"
  asr: "completed" | "munfarid" | "masbuq"
  maghrib: "completed" | "munfarid" | "masbuq"
  isha: "completed" | "munfarid" | "masbuq"
}

export interface DailySubmission {
  id?: string
  userId: string
  date: string // YYYY-MM-DD format
  prayers: PrayerStatus
  tilawat: boolean // Quran recitation
  tilawatComment: string
  dua: boolean // Supplication
  duaComment:string
  sadaqah: boolean // Charity
  sadaqahComment: string
  zikr: boolean // Dhikr/Remembrance
  zikrComment: string
  masnunDua: boolean // Sunnah prayers
  masnunDuaComment: string
  bookReading: boolean // Book reading (assigned portion)
  bookReadingComment: string
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
