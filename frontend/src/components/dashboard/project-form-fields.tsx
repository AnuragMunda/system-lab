// Shared form body for the New/Edit Project modals. Presentational and controlled:
// callers own the state and pass values + setters. `showStartFrom` toggles the
// "Start from" section (only on create); the edit modal hides it. The `idPrefix`
// keeps input ids unique across the many edit modals rendered per card.
"use client";

import type { ChangeEvent, Ref } from "react";
import { Sparkles } from "lucide-react";
import { AuthInput } from "@/components/auth/ui/auth-input";
import type { ProjectVisibility, Template } from "@/data/dashboard-data";

// How a project's first architecture is seeded (create only).
export type StartFrom = "empty" | "template" | "ai";

// Labelled textarea sharing the input styling used by AuthInput, reused for the
// project description and the AI system prompt.
export function TextArea({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-sm border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40"
      />
    </div>
  );
}

const VISIBILITY_OPTIONS: ProjectVisibility[] = ["private", "unlisted", "public"];
const START_FROM_OPTIONS: [StartFrom, string][] = [
  ["empty", "Empty architecture"],
  ["template", "Template"],
  ["ai", "AI generated architecture"],
];

export interface ProjectFormFieldsProps {
  idPrefix: string;
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  visibility: ProjectVisibility;
  onVisibilityChange: (value: ProjectVisibility) => void;
  showStartFrom: boolean;
  nameRef?: Ref<HTMLInputElement>;
  startFrom?: StartFrom;
  onStartFromChange?: (value: StartFrom) => void;
  templates?: Template[];
  templateId?: string;
  onTemplateIdChange?: (value: string) => void;
  systemDescription?: string;
  onSystemDescriptionChange?: (value: string) => void;
  onGenerate?: () => void;
}

export function ProjectFormFields({
  idPrefix,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  visibility,
  onVisibilityChange,
  showStartFrom,
  nameRef,
  startFrom = "empty",
  onStartFromChange,
  templates = [],
  templateId,
  onTemplateIdChange,
  systemDescription = "",
  onSystemDescriptionChange,
  onGenerate,
}: ProjectFormFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      <AuthInput
        label="Project name"
        name={`${idPrefix}-name`}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        ref={nameRef}
      />

      <TextArea
        label="Description"
        id={`${idPrefix}-description`}
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="What are you building?"
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-medium text-muted-foreground">
          Visibility
        </legend>
        {VISIBILITY_OPTIONS.map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-2 text-sm capitalize text-foreground"
          >
            <input
              type="radio"
              name={`${idPrefix}-visibility`}
              value={value}
              checked={visibility === value}
              onChange={() => onVisibilityChange(value)}
              className="size-4 accent-primary"
            />
            {value}
          </label>
        ))}
      </fieldset>

      {showStartFrom ? (
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-medium text-muted-foreground">
              Start from
            </legend>
            {START_FROM_OPTIONS.map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="radio"
                  name={`${idPrefix}-startFrom`}
                  value={value}
                  checked={startFrom === value}
                  onChange={() => onStartFromChange?.(value)}
                  className="size-4 accent-primary"
                />
                {label}
              </label>
            ))}
          </fieldset>

          {startFrom === "template" ? (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={`${idPrefix}-template`}
                className="text-xs font-medium text-muted-foreground"
              >
                Template
              </label>
              <select
                id={`${idPrefix}-template`}
                value={templateId}
                onChange={(event) => onTemplateIdChange?.(event.target.value)}
                className="h-10 w-full rounded-sm border border-border bg-muted px-3 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {startFrom === "ai" ? (
            <div className="flex flex-col gap-3">
              <TextArea
                label="Describe your system"
                id={`${idPrefix}-system-description`}
                value={systemDescription}
                onChange={(event) => onSystemDescriptionChange?.(event.target.value)}
                placeholder="I want to build a scalable video streaming platform..."
                rows={4}
              />
              <button
                type="button"
                disabled={!systemDescription.trim()}
                onClick={onGenerate}
                className="flex items-center justify-center gap-2 cursor-pointer rounded-sm border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                Generate Architecture
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
