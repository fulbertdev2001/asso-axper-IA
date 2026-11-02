'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLandingView } from '../../components/PublicLandingView';
import { useAssoExpert } from '../../context/AssoExpertProvider';
import { track } from '../../lib/analytics/track';

export default function PublicHomePage() {
  const router = useRouter();
  const { plans, currentOrg } = useAssoExpert();

  useEffect(() => {
    track('landing_view', { path: '/' });
  }, []);

  return (
    <PublicLandingView
      plans={plans}
      currentOrg={currentOrg}
      onOpenLogin={() => {
        track('seo_cta_click', { target: 'login' });
        router.push('/login');
      }}
      onStartOnboarding={(preferredPlan) => {
        track('signup_start', { preferredPlan: preferredPlan || 'pro' });
        router.push('/onboarding');
      }}
    />
  );
}

