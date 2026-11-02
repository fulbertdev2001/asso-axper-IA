'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '../../components/OnboardingFlow';
import { useAssoExpert } from '../../context/AssoExpertProvider';

export default function OnboardingRoutePage() {
  const router = useRouter();
  const { plans, handleCompleteOnboarding } = useAssoExpert();

  return (
    <OnboardingFlow
      plans={plans}
      onCompleteOnboarding={(newOrg, selectedPlanCode) => {
        handleCompleteOnboarding(newOrg, selectedPlanCode);
        router.push('/app');
      }}
      onCancel={() => {
        router.push('/');
      }}
    />
  );
}

