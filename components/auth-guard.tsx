"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, loading, signInWithGoogle, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center flex items-center flex-col">
            <Image className="rounded-2xl" src="/logo.png" width={100} height={100} alt="logo" />
            <CardTitle className="text-2xl font-bold text-primary">YIM Tarbiyat</CardTitle>
            <CardDescription>Track your daily spiritual journey with the community</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={signInWithGoogle} className="w-full" size="lg">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
        <p className="mt-5 text-muted-foreground text-center">Designed and developed by <br />
          <Link className="hover:underline font-bold" href="https://chatpoka.com" target="_blank">
            Chatpoka Technologies
          </Link>
        </p>
      </div>
    )
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-destructive">Access Denied</CardTitle>
            <CardDescription>You need admin privileges to access this page.</CardDescription>
            <Button asChild><Link href={'/'}>Go Back</Link></Button>
          </CardHeader>
        </Card>
        <p className="mt-5 text-muted-foreground text-center opacity-50">Designed and developed by<br />
          <Link className="hover:underline font-bold" href="https://chatpoka.com" target="_blank">
            Chatpoka Technologies
          </Link>
        </p>
      </div>
    )
  }

  return <>{children}</>
}
