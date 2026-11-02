'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ClientAppLayout } from '../../components/ClientAppLayout';
import { useAssoExpert } from '../../context/AssoExpertProvider';

export default function ClientWorkspacePage() {
  const router = useRouter();
  const {
    currentOrg,
    handleUpdateOrg,
    currentPlan,
    plans,
    currentSubscription,
    handleUpdateSubscription,
    handleSelectPlan,
    tickets,
    handleAddTicket,
    handleUpdateTicket,
    handleTrackAiUsage,
    prefillEscalation,
    setPrefillEscalation
  } = useAssoExpert();

  return (
    <ClientAppLayout
      currentOrg={currentOrg}
      onUpdateOrg={handleUpdateOrg}
      currentPlan={currentPlan}
      plans={plans}
      subscription={currentSubscription}
      onUpdateSubscription={handleUpdateSubscription}
      onSelectPlan={handleSelectPlan}
      tickets={tickets}
      onAddTicket={handleAddTicket}
      onUpdateTicket={handleUpdateTicket}
      onTrackAiUsage={handleTrackAiUsage}
      onLogoutToPublic={() => router.push('/login')}
      prefillEscalation={prefillEscalation}
      onClearPrefillEscalation={() => setPrefillEscalation(null)}
    />
  );
}

