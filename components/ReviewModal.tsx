"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { closeReviewModal } from "@/store/slices/reviewSlice";
import { submitReview } from "@/services/reviewService";
import { Star, X } from "lucide-react";

export default function ReviewModal() {
  const dispatch = useDispatch();
  const { shouldShowReview, tutorName, bookingId } = useSelector(
    (state: RootState) => state.review
  );

  const [teaching, setTeaching] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [understanding, setUnderstanding] = useState(0);
  const [comment, setComment] = useState("");
  const [likedTutor, setLikedTutor] = useState<boolean | null>(null);

  if (!shouldShowReview) return null;

  const sendReview = async () => {
    if (!bookingId) return;

    await submitReview(bookingId, {
      teaching,
      communication,
      understanding,
      comment,
      likedTutor: likedTutor ?? false,
    });

    dispatch(closeReviewModal());
  };

  // ⭐ reusable star component
  const Stars = ({
    value,
    setter,
  }: {
    value: number;
    setter: (n: number) => void;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          onClick={() => setter(n)}
          className={`w-6 h-6 cursor-pointer ${
            value >= n ? "text-yellow-500" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative bg-white w-[90%] max-w-md rounded-2xl p-6 space-y-5 shadow-xl">

        {/* ❌ Close button */}
        <button
          onClick={() => dispatch(closeReviewModal())}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900">
          How was your demo with {tutorName}?
        </h2>

        {/* ⭐ Stars */}
        <div className="space-y-3">
          <div>
            <label className="font-medium">Teaching</label>
            <Stars value={teaching} setter={setTeaching} />
          </div>

          <div>
            <label className="font-medium">Communication</label>
            <Stars value={communication} setter={setCommunication} />
          </div>

          <div>
            <label className="font-medium">Understanding</label>
            <Stars value={understanding} setter={setUnderstanding} />
          </div>
        </div>

        {/* ✏ Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-lg p-3 text-sm"
          placeholder="Write your feedback..."
        />

        {/* 👍 👎 Liked Tutor */}
        <div className="flex gap-4 mt-2">
          <button
            onClick={() => setLikedTutor(true)}
            className={`px-4 py-2 rounded-lg border ${
              likedTutor === true ? "bg-green-500 text-white" : ""
            }`}
          >
            Yes 👍
          </button>

          <button
            onClick={() => setLikedTutor(false)}
            className={`px-4 py-2 rounded-lg border ${
              likedTutor === false ? "bg-red-500 text-white" : ""
            }`}
          >
            No 👎
          </button>
        </div>

        {/* 🚀 Submit Button */}
        <button
          onClick={sendReview}
          className="w-full bg-[#FFD54F] text-black font-semibold py-3 rounded-full hover:bg-[#eac747]"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
