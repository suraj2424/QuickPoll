"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import { PollCreatePayload } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PollFormProps {
  onSubmit: (payload: PollCreatePayload) => Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

type DurationPresetValue = number | "custom" | null;

const SMART_DURATION_PRESETS: {
  label: string;
  value: DurationPresetValue;
  helper?: string;
}[] = [
    { label: "No expiry", value: null, helper: "Poll stays open until closed manually" },
    { label: "15 min", value: 15 },
    { label: "1 hour", value: 60 },
    { label: "24 hours", value: 60 * 24 },
    { label: "Custom", value: "custom" },
  ];

const CUSTOM_DURATION_UNITS = [
  { label: "Minutes", value: "minutes", multiplier: 1 },
  { label: "Hours", value: "hours", multiplier: 60 },
  { label: "Days", value: "days", multiplier: 60 * 24 },
] as const;

type CustomDurationUnit = (typeof CUSTOM_DURATION_UNITS)[number]["value"];

export function PollForm({ onSubmit, isSubmitting, disabled }: PollFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaultDurationPreset: DurationPresetValue = SMART_DURATION_PRESETS[3]?.value ?? null;
  const [durationPreset, setDurationPreset] = useState<DurationPresetValue>(defaultDurationPreset);
  const [customDurationValue, setCustomDurationValue] = useState<number>(1);
  const [customDurationUnit, setCustomDurationUnit] = useState<CustomDurationUnit>("hours");

  const isDisabled = disabled || isSubmitting;

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    const sanitizedOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (sanitizedOptions.length < MIN_OPTIONS) return false;
    if (durationPreset === "custom" && (!customDurationValue || customDurationValue <= 0)) return false;
    return true;
  }, [customDurationValue, durationPreset, options, title]);

  const handleOptionChange = useCallback((index: number, value: string) => {
    setOptions((prev) => prev.map((opt, idx) => (idx === index ? value : opt)));
  }, []);

  const handleAddOption = useCallback(() => {
    setOptions((prev) =>
      prev.length < MAX_OPTIONS ? [...prev, ""] : prev,
    );
  }, []);

  const handleRemoveOption = useCallback((index: number) => {
    setOptions((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const durationMinutes = useMemo(() => {
    if (durationPreset === null) return null;
    if (typeof durationPreset === "number") {
      return durationPreset > 0 ? durationPreset : null;
    }
    if (durationPreset === "custom") {
      if (!customDurationValue || customDurationValue <= 0) return null;
      const unit = CUSTOM_DURATION_UNITS.find((entry) => entry.value === customDurationUnit) ?? CUSTOM_DURATION_UNITS[0];
      return Math.round(customDurationValue * unit.multiplier);
    }
    return null;
  }, [customDurationUnit, customDurationValue, durationPreset]);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setOptions(["", ""]);
    setTouched(false);
    setError(null);
    setDurationPreset(defaultDurationPreset);
    setCustomDurationValue(1);
    setCustomDurationUnit("hours");
  }, [defaultDurationPreset]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setTouched(true);
      setError(null);

      const sanitizedOptions = options.map((opt) => opt.trim()).filter(Boolean);
      if (!title.trim() || sanitizedOptions.length < MIN_OPTIONS) {
        setError(
          `Please provide a title and at least ${MIN_OPTIONS} options with text.`,
        );
        return;
      }

      if (durationPreset === "custom" && (!customDurationValue || customDurationValue <= 0)) {
        setError("Please enter a valid custom duration greater than zero.");
        return;
      }

      try {
        const payload: PollCreatePayload = {
          title: title.trim(),
          description: description.trim() || undefined,
          options: sanitizedOptions,
          duration_minutes:
            durationPreset === null
              ? null
              : durationMinutes !== null
                ? durationMinutes
                : undefined,
        };

        await onSubmit(payload);
        resetForm();
      } catch (submissionError) {
        console.error("Poll creation failed", submissionError);
        setError("Failed to create poll. Please try again.");
      }
    }, [customDurationValue, description, durationMinutes, durationPreset, onSubmit, options, resetForm, title]);

  const showValidationError = touched && !canSubmit;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 p-6 shadow-sm transition"
    >
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Create a Poll
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Add a question and between {MIN_OPTIONS} and {MAX_OPTIONS} options.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="poll-title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </label>
        <input
          id="poll-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isDisabled}
          className="w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
          placeholder="What should we ask the community?"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="poll-description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description (optional)
        </label>
        <textarea
          id="poll-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isDisabled}
          className="w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
          placeholder="Add context or details"
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Options</span>
          <button
            type="button"
            onClick={handleAddOption}
            disabled={isDisabled || options.length >= MAX_OPTIONS}
            className={cn(
              "text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300",
              (isDisabled || options.length >= MAX_OPTIONS) &&
              "cursor-not-allowed opacity-50",
            )}
          >
            + Add option
          </button>
        </div>

        <div className="space-y-2">
          {options.map((option, index) => {
            const optionId = `poll-option-${index}`;
            return (
              <div key={optionId} className="flex gap-2">
                <input
                  id={optionId}
                  type="text"
                  value={option}
                  onChange={(event) =>
                    handleOptionChange(index, event.target.value)
                  }
                  disabled={isDisabled}
                  className="flex-1 rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                  placeholder={`Option ${index + 1}`}
                  required={index < MIN_OPTIONS}
                />
                {options.length > MIN_OPTIONS && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    disabled={isDisabled}
                    className="rounded-lg border border-transparent px-3 py-2 text-sm transition text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Auto-close</span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Choose how long this poll stays live. You can always close it manually sooner.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {SMART_DURATION_PRESETS.map((preset) => {
            const isActive = durationPreset === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                disabled={isDisabled}
                onClick={() => setDurationPreset(preset.value)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left text-sm transition",
                  "border-zinc-200 bg-white hover:border-indigo-200 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-950/50",
                  isActive && "border-indigo-300 bg-indigo-100 dark:border-indigo-500/70 dark:bg-indigo-500/10",
                  isDisabled && "cursor-not-allowed opacity-60",
                )}
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {preset.label}
                </span>
                {preset.helper && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {preset.helper}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {durationPreset === "custom" && (
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Amount</span>
              <input
                type="number"
                min={1}
                step={1}
                value={customDurationValue}
                disabled={isDisabled}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setCustomDurationValue(Number.isFinite(value) ? value : 0);
                }}
                className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Units</span>
              <select
                value={customDurationUnit}
                disabled={isDisabled}
                onChange={(event) => setCustomDurationUnit(event.target.value as CustomDurationUnit)}
                className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
              >
                {CUSTOM_DURATION_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      {(error || showValidationError) && (
        <p className="text-sm text-red-500">
          {error ||
            `Please provide at least ${MIN_OPTIONS} options with unique text.`}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={resetForm}
          disabled={isDisabled}
          className="rounded-lg border border-zinc-200 dark:border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={!canSubmit || isDisabled}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold text-white transition bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400",
            (!canSubmit || isDisabled) && "cursor-not-allowed opacity-50",
          )}
        >
          {isSubmitting ? "Publishing..." : "Publish poll"}
        </button>
      </div>
    </form>
  );
}
