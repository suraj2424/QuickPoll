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

const DURATION_PRESETS: {
  label: string;
  value: DurationPresetValue;
  helper?: string;
}[] = [
  { label: "No expiry", value: null, helper: "Close manually" },
  { label: "15 min", value: 15 },
  { label: "1 hour", value: 60 },
  { label: "24 hours", value: 60 * 24 },
  { label: "Custom", value: "custom" },
];

const DURATION_UNITS = [
  { label: "Minutes", value: "minutes", multiplier: 1 },
  { label: "Hours", value: "hours", multiplier: 60 },
  { label: "Days", value: "days", multiplier: 60 * 24 },
] as const;

type DurationUnit = (typeof DURATION_UNITS)[number]["value"];

export function PollForm({ onSubmit, isSubmitting, disabled }: PollFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<DurationPresetValue>(60 * 24);
  const [customValue, setCustomValue] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<DurationUnit>("hours");

  const isDisabled = disabled || isSubmitting;

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    const validOptions = options.filter((opt) => opt.trim()).length;
    if (validOptions < MIN_OPTIONS) return false;
    if (duration === "custom" && (!customValue || customValue <= 0)) return false;
    return true;
  }, [customValue, duration, options, title]);

  const durationMinutes = useMemo(() => {
    if (duration === null) return null;
    if (typeof duration === "number") return duration;
    if (duration === "custom" && customValue > 0) {
      const unit = DURATION_UNITS.find((u) => u.value === customUnit);
      return Math.round(customValue * (unit?.multiplier ?? 1));
    }
    return null;
  }, [customUnit, customValue, duration]);

  const handleOptionChange = useCallback((index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }, []);

  const handleAddOption = useCallback(() => {
    setOptions((prev) => (prev.length < MAX_OPTIONS ? [...prev, ""] : prev));
  }, []);

  const handleRemoveOption = useCallback((index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setOptions(["", ""]);
    setTouched(false);
    setError(null);
    setDuration(60 * 24);
    setCustomValue(1);
    setCustomUnit("hours");
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setTouched(true);
      setError(null);

      const validOptions = options.map((o) => o.trim()).filter(Boolean);
      if (!title.trim() || validOptions.length < MIN_OPTIONS) {
        setError(`Please provide a title and at least ${MIN_OPTIONS} options.`);
        return;
      }

      if (duration === "custom" && (!customValue || customValue <= 0)) {
        setError("Please enter a valid duration.");
        return;
      }

      try {
        await onSubmit({
          title: title.trim(),
          description: description.trim() || undefined,
          options: validOptions,
          duration_minutes: durationMinutes,
        });
        resetForm();
      } catch {
        setError("Failed to create poll. Please try again.");
      }
    },
    [customValue, description, duration, durationMinutes, onSubmit, options, resetForm, title]
  );

  const showValidationError = touched && !canSubmit;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Create a Poll
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Add a question and {MIN_OPTIONS}-{MAX_OPTIONS} options.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="poll-title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </label>
        <input
          id="poll-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isDisabled}
          className={cn(
            "w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800",
            "border border-zinc-200 dark:border-zinc-700",
            "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400",
            "focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          placeholder="What should we ask?"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="poll-description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="poll-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isDisabled}
          className={cn(
            "w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800",
            "border border-zinc-200 dark:border-zinc-700",
            "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400",
            "focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          placeholder="Add context or details"
          rows={2}
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Options</span>
          <button
            type="button"
            onClick={handleAddOption}
            disabled={isDisabled || options.length >= MAX_OPTIONS}
            className={cn(
              "text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            + Add
          </button>
        </div>

        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                disabled={isDisabled}
                className={cn(
                  "flex-1 px-3 py-2 text-sm bg-white dark:bg-zinc-800",
                  "border border-zinc-200 dark:border-zinc-700",
                  "text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400",
                  "focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                placeholder={`Option ${index + 1}`}
                required={index < MIN_OPTIONS}
              />
              {options.length > MIN_OPTIONS && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  disabled={isDisabled}
                  className="px-2 text-sm text-zinc-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Duration</span>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            When should this poll close?
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((preset) => {
            const isActive = duration === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                disabled={isDisabled}
                onClick={() => setDuration(preset.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {duration === "custom" && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Amount</label>
              <input
                type="number"
                min={1}
                value={customValue}
                onChange={(e) => setCustomValue(Number(e.target.value) || 0)}
                disabled={isDisabled}
                className={cn(
                  "w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800",
                  "border border-zinc-200 dark:border-zinc-700",
                  "text-zinc-900 dark:text-zinc-100",
                  "focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              />
            </div>
            <div className="w-32">
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Unit</label>
              <select
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value as DurationUnit)}
                disabled={isDisabled}
                className={cn(
                  "w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800",
                  "border border-zinc-200 dark:border-zinc-700",
                  "text-zinc-900 dark:text-zinc-100",
                  "focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {DURATION_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {(error || showValidationError) && (
        <div className="p-3 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error || `Please provide at least ${MIN_OPTIONS} options.`}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={resetForm}
          disabled={isDisabled}
          className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={!canSubmit || isDisabled}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            "bg-zinc-900 text-white hover:bg-zinc-800",
            "dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
            (!canSubmit || isDisabled) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Publishing..." : "Publish poll"}
        </button>
      </div>
    </form>
  );
}