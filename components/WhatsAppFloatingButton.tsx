"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "whatsapp-button-position";
const BUTTON_SIZE = 56;
const EDGE_PADDING = 16;

type Position = {
  x: number;
  y: number;
};

function getDefaultPosition() {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }

  return {
    x: window.innerWidth - BUTTON_SIZE - 20,
    y: window.innerHeight - BUTTON_SIZE - 20,
  };
}

function clampPosition(position: Position) {
  if (typeof window === "undefined") return position;

  return {
    x: Math.min(
      Math.max(EDGE_PADDING, position.x),
      window.innerWidth - BUTTON_SIZE - EDGE_PADDING,
    ),
    y: Math.min(
      Math.max(EDGE_PADDING, position.y),
      window.innerHeight - BUTTON_SIZE - EDGE_PADDING,
    ),
  };
}

export default function WhatsAppFloatingButton() {
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({
    pointerId: 0,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setPosition(clampPosition(JSON.parse(saved)));
        return;
      } catch {}
    }

    setPosition(getDefaultPosition());
  }, []);

  useEffect(() => {
    if (!position) return;

    const handleResize = () => {
      setPosition((current) => {
        if (!current) return current;
        const next = clampPosition(current);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position]);

  const handlePointerDown = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!position) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!isDragging || event.pointerId !== dragStateRef.current.pointerId) {
      return;
    }

    const dx = event.clientX - dragStateRef.current.startX;
    const dy = event.clientY - dragStateRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragStateRef.current.moved = true;
    }

    setPosition(
      clampPosition({
        x: dragStateRef.current.originX + dx,
        y: dragStateRef.current.originY + dy,
      }),
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!isDragging || event.pointerId !== dragStateRef.current.pointerId) {
      return;
    }

    setIsDragging(false);
    setPosition((current) => {
      if (!current) return current;
      const next = clampPosition(current);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (dragStateRef.current.moved) {
      event.preventDefault();
      dragStateRef.current.moved = false;
    }
  };

  if (!position) return null;

  return (
    <a
      href="https://wa.me/918755313291"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      className="fixed z-50 inline-flex h-14 w-14 touch-none select-none items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/10 transition hover:bg-[#1ebe5d] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="currentColor"
      >
        <path d="M16.02 3.2c-7.05 0-12.78 5.67-12.78 12.64 0 2.23.6 4.42 1.73 6.34L3.12 28.8l6.82-1.78a12.9 12.9 0 0 0 6.08 1.54c7.05 0 12.78-5.67 12.78-12.64S23.07 3.2 16.02 3.2Zm0 22.98c-1.94 0-3.84-.52-5.5-1.5l-.4-.24-4.04 1.06 1.08-3.88-.26-.4a10.14 10.14 0 0 1-1.58-5.38c0-5.65 4.8-10.26 10.7-10.26s10.7 4.6 10.7 10.26-4.8 10.34-10.7 10.34Zm5.88-7.7c-.32-.16-1.9-.93-2.2-1.04-.3-.1-.52-.16-.74.16-.22.32-.84 1.04-1.04 1.26-.2.22-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.85-1.6-1.9-1.8-2.22-.18-.32-.02-.5.14-.66.14-.14.32-.38.48-.56.16-.2.22-.32.32-.54.1-.22.06-.4-.02-.56-.08-.16-.74-1.78-1.02-2.44-.26-.64-.54-.56-.74-.56h-.62c-.22 0-.56.08-.86.4-.3.32-1.14 1.1-1.14 2.68s1.16 3.12 1.32 3.34c.16.22 2.28 3.44 5.52 4.82.78.34 1.38.54 1.86.7.78.24 1.48.2 2.04.12.62-.1 1.9-.76 2.16-1.5.26-.74.26-1.38.18-1.5-.08-.14-.3-.22-.62-.38Z" />
      </svg>
    </a>
  );
}
