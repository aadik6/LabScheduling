import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "../config/firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { Calendar, Clock, Users, BookOpen, AlertCircle } from "lucide-react";

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
  const { user } = useAuthStore();
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

  const checkTimeSlotConflicts = async (date, startTime, endTime) => {
    const pendingSchedulesRef = collection(db, "pendingSchedules");
    const pendingQuery = query(pendingSchedulesRef, where("date", "==", date));
    const pendingSnapshot = await getDocs(pendingQuery);

    const pendingConflict = pendingSnapshot.docs.some((doc) =>
      isTimeOverlap(doc.data().timeSlot, startTime, endTime)
    );

    if (pendingConflict) {
      return "This time slot conflicts with a pending schedule request";
    }

    const scheduleDocRef = doc(db, "schedules", date);
    const scheduleDoc = await getDoc(scheduleDocRef);

    if (scheduleDoc.exists()) {
      const scheduleData = scheduleDoc.data();
      const timeSlot = `${startTime}-${endTime}`;

      for (const [slot, data] of Object.entries(scheduleData)) {
        if (isTimeOverlap(slot, startTime, endTime)) {
          return "This time slot is already booked in the approved schedules";
        }
      }
    }

    return null;
  };

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

      const conflict = await checkTimeSlotConflicts(
        data.date,
        data.startTime,
        data.endTime
      );

      if (conflict) {
        toast.error(conflict);
        setIsSubmitting(false);
        return;
      }

      const timeSlot = `${data.startTime}-${data.endTime}`;
      await addDoc(collection(db, "pendingSchedules"), {
        date: data.date,
        batch: data.batch,
        subject: data.subject,
        timestamp: new Date().toISOString(),
        status: "pending",
        timeSlot,
        createdBy: user.uid,
      });

      reset();
      setSubmitted(true);
      toast.success("Class scheduled successfully!");
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
    <div className="p-8">
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800">
              Schedule Lab Class
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Fill in the details below to request a lab class schedule.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-6">
              {/* Date Field */}
              <div className="space-y-1">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Select Date
                </label>
                <input
                  type="date"
                  min={today}
                  max={maxDate}
                  {...register("date")}
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                {errors.date && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.date.message}
                  </div>
                )}
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    {...register("startTime")}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {errors.startTime && (
                    <div className="flex items-center text-red-500 text-sm mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.startTime.message}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    End Time
                  </label>
                  <input
                    type="time"
                    min={getMinEndTime()}
                    {...register("endTime")}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {errors.endTime && (
                    <div className="flex items-center text-red-500 text-sm mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.endTime.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Batch Field */}
              <div className="space-y-1">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  Batch/Class
                </label>
                <input
                  type="text"
                  {...register("batch")}
                  placeholder="e.g., CSIT 3rd Year"
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                {errors.batch && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.batch.message}
                  </div>
                )}
              </div>

              {/* Subject Field */}
              <div className="space-y-1">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                  Subject
                </label>
                <input
                  type="text"
                  {...register("subject")}
                  placeholder="e.g., Database Management"
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                {errors.subject && (
                  <div className="flex items-center text-red-500 text-sm mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.subject.message}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Scheduling...
                    </div>
                  ) : (
                    "Schedule Now"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Optional: Add a note about scheduling policy */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-start text-sm text-gray-500">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
              <p>
                Schedules can only be made for the next 7 days. All requests
                need to be approved before they become active. You'll be
                notified once your request is processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

export default ScheduleClass;
