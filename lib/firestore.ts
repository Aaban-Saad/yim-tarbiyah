import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc, // Added setDoc import for creating new documents
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { DailySubmission, UserProfile } from "./types"

// Collections
const USERS_COLLECTION = "users"
const SUBMISSIONS_COLLECTION = "submissions"

// User Profile Operations
export async function createUserProfile(userId: string, email: string, displayName: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId)
  const userProfile: Omit<UserProfile, "id"> = {
    email,
    displayName,
    isAdmin: false, // Simple admin check
    joinedAt: new Date(),
    totalSubmissions: 0,
    currentStreak: 0,
    longestStreak: 0,
  }

  await setDoc(userRef, userProfile)
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, USERS_COLLECTION, userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as UserProfile
  }
  return null
}

// Daily Submission Operations
export async function submitAmal(
  submission: Omit<DailySubmission, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const submissionData = {
    ...submission,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submissionData)

  // Update user's total submissions count
  const userRef = doc(db, USERS_COLLECTION, submission.userId)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const currentTotal = userSnap.data().totalSubmissions || 0
    await updateDoc(userRef, {
      totalSubmissions: currentTotal + 1,
    })
  }

  return docRef.id
}

export async function getUserSubmissions(userId: string, limitCount = 30): Promise<DailySubmission[]> {
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where("userId", "==", userId),
    orderBy("date", "desc"),
    limit(limitCount),
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as DailySubmission[]
}

export async function getSubmissionByDate(userId: string, date: string): Promise<DailySubmission | null> {
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where("userId", "==", userId),
    where("date", "==", date),
    limit(1),
  )

  const querySnapshot = await getDocs(q)
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as DailySubmission
  }

  return null
}

export async function updateDailySubmission(submissionId: string, updates: Partial<DailySubmission>): Promise<void> {
  const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId)
  await updateDoc(submissionRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

// Admin Operations
export async function getAllSubmissions(limitCount = 100): Promise<DailySubmission[]> {
  const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy("date", "desc"), limit(limitCount))

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as DailySubmission[]
}

export async function getSubmissionsByDate(date: string): Promise<DailySubmission[]> {
  const q = query(collection(db, SUBMISSIONS_COLLECTION), where("date", "==", date), orderBy("createdAt", "desc"))

  console.log("dasf, ",date)
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as DailySubmission[]
}

export async function getSubmissionsByDateRange(startDate: string, endDate: string): Promise<DailySubmission[]> {
  // Create a query that orders by the "date" field and filters within the specified range.
  // The 'date' field in the document should be a string in a sortable format like "YYYY-MM-DD".
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    orderBy("date"), // Order by the date string for range queries
    where("date", ">=", startDate),
    where("date", "<=", endDate)
  );

  console.log(`Searching for submissions from ${startDate} to ${endDate}`);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firebase Timestamps to JavaScript Date objects
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate(),
    } as DailySubmission;
  });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const querySnapshot = await getDocs(collection(db, USERS_COLLECTION))
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    joinedAt: doc.data().joinedAt?.toDate(),
  })) as UserProfile[]
}

// Admin Management Functions
export async function promoteToAdmin(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      isAdmin: true,
      updatedAt: new Date(),
    })
    return true
  } catch (error) {
    console.error("Error promoting user to admin:", error)
    return false
  }
}

export async function removeAdminPrivileges(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId)
    await updateDoc(userRef, {
      isAdmin: false,
      updatedAt: new Date(),
    })
    return true
  } catch (error) {
    console.error("Error removing admin privileges:", error)
    return false
  }
}

// List of initial admin emails
export const INITIAL_ADMIN_EMAILS = [
  "admin@yimtarbiyat.org",
  // Add more admin emails here
]

// Utility functions for calculations
export function calculateCompletionRate(submission: DailySubmission): number {
  const prayers = Object.values(submission.prayers)
  const completedPrayers = prayers.filter((status) => status === "completed").length
  const otherActivities = [
    submission.tilawat,
    submission.dua,
    submission.sadaqah,
    submission.zikr,
    submission.masnunDua,
    submission.bookReading,
  ].filter(Boolean).length

  const totalActivities = 11 // 5 prayers + 6 other activities
  const completedActivities = completedPrayers + otherActivities

  return Math.round((completedActivities / totalActivities) * 100)
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function getTodayDate(): string {
  return formatDate(new Date())
}
