"use client";
import { FileText, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const MAX_RESUME_MB = 10;

export default function TutorResumeSection({
  resumeFile,
  setResumeFile,
  resumeUrl,
  disabled = false, // ✅ new prop
}: {
  resumeFile: File | null;
  setResumeFile: (f: File | null) => void;
  resumeUrl?: string | null;
  disabled?: boolean;
}) {
  const onPickResume = (f: File) => {
    if (disabled) return; // 🚫 Prevent uploads when not in edit mode
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_RESUME_MB) return alert(`Max ${MAX_RESUME_MB}MB allowed`);
    setResumeFile(f);
  };

  // ✅ choose source priority
  const resumeName = resumeFile
    ? resumeFile.name
    : resumeUrl
    ? resumeUrl.split("/").pop()
    : null;

  return (
    <section
      className={`bg-white rounded-2xl shadow p-8 transition ${
        disabled ? "opacity-80 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-primary w-5 h-5" />
        <h2 className="text-xl font-semibold">Resume (Optional)</h2>
      </div>

      <Label>Upload Resume (PDF/DOC, up to {MAX_RESUME_MB}MB)</Label>
      <div
        className={`mt-2 flex items-center gap-3 border border-dashed rounded-lg px-4 py-6 transition ${
          disabled
            ? "opacity-70 cursor-not-allowed bg-gray-50"
            : "cursor-pointer hover:bg-gray-50"
        }`}
        onClick={() =>
          !disabled && document.getElementById("resumeUpload")?.click()
        }
      >
        <FileText className="text-primary w-5 h-5" />
        <span className="text-sm text-gray-700">
          {resumeName ? resumeName : "Click to upload or drag your resume"}
        </span>
      </div>

      {!disabled && (
        <input
          id="resumeUpload"
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && onPickResume(e.target.files[0])
          }
        />
      )}

      {(resumeFile || resumeUrl) && (
        <div className="mt-4 flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            <FileText className="text-primary w-5 h-5" />
            {resumeUrl && !resumeFile ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View / Download Resume
              </a>
            ) : (
              <span className="text-sm">{resumeFile?.name}</span>
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => setResumeFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
