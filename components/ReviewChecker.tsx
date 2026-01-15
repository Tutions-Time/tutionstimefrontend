"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { openReviewModal } from "@/store/slices/reviewSlice";
import { getStudentBookings } from "@/services/bookingService";

export default function ReviewChecker() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role);
  const shouldShowReview = useAppSelector((s) => s.review.shouldShowReview);

  useEffect(() => {
    const checkPendingFeedback = async () => {
      if (role !== "student" || shouldShowReview) return;
      try {
        const bookings = await getStudentBookings();
        const pending = bookings.find(
          (b: any) =>
            b.type === "demo" &&
            b.status === "completed" &&
            !b.demoFeedback
        );
        if (pending?._id) {
          dispatch(
            openReviewModal({
              bookingId: pending._id,
              tutorId: pending.tutorId,
              tutorName: pending.tutorName || "Tutor",
            })
          );
        }
      } catch {}
    };

    const handleFocus = () => {
      checkPendingFeedback();
    };

    checkPendingFeedback();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [dispatch, role, shouldShowReview]);

  return null;
}
