"use client"
import { Navbar } from '@/components/Navbar'
import React from 'react'
import { useSearchParams } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const userName = searchParams.get('name') || 'Guest';
  const userLastName = searchParams.get('lastName') || '';
  const userId = searchParams.get('userId') || '';

  return (
    <div>
      <Navbar userName={userName} userLastName={userLastName} userId={userId}>
        {children}
      </Navbar>
    </div>
  )
}
