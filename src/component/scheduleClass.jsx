import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "../config/firebase.config";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { toast } from "react-hot-toast";

const getDateString = (date) => {
  return date.toISOString().split("T")[0];
};

const today = getDateString(new Date());
const maxDate = getDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

const scheduleSchema = z
  .object({
    date: z
      .string()
      .min(1, "Date is required")
      .refine(
        (date) => date >= today && date <= maxDate,
        "Date must be within the next 7 days"
      ),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    batch: z.string().min(1, "Batch/Class is required"),
    subject: z.string().min(1, "Subject is required"),
    professor: z.string().min(1, "Professor name is required"),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return false;
      const startMinutes = timeToMinutes(data.startTime);
      const endMinutes = timeToMinutes(data.endTime);
      return endMinutes > startMinutes;
    },
    {
      message: "End time must be greater than start time",
      path: ["endTime"],
    }
  );

const isTimeOverlap = (existingSlot, newStart, newEnd) => {
  const [existingStart, existingEnd] = existingSlot.split("-");
  return (
    (newStart >= existingStart && newStart < existingEnd) ||
    (newEnd > existingStart && newEnd <= existingEnd) ||
    (newStart <= existingStart && newEnd >= existingEnd)
  );
};

function ScheduleClass() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      date: today,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const startTime = watch("startTime");

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const startMinutes = timeToMinutes(data.startTime);
      const endMinutes = timeToMinutes(data.endTime);

      if (endMinutes <= startMinutes) {
        toast.error("End time must be greater than start time");
        setIsSubmitting(false);
        return;
      }

      const timeSlot = `${data.startTime}-${data.endTime}`;
      const pendingSchedulesRef = collection(db, "pendingSchedules");

      const scheduleQuery = query(
        pendingSchedulesRef,
        where("date", "==", data.date)
      );
      const querySnapshot = await getDocs(scheduleQuery);

      const existingSchedules = querySnapshot.docs.map((doc) => doc.data());

      const hasConflict = existingSchedules.some((schedule) =>
        isTimeOverlap(schedule.timeSlot, data.startTime, data.endTime)
      );

      if (hasConflict) {
        toast.error("This time slot is already booked for the selected date.");
        setIsSubmitting(false);
        return;
      }

      await addDoc(pendingSchedulesRef, {
        date: data.date,
        batch: data.batch,
        subject: data.subject,
        professor: data.professor,
        timestamp: new Date().toISOString(),
        status: "pending",
        timeSlot,
      });

      reset();
      setSubmitted(true);
      toast.success("Class scheduled successfully!");
      // setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      toast.error("Failed to schedule class. Please try again.");
      console.error("Error scheduling class:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinEndTime = () => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(":");
    const date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes) + 1);
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-2xl border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Schedule Lab Class
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Date Input */}
          <div>
            <label className="block text-gray-700 font-medium">Date</label>
            <input
              type="date"
              min={today}
              max={maxDate}
              {...register("date")}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium">
                Start Time
              </label>
              <input
                type="time"
                {...register("startTime")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">
                End Time
              </label>
              <input
                type="time"
                min={getMinEndTime()}
                {...register("endTime")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium">
              Batch/Class
            </label>
            <input
              type="text"
              {...register("batch")}
              placeholder="e.g., CSIT 3rd Year"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.batch && (
              <p className="text-red-500 text-sm mt-1">
                {errors.batch.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Subject</label>
            <input
              type="text"
              {...register("subject")}
              placeholder="e.g., Database Management"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Professor</label>
            <input
              type="text"
              {...register("professor")}
              placeholder="e.g., Dr. Jane Smith"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.professor && (
              <p className="text-red-500 text-sm mt-1">
                {errors.professor.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Scheduling..." : "Schedule Now"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ScheduleClass;
