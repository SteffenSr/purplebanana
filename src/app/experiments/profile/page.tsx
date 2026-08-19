"use client";

import { useLocale } from "@/lib/use-locale";
import { ExperimentLanding } from "@/components/ExperimentLanding";

export default function ProfileExperimentPage() {
  const { t } = useLocale();

  return (
    <ExperimentLanding
      emoji="👤"
      title={t.experiments.items.profile.title}
      description={t.experiments.items.profile.description}
    />
  );
}
