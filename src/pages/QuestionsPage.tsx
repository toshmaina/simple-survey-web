import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuestions } from "../hooks/useQuestions";
import { getSurvey } from "../api/surveys";
import type { Question, QuestionType, QuestionOption } from "../types/survey";
import {
  Button,
  Modal,
  Input,
  Textarea,
  Select,
  EmptyState,
  ErrorMessage,
  ConfirmDialog,
  Spinner,
  Badge,
} from "../components/ui";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "short_text", label: "Short Text" },
  { value: "long_text", label: "Long Text" },
  { value: "email", label: "Email" },
  { value: "choice", label: "Choice (single or multiple)" },
  { value: "file", label: "File Upload" },
];

const TYPE_BADGE: Record<
  QuestionType,
  { label: string; variant: "blue" | "gray" | "green" }
> = {
  short_text: { label: "Short text", variant: "gray" },
  long_text: { label: "Long text", variant: "gray" },
  email: { label: "Email", variant: "blue" },
  choice: { label: "Choice", variant: "green" },
  file: { label: "File upload", variant: "blue" },
};

interface QuestionForm {
  name: string;
  type: QuestionType;
  required: boolean;
  text: string;
  description: string;
  // choice
  optionsMultiple: boolean;
  options: QuestionOption[];
  // file
  fileFormat: string;
  fileMaxSize: number;
  fileMaxSizeUnit: string;
  fileMultiple: boolean;
}

const DEFAULT_FORM: QuestionForm = {
  name: "",
  type: "short_text",
  required: true,
  text: "",
  description: "",
  optionsMultiple: false,
  options: [{ value: "", label: "" }],
  fileFormat: ".pdf",
  fileMaxSize: 1,
  fileMaxSizeUnit: "mb",
  fileMultiple: false,
};

