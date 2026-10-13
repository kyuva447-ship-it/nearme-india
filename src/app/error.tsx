'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
      <h2 className="text-4xl font-black text-slate-900 mb-4">500 - Something went wrong!</h2>
      <p className="text-lg text-slate-600 mb-8 max-w-md">An unexpected error occurred. Our team has been notified.</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg"
        >
          Try again
        </button>
        <Link href="/" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-emerald-600/30">
          Return Home
        </Link>
      </div>
    </div>
  )
}
