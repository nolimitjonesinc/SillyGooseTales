import { Suspense } from 'react'
import MoodSetContent from './MoodSetContent'

export default function MoodSetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDF6EE]" />}>
      <MoodSetContent />
    </Suspense>
  )
}
