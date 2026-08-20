"use client";

import { useLocale } from "@/lib/use-locale";
import { ExperimentLanding } from "@/components/ExperimentLanding";

export default function LoginExperimentPage() {
  const { t } = useLocale();

  return (
    <ExperimentLanding
      emoji="🔐"
      title={t.experiments.items.login.title}
      description={t.experiments.items.login.description}
    />
  );
}
