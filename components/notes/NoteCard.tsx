"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type NoteCardProps = {
  note: any;
  onPreview: (note: any) => void;
  onEdit?: (note: any) => void;
  onDelete: (note: any) => void;
  purchaseCount?: number;
};

export default function NoteCard({
  note,
  onPreview,
  onEdit,
  onDelete,
  purchaseCount,
}: NoteCardProps) {
  return (
    <Card className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-xl shadow-sm border">
      {/* LEFT: tiny PDF preview like product thumb */}
      <div className="w-16 md:w-20 flex-shrink-0">
        <div className="border rounded-lg overflow-hidden bg-gray-50 h-14 md:h-16">
          {note.pdfUrl ? (
            <iframe
              src={note.pdfUrl}
              className="w-full h-full"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-gray-500">
              <span>No PDF</span>
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE: details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm md:text-base truncate">
            {note.title}
          </h3>
          {/* Price (small, here but repeated on right as main price) */}
          <span className="md:hidden text-xs font-semibold text-gray-800">
            ₹{Number(note.price || 0)}
          </span>
        </div>

        <div className="text-[11px] md:text-xs text-muted-foreground mb-1 truncate">
          {note.subject} • {note.classLevel} • {note.board}
        </div>
        {typeof purchaseCount === "number" && purchaseCount > 0 && (
          <div className="text-[10px] text-gray-600">
            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">
              {purchaseCount} purchase{purchaseCount === 1 ? "" : "s"}
            </span>
          </div>
        )}

      </div>

      {/* RIGHT: price + actions (compact) */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="hidden md:block text-right">
          <div className="text-[11px] text-gray-500 uppercase tracking-wide">
            Price
          </div>
          <div className="text-sm md:text-base font-semibold text-gray-900">
            ₹{Number(note.price || 0)}
          </div>
        </div>

        <div className="flex gap-1 md:gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs px-3"
            onClick={() => onPreview(note)}
          >
            Preview
          </Button>
          {onEdit && (
            <Button
              size="sm"
              variant="secondary"
              className="text-xs px-3"
              onClick={() => onEdit(note)}
            >
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            className="text-xs px-3"
            onClick={() => onDelete(note)}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
