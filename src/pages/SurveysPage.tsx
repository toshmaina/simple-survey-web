import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurveys } from "../hooks/useSurveys";
import type { Survey } from "../types/survey";
import {
  Button,
  Modal,
  Input,
  Textarea,
  EmptyState,
  ErrorMessage,
  ConfirmDialog,
  Spinner,
} from "../components/ui";

type ModalMode = "create" | "edit" | null;

export function SurveysPage() {
  const navigate = useNavigate();
  const {
    surveys,
    loading,
    error,
    fetchSurveys,
    createSurvey,
    updateSurvey,
    deleteSurvey,
  } = useSurveys();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<Survey | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Survey | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormDesc("");
    setFormErrors({});
    setModalMode("create");
  };

  const openEdit = (s: Survey) => {
    setEditing(s);
    setFormName(s.name);
    setFormDesc(s.description);
    setFormErrors({});
    setModalMode("edit");
  };

  const closeModal = () => setModalMode(null);

  const validate = () => {
    const errs: { name?: string } = {};
    if (!formName.trim()) errs.name = "Survey name is required.";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (modalMode === "create") {
        await createSurvey({
          name: formName.trim(),
          description: formDesc.trim(),
        });
      } else if (editing) {
        await updateSurvey(editing.id, {
          name: formName.trim(),
          description: formDesc.trim(),
        });
      }
      closeModal();
    } catch {
      setFormErrors({ name: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSurvey(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-ink">Surveys</h1>
          <p className="text-sm text-muted mt-0.5">
            Create and manage all surveys.
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
          New survey
        </Button>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size={28} />
        </div>
      )}

      {!loading && error && (
        <ErrorMessage message={error} onRetry={fetchSurveys} />
      )}

      {!loading && !error && surveys.length === 0 && (
        <EmptyState
          title="No surveys yet"
          description="Create your first survey to start collecting responses."
          action={<Button onClick={openCreate}>Create survey</Button>}
        />
      )}

      {!loading && !error && surveys.length > 0 && (
        <div className="grid gap-3">
          {surveys.map((s) => (
            <div
              key={s.id}
              className="group flex items-start gap-4 p-5 rounded-xl border border-border hover:border-gray-300 hover:shadow-sm transition-all bg-white"
            >
              {/* ID pill */}
              <span className="mt-0.5 w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-xs font-mono font-medium text-muted flex-shrink-0">
                {s.id}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm">{s.name}</p>
                {s.description && (
                  <p className="text-sm text-muted mt-0.5 truncate">
                    {s.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/surveys/${s.id}/questions`)}
                  title="Manage questions"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Questions
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/surveys/${s.id}/responses`)}
                  title="View responses"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Responses
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(s)}
                  title="Edit survey"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(s)}
                  className="text-danger hover:bg-danger-light hover:text-danger"
                  title="Delete survey"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      {surveys.length > 0 && (
        <p className="text-xs text-muted mt-6">
          {surveys.length} survey{surveys.length !== 1 ? "s" : ""} total
        </p>
      )}

      {/* Create / Edit modal */}
      <Modal
        title={modalMode === "create" ? "New survey" : "Edit survey"}
        open={modalMode !== null}
        onClose={closeModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {modalMode === "create" ? "Create survey" : "Save changes"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Survey name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            error={formErrors.name}
            placeholder="e.g. Graduate Developer Application Survey"
            autoFocus
          />
          <Textarea
            label="Description"
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            placeholder="Brief description of this survey (optional)"
          />
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete survey"
        message={`"${deleteTarget?.name}" and all its questions and responses will be permanently deleted. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
