"use client";

import { useState } from "react";
import { useLocale } from "@/lib/use-locale";

/**
 * Bottom-sheet editor for a personal note, optionally paired with a short
 * "amount" override (ingredients only — steps get just the note). Used from
 * both the recipe detail page (tap an ingredient/step) and cook mode (tap
 * the note area on the active step) so the two stay visually consistent.
 */
export function NoteSheet({
  title,
  showAmount = false,
  initialNote = "",
  initialAmount = "",
  onSave,
  onClose,
}: {
  title: string;
  showAmount?: boolean;
  initialNote?: string;
  initialAmount?: string;
  onSave: (data: { note: string; amount: string }) => void;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [note, setNote] = useState(initialNote);
  const [amount, setAmount] = useState(initialAmount);

  return (
    <div className="note-sheet-backdrop" onClick={onClose}>
      <div
        className="note-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="note-sheet__title">{title}</h2>

        {showAmount && (
          <label className="field">
            <span className="field-label">{t.notes.amountLabel}</span>
            <input
              className="text-input"
              type="text"
              inputMode="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t.notes.amountPlaceholder}
            />
          </label>
        )}

        <label className="field">
          <span className="field-label">{t.notes.noteLabel}</span>
          <textarea
            className="text-input text-input--area"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.notes.notePlaceholder}
            rows={4}
          />
        </label>

        <div className="note-sheet__actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t.notes.cancel}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onSave({ note, amount });
              onClose();
            }}
          >
            {t.notes.save}
          </button>
        </div>
      </div>
    </div>
  );
}
