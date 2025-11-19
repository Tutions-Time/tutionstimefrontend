"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkReturnForReview } from "@/store/slices/reviewSlice";

export default function ReviewChecker() {
  const dispatch = useDispatch();

  useEffect(() => {
    // When the tab gets focus again → user came back
    const handleFocus = () => {
      dispatch(checkReturnForReview());
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return null;
}
