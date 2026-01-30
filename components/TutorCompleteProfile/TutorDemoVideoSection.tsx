"use client";
import { PlayCircle, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const MAX_VIDEO_MB = 200;

export default function TutorDemoVideoSection({
  demoVideoFile,
  setDemoVideoFile,
  demoVideoUrl,
  disabled = false, // âœ… new prop
}: {
  demoVideoFile: File | null;
  setDemoVideoFile: (f: File | null) => void;
  demoVideoUrl?: string | null;
  disabled?: boolean;
}) {
  const onPickDemoVideo = (f: File) => {
    if (disabled) return; // ðŸš« Prevent uploads when not in edit mode
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_MB) return alert(`Max ${MAX_VIDEO_MB}MB allowed`);
    setDemoVideoFile(f);
  };

  // âœ… choose preview priority: local file > API URL
  const videoSrc = demoVideoFile
    ? URL.createObjectURL(demoVideoFile)
    : demoVideoUrl || null;

  return (
    <section
      className={`bg-white rounded-2xl shadow p-8 transition ${
        disabled ? "opacity-80 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <PlayCircle className="text-primary w-5 h-5" />
        <h2 className="text-xl font-semibold">Demo / Introduction Video(Optional)</h2>
      </div>

      <Label>Upload Demo Video (MP4/WebM, up to {MAX_VIDEO_MB}MB)</Label>
      <div
        className={`mt-2 flex items-center gap-3 border border-dashed rounded-lg px-4 py-6 transition ${
          disabled
            ? "opacity-70 cursor-not-allowed bg-gray-50"
            : "cursor-pointer hover:bg-gray-50"
        }`}
        onClick={() =>
          !disabled && document.getElementById("demoVideoUpload")?.click()
        }
      >
        <PlayCircle className="text-primary w-5 h-5" />
        <span className="text-sm text-gray-700">
          {demoVideoFile
            ? demoVideoFile.name
            : demoVideoUrl
            ? "Current video uploaded"
            : "Click to upload or drag your video"}
        </span>
      </div>

      {!disabled && (
        <input
          id="demoVideoUpload"
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && onPickDemoVideo(e.target.files[0])
          }
        />
      )}

      {videoSrc && (
        <div className="mt-4 relative">
          <video
            controls
            className="w-full max-h-[420px] rounded-lg border"
            src={videoSrc}
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => setDemoVideoFile(null)}
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      )}

    </section>
  );
}

