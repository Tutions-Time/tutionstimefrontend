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

function asString(value: any) {
  return value === undefined || value === null ? undefined : String(value);
}

function getMetaString(meta: ToastMeta | undefined, ...keys: string[]) {
  if (!meta) return undefined;
  for (const key of keys) {
    const value = (meta as any)[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value);
    }
  }
  return undefined;
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
  const normalizedRole = String(role || '').toLowerCase();
  const isTutor = normalizedRole === 'tutor';
  const isAdmin = normalizedRole === 'admin';
  const isStudent = normalizedRole === 'student';
  const notificationType = String((meta as any)?.type || (meta as any)?.tag || '').toLowerCase();
  const requestedBy = String((meta as any)?.requestedBy || '').toLowerCase();
  const groupBatchId = getMetaString(meta, 'groupBatchId', 'batchId');
  const regularClassId = getMetaString(meta, 'regularClassId');
  const bookingId = getMetaString(meta, 'bookingId');
  const sessionId = getMetaString(meta, 'sessionId');
  const paymentId = getMetaString(meta, 'paymentId');
  const payoutId = getMetaString(meta, 'payoutId');
  const refundRequestId = getMetaString(meta, 'refundRequestId');
  const noteId = getMetaString(meta, 'noteId');

  if (isAdmin) {
    const metaUserId = asString((meta as any)?.userId);
    const metaRole = String((meta as any)?.role || '').toLowerCase();
    const tutorId =
      asString(metaRole === 'tutor' ? metaUserId : undefined) ||
      asString(metaUserId && (text.includes('tutor') || text.includes('kyc')) ? metaUserId : undefined) ||
      asString((meta as any)?.tutorId);
    let studentId =
      asString(metaRole === 'student' ? metaUserId : undefined) ||
      asString(metaUserId && (text.includes('student') || text.includes('signup')) ? metaUserId : undefined) ||
      asString((meta as any)?.studentId) ||
      undefined;
    // Heuristic: if userId exists and title/description suggests a student signup, treat as student
    if (!studentId) {
      const uid = metaUserId;
      if (uid && (text.includes('student') || text.includes('signup'))) {
        studentId = uid;
      }
    }

    if (refundRequestId || text.includes('refund')) {
      return '/dashboard/admin/refunds';
    }
    if (payoutId || text.includes('payout')) {
      return '/dashboard/admin/payouts';
    }
    if (paymentId || noteId || text.includes('payment') || text.includes('revenue')) {
      return '/dashboard/admin/transactions';
    }
    if (hasMetaValue(meta, 'switchRequestId') || text.includes('switch requested') || text.includes('tutor switch')) {
      return '/dashboard/admin/classes-monitor';
    }
    if (
      groupBatchId ||
      regularClassId ||
      sessionId ||
      text.includes('batch') ||
      text.includes('class') ||
      text.includes('session') ||
      text.includes('reschedule')
    ) {
      return '/dashboard/admin/classes-monitor';
    }
    if (bookingId || text.includes('demo')) {
      return '/dashboard/admin/sessions';
    }
    if (tutorId) {
      return `/dashboard/admin/tutors/${tutorId}/journey`;
    }
    if (studentId) {
      return `/dashboard/admin/users/${studentId}`;
    }
    if (text.includes('kyc') || text.includes('tutor')) {
      return '/dashboard/admin/tutors';
    }
    if (hasMetaValue(meta, 'userId') || text.includes('signup') || text.includes('student')) {
      return '/dashboard/admin/users';
    }
    if (hasMetaValue(meta, 'enquiryId') || text.includes('enquiry')) {
      return '/dashboard/admin/tutors'; // Defaulting to tutors for enquiry monitoring
    }
  }

  if (isTutor) {
    const studentUserId = (meta as any)?.studentUserId;
    if (
      notificationType.includes('kyc') ||
      text.includes('kyc') ||
      text.includes('verification') ||
      text.includes('account status')
    ) {
      return text.includes('account status') ? '/dashboard/tutor/profile' : '/dashboard/tutor/kyc';
    }
    if (notificationType === 'monthly' || text.includes('monthly summary')) {
      return '/dashboard/tutor/analytics/tutor';
    }
    if (
      studentUserId &&
      (notificationType === 'student_pincode_match' ||
        text.includes('new student near you'))
    ) {
      return `/dashboard/tutor/search/student/${studentUserId}`;
    }
    if (groupBatchId) {
      return `/dashboard/tutor/group-batches/${groupBatchId}`;
    }
    if (refundRequestId || text.includes('refund')) {
      return '/dashboard/tutor/refunds';
    }
    if (payoutId || paymentId || text.includes('payment') || text.includes('payout') || text.includes('earning')) {
      return '/wallet';
    }
    if (bookingId || text.includes('demo')) {
      return '/dashboard/tutor/demo_sessions';
    }
    if (regularClassId || sessionId || text.includes('session') || text.includes('class')) {
      return '/dashboard/tutor/classes';
    }
    if (noteId) {
      return '/dashboard/tutor/notes';
    }
  }

  if (isStudent) {
    if (notificationType === 'monthly' || text.includes('monthly summary')) {
      return '/dashboard/student/progress';
    }
    if (noteId) {
      return '/dashboard/student/notes';
    }
    if (groupBatchId) {
      return `/dashboard/student/group-batches/${groupBatchId}`;
    }
    if (refundRequestId || text.includes('refund')) {
      return '/dashboard/student/sessions';
    }
    if (paymentId || text.includes('payment')) {
      return '/wallet';
    }
    if (
      bookingId &&
      (requestedBy === 'tutor' ||
        text.includes('new demo request') ||
        text.includes('requested a demo'))
    ) {
      return '/dashboard/student/demoRequests';
    }
    if (bookingId || text.includes('demo')) {
      return '/dashboard/student/demoBookings';
    }
    if (regularClassId || sessionId || text.includes('session') || text.includes('class')) {
      return '/dashboard/student/sessions';
    }
  }

  if (noteId) {
    return '/dashboard/student/notes';
  }
  if (groupBatchId) {
    return '/dashboard/student/group-batches';
  }
  if (bookingId) {
    return '/dashboard/student/demoBookings';
  }
  if (sessionId) {
    return '/dashboard/student/sessions';
  }
  if (regularClassId) {
    return '/dashboard/student/sessions';
  }
  if (paymentId) {
    return '/wallet';
  }
  if (refundRequestId) {
    return '/dashboard/student/sessions';
  }
  if (text.includes('demo') || text.includes('session')) {
    return '/dashboard/student/sessions';
  }

  return undefined;
}