export function QuestionsPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const id = Number(surveyId);
  const navigate = useNavigate();

  const [surveyName, setSurveyName] = useState("");
  const {
    questions,
    loading,
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useQuestions(id);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [form, setForm] = useState<QuestionForm>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof QuestionForm, string>>
  >({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchQuestions();
    getSurvey(id)
      .then((s) => setSurveyName(s.name))
      .catch(() => {});
  }, [fetchQuestions, id]);

  const openCreate = () => {
    setEditingQ(null);
    setForm(DEFAULT_FORM);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditingQ(q);
    setForm({
      name: q.name,
      type: q.type,
      required: q.required,
      text: q.text,
      description: q.description ?? "",
      optionsMultiple: q.options?.multiple ?? false,
      options: q.options?.items.length
        ? q.options.items
        : [{ value: "", label: "" }],
      fileFormat: q.fileProperties?.format ?? ".pdf",
      fileMaxSize: q.fileProperties?.maxFileSize ?? 1,
      fileMaxSizeUnit: q.fileProperties?.maxFileSizeUnit ?? "mb",
      fileMultiple: q.fileProperties?.multiple ?? false,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const setField = <K extends keyof QuestionForm>(
    key: K,
    value: QuestionForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setOption = (i: number, field: "value" | "label", val: string) => {
    setForm((prev) => {
      const opts = [...prev.options];
      opts[i] = { ...opts[i], [field]: val };
      return { ...prev, options: opts };
    });
  };

  const addOption = () =>
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { value: "", label: "" }],
    }));
  const removeOption = (i: number) =>
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== i),
    }));

  const validate = (): boolean => {
    const errs: typeof formErrors = {};
    if (!form.name.trim()) errs.name = "Field name is required.";
    if (!form.text.trim()) errs.text = "Question text is required.";
    if (form.type === "choice") {
      const valid = form.options.every((o) => o.value.trim() && o.label.trim());
      if (!valid || form.options.length === 0)
        errs.options = "All options must have a value and label.";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        required: form.required,
        text: form.text.trim(),
        description: form.description.trim() || undefined,
        options:
          form.type === "choice"
            ? { multiple: form.optionsMultiple, items: form.options }
            : undefined,
        fileProperties:
          form.type === "file"
            ? {
                format: form.fileFormat,
                maxFileSize: form.fileMaxSize,
                maxFileSizeUnit: form.fileMaxSizeUnit,
                multiple: form.fileMultiple,
              }
            : undefined,
      };

      if (editingQ) {
        await updateQuestion(editingQ.id, payload);
      } else {
        await createQuestion(payload);
      }
      setModalOpen(false);
    } catch {
      setFormErrors({ text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteQuestion(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate("/surveys")}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Surveys
      </button>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {surveyName || "Questions"}
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Manage questions for this survey.
          </p>
        </div>
        <Button onClick={openCreate}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add question
        </Button>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size={28} />
        </div>
      )}
      {!loading && error && (
        <ErrorMessage message={error} onRetry={fetchQuestions} />
      )}
      {!loading && !error && questions.length === 0 && (
        <EmptyState
          title="No questions yet"
          description="Add questions to start building this survey."
          action={<Button onClick={openCreate}>Add question</Button>}
        />
      )}

      {!loading && !error && questions.length > 0 && (
        <div className="flex flex-col gap-3">
          {questions.map((q, idx) => {
            const tb = TYPE_BADGE[q.type];
            return (
              <div
                key={q.id}
                className="group flex items-start gap-4 p-5 rounded-xl border border-border hover:border-gray-300 hover:shadow-sm transition-all bg-white"
              >
                <span className="mt-0.5 w-7 h-7 rounded-md bg-surface flex items-center justify-center text-xs font-mono text-muted flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-ink text-sm">{q.text}</p>
                    <Badge label={tb?.label} variant={tb?.variant} />
                    {q.required && <Badge label="Required" variant="red" />}
                  </div>
                  {q.description && (
                    <p className="text-xs text-muted mt-0.5">{q.description}</p>
                  )}
                  {q.options && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {q.options.items.map((o) => (
                        <span
                          key={o.value}
                          className="text-xs bg-surface text-muted px-2 py-0.5 rounded font-mono"
                        >
                          {o.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {q.fileProperties && (
                    <p className="text-xs text-muted mt-1">
                      {q.fileProperties.format} · max{" "}
                      {q.fileProperties.maxFileSize}
                      {q.fileProperties.maxFileSizeUnit}
                      {q.fileProperties.multiple ? " · multiple files" : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(q)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(q)}
                    className="text-danger hover:bg-danger-light hover:text-danger"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {questions.length > 0 && (
        <p className="text-xs text-muted mt-6">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Question modal */}
      <Modal
        title={editingQ ? "Edit question" : "New question"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        width="max-w-2xl"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingQ ? "Save changes" : "Add question"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Field name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              error={formErrors.name}
              placeholder="e.g. full_name"
            />
            <Select
              label="Question type"
              value={form.type}
              onChange={(e) => setField("type", e.target.value as QuestionType)}
              options={QUESTION_TYPES}
            />
          </div>

          <Input
            label="Question text"
            value={form.text}
            onChange={(e) => setField("text", e.target.value)}
            error={formErrors.text}
            placeholder="e.g. What is your full name?"
          />

          <Textarea
            label="Description / hint"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Optional helper text shown below the question"
          />

          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setField("required", e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            Required question
          </label>

          {/* Choice-specific */}
          {form.type === "choice" && (
            <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">Options</p>
                <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.optionsMultiple}
                    onChange={(e) =>
                      setField("optionsMultiple", e.target.checked)
                    }
                    className="w-4 h-4 accent-accent"
                  />
                  Allow multiple selections
                </label>
              </div>
              {formErrors.options && (
                <p className="text-xs text-danger">{formErrors.options}</p>
              )}
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Value (e.g. REACT)"
                    value={opt.value}
                    onChange={(e) => setOption(i, "value", e.target.value)}
                    className="font-mono text-xs flex-1"
                  />
                  <Input
                    placeholder="Label (e.g. React JS)"
                    value={opt.label}
                    onChange={(e) => setOption(i, "label", e.target.value)}
                    className="flex-1"
                  />
                  {form.options.length > 1 && (
                    <button
                      onClick={() => removeOption(i)}
                      className="text-muted hover:text-danger p-1 flex-shrink-0"
                      aria-label="Remove option"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={addOption}
                className="self-start"
              >
                + Add option
              </Button>
            </div>
          )}

          {/* File-specific */}
          {form.type === "file" && (
            <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-ink">File properties</p>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Accepted format"
                  value={form.fileFormat}
                  onChange={(e) => setField("fileFormat", e.target.value)}
                  placeholder=".pdf"
                />
                <Input
                  label="Max size"
                  type="number"
                  min={1}
                  value={form.fileMaxSize}
                  onChange={(e) =>
                    setField("fileMaxSize", Number(e.target.value))
                  }
                />
                <Select
                  label="Unit"
                  value={form.fileMaxSizeUnit}
                  onChange={(e) => setField("fileMaxSizeUnit", e.target.value)}
                  options={[
                    { value: "kb", label: "KB" },
                    { value: "mb", label: "MB" },
                  ]}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.fileMultiple}
                  onChange={(e) => setField("fileMultiple", e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
                Allow multiple file uploads
              </label>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete question"
        message={`"${deleteTarget?.text}" will be permanently removed from this survey.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
