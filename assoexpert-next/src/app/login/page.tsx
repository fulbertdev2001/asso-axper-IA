'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoginPage } from '../../components/LoginPage';
import { useAssoExpert } from '../../context/AssoExpertProvider';

export default function LoginRoutePage() {
  const router = useRouter();
  const { organizations, setCurrentOrgId, handleUpdateOrg } = useAssoExpert();

  return (
    <LoginPage
      organizations={organizations}
      onLoginAsOrg={(org) => {
        handleUpdateOrg(org);
        setCurrentOrgId(org.id);
        router.push('/app');
      }}
      onLoginAsAdmin={() => {
        router.push('/admin');
      }}
      onStartOnboarding={() => {
        router.push('/onboarding');
      }}
      onBackToPublic={() => {
        router.push('/');
      }}
    />
  );
}

