import { Suspense } from 'react'
import OnboardingWizard from './OnboardingWizard'

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDF6EE]" />}>
      <OnboardingWizard />
    </Suspense>
  )
}
