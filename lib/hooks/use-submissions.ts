"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  getUserSubmissions,
  getSubmissionByDate,
  submitAmal,
  updateDailySubmission,
  getTodayDate,
} from "@/lib/firestore"
import type { DailySubmission } from "@/lib/types"

export function useUserSubmissions(limit = 50) {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<DailySubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setSubmissions([])
      setLoading(false)
      return
    }

    const fetchSubmissions = async () => {
      try {
        setLoading(true)
        const userSubmissions = await getUserSubmissions(user.uid, limit)
        setSubmissions(userSubmissions)
        setError(null)
      } catch (err) {
        setError("Failed to fetch submissions")
        console.error("Error fetching submissions:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [user, limit])

  return {
    submissions,
    loading,
    error,
    refetch: () => {
      if (user) {
        getUserSubmissions(user.uid, limit).then(setSubmissions)
      }
    },
  }
}

export function useTodaySubmission() {
  const { user } = useAuth()
  const [submission, setSubmission] = useState<DailySubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setSubmission(null)
      setLoading(false)
      return
    }
    const fetchTodaySubmission = async () => {
      try {
        setLoading(true)
        const todaySubmission = await getSubmissionByDate(user.uid, getTodayDate())
        setSubmission(todaySubmission)
        setError(null)
      } catch (err) {
        setError("Failed to fetch today's submission")
        console.error("Error fetching today's submission:", err)
      } finally {
        setLoading(false)
      }
    }


    fetchTodaySubmission()
  }, [user])

  // const submitToday = async (
  //   submissionData: Omit<DailySubmission, "id" | "userId" | "date" | "createdAt" | "updatedAt">,
  // ) => {
  //   if (!user) throw new Error("User not authenticated")

  //   try {
  //     const submissionId = await submitDailyAmal({
  //       ...submissionData,
  //       userId: user.uid,
  //       date: getTodayDate(),
  //     })

  //     const newSubmission: DailySubmission = {
  //       id: submissionId,
  //       ...submissionData,
  //       userId: user.uid,
  //       date: getTodayDate(),
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     }

  //     setSubmission(newSubmission)
  //     return submissionId
  //   } catch (err) {
  //     setError("Failed to submit daily amal")
  //     throw err
  //   }
  // }

  // const updateToday = async (updates: Partial<DailySubmission>) => {
  //   if (!user || !submission?.id) throw new Error("No submission to update")

  //   try {
  //     await updateDailySubmission(submission.id, updates)
  //     setSubmission((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date() } : null))
  //   } catch (err) {
  //     setError("Failed to update submission")
  //     console.log(err)
  //     throw err
  //   }
  // }

  const submit = async (
    submissionData: Omit<DailySubmission, "id" | "userId" | "date" | "createdAt" | "updatedAt">,
    date: string // Or Date object, depending on your getFormattedDate function
  ) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const submissionId = await submitAmal({
        ...submissionData,
        userId: user.uid,
        date,
      });

      const newSubmission: DailySubmission = {
        id: submissionId,
        ...submissionData,
        userId: user.uid,
        date,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSubmission(newSubmission); // This might need to be adjusted if you're not always setting the "current" submission
      return submissionId;
    } catch (err) {
      setError("Failed to submit daily amal");
      throw err;
    }
  };

  const update = async ( submissionData: Omit<DailySubmission, "id" | "userId" | "date" | "createdAt" | "updatedAt">,
    date: string) => {
    if (!user) throw new Error("No submission to update");

    try {
      
      const currentSubmission = await getSubmissionByDate(user.uid, date) as DailySubmission
      const submissionId = currentSubmission?.id || ""

      await updateDailySubmission(submissionId , submissionData);
      // You'll need a way to find and update the correct submission in your state if it's not the "current" one
      setSubmission((prev) => (prev && prev.id === submissionId ? { ...prev, ...submissionData, updatedAt: new Date() } : prev));
    } catch (err) {
      setError("Failed to update submission");
      console.log(err);
      throw err;
    }
  };
  

  return {
    submission,
    loading,
    error,
    submit,
    update,
    hasSubmittedToday: !!submission,
  }
}
