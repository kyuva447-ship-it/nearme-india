import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-6">
      <h2 className="text-4xl font-black text-slate-900 mb-4">404 - Page Not Found</h2>
      <p className="text-lg text-slate-600 mb-8 max-w-md">Could not find requested resource. The page might have been removed, had its name changed, or is temporarily unavailable.</p>
      <Link href="/" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-emerald-600/30">
        Return Home
      </Link>
    </div>
  )
}
