'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AdminPayloadView } from '../../components/AdminPayloadView';
import { useAssoExpert } from '../../context/AssoExpertProvider';

export default function AdminRoutePage() {
  const router = useRouter();
  const { plans, setPlans, tickets, handleUpdateTicket, aiUsageRecords } = useAssoExpert();

  return (
    <AdminPayloadView
      plans={plans}
      onUpdatePlans={(updated) => setPlans(updated)}
      tickets={tickets}
      onUpdateTicket={handleUpdateTicket}
      aiUsageRecords={aiUsageRecords}
      onLogout={() => router.push('/login')}
    />
  );
}

