"use client";

import { useLocale } from "@/lib/use-locale";
import { ExperimentLanding } from "@/components/ExperimentLanding";

export default function HabitAssistantExperimentPage() {
  const { t } = useLocale();

  return (
    <ExperimentLanding
      emoji="📈"
      title={t.experiments.items["habit-assistant"].title}
      description={t.experiments.items["habit-assistant"].description}
    />
  );
}
