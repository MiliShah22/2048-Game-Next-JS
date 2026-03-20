'use client';

import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'

interface ClientLayoutProps {
    children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <ThemeProvider>
            <>
                <div className="min-h-screen bg-background text-foreground font-sans antialiased">
                    {children}
                </div>
                <Analytics />
            </>
        </ThemeProvider>
    )
}

