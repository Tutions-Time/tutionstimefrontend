"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { openReviewModal } from "@/store/slices/reviewSlice";
import { getStudentBookings } from "@/services/bookingService";

export default function ReviewChecker() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.review.shouldShowReview);

  useEffect(() => {
    const checkForPendingReview = async () => {
      if (isOpen) return;

      try {
        const bookings = await getStudentBookings();
        const pending = bookings.find(
          (b: any) =>
            b.type === "demo" &&
            b.status === "completed" &&
            !b.demoFeedback
        );
        if (pending) {
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

    checkForPendingReview();

    const handleFocus = () => {
      checkForPendingReview();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [dispatch, isOpen]);

  return null;
}
