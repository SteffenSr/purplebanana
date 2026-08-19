"use client";

import { useLocale } from "@/lib/use-locale";
import { ExperimentLanding } from "@/components/ExperimentLanding";

export default function ChatbotExperimentPage() {
  const { t } = useLocale();

  return (
    <ExperimentLanding
      emoji="💬"
      title={t.experiments.items.chatbot.title}
      description={t.experiments.items.chatbot.description}
    />
  );
}
