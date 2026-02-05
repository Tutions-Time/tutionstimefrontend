'use client';

import type { ReactNode } from 'react';

import type { ToastMeta } from '@/hooks/use-toast';

const metaRouteKeys = ['route', 'href', 'path', 'link'] as const;

function normalizeText(value?: ReactNode) {
  if (typeof value === 'string') return value.toLowerCase();
  if (typeof value === 'number') return value.toString();
  return '';
}

function hasMetaValue(meta?: ToastMeta, key?: string) {
  if (!meta || !key) return false;
  const value = meta[key];
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return Boolean(value);
}

function getMetaRoute(meta?: ToastMeta) {
  if (!meta) return undefined;
  for (const key of metaRouteKeys) {
    const value = meta[key as keyof ToastMeta];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

export type NotificationRouteContext = {
  role?: string | null;
  meta?: ToastMeta;
  title?: ReactNode;
  description?: ReactNode;
  explicitRoute?: string;
};

export function deriveNotificationRoute(context: NotificationRouteContext) {
  const { role, meta, title, description, explicitRoute } = context;

  if (explicitRoute) return explicitRoute;
  const candidateFromMeta = getMetaRoute(meta);
  if (candidateFromMeta) return candidateFromMeta;

  if (!meta || Object.keys(meta).length === 0) {
    return undefined;
  }

  const text = normalizeText(title) + normalizeText(description);
  const isTutor = role === 'tutor';
  const isAdmin = role === 'admin';

  if (isAdmin) {
    if (hasMetaValue(meta, 'refundRequestId') || text.includes('refund')) {
      return '/dashboard/admin/refunds';
    }
    if (
      hasMetaValue(meta, 'paymentId') ||
      hasMetaValue(meta, 'noteId') ||
      text.includes('payment')
    ) {
      return '/dashboard/admin/transactions';
    }
    if (
      hasMetaValue(meta, 'sessionId') ||
      hasMetaValue(meta, 'bookingId') ||
      text.includes('session')
    ) {
      return '/dashboard/admin/sessions';
    }
    if (
      hasMetaValue(meta, 'groupBatchId') ||
      hasMetaValue(meta, 'batchId') ||
      hasMetaValue(meta, 'regularClassId') ||
      text.includes('batch')
    ) {
      return '/dashboard/admin/classes-monitor';
    }
  }

  if (isTutor) {
    if (hasMetaValue(meta, 'groupBatchId') || hasMetaValue(meta, 'batchId')) {
      return '/dashboard/tutor/group-batches';
    }
    if (
      hasMetaValue(meta, 'sessionId') ||
      hasMetaValue(meta, 'bookingId') ||
      text.includes('demo')
    ) {
      return '/dashboard/tutor/demo_sessions';
    }
    if (hasMetaValue(meta, 'regularClassId')) {
      return '/dashboard/tutor/classes';
    }
    if (hasMetaValue(meta, 'noteId')) {
      return '/dashboard/tutor/notes';
    }
    if (hasMetaValue(meta, 'paymentId') || hasMetaValue(meta, 'refundRequestId')) {
      return '/wallet';
    }
  }

  if (hasMetaValue(meta, 'noteId')) {
    return '/dashboard/student/notes';
  }
  if (hasMetaValue(meta, 'groupBatchId') || hasMetaValue(meta, 'batchId')) {
    return '/dashboard/student/group-batches';
  }
  if (hasMetaValue(meta, 'bookingId')) {
    return '/dashboard/student/demoBookings';
  }
  if (hasMetaValue(meta, 'sessionId')) {
    return '/dashboard/student/sessions';
  }
  if (hasMetaValue(meta, 'regularClassId')) {
    return '/dashboard/student/regular';
  }
  if (hasMetaValue(meta, 'paymentId')) {
    return '/wallet';
  }
  if (hasMetaValue(meta, 'refundRequestId')) {
    return '/dashboard/student/sessions';
  }
  if (text.includes('demo') || text.includes('session')) {
    return '/dashboard/student/sessions';
  }

  return undefined;
}
