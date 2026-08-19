"use client";

import { useLocale } from "@/lib/use-locale";
import { ExperimentLanding } from "@/components/ExperimentLanding";

export default function OnboardingExperimentPage() {
  const { t } = useLocale();

  return (
    <ExperimentLanding
      emoji="👋"
      title={t.experiments.items.onboarding.title}
      description={t.experiments.items.onboarding.description}
    />
  );
}
