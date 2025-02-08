import React, { useState, useEffect } from "react";
import { db } from "../config/firebase.config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Calendar, Clock, Users, BookOpen, UserCircle } from "lucide-react";

function WeeklySchedules() {
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [professorNames, setProfessorNames] = useState({});
  const [error, setError] = useState(null);

  const fetchProfessorName = async (userId) => {
    if (professorNames[userId]) {
      return professorNames[userId];
    }

    try {
      const userRef = doc(collection(db, "users"), userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const profName = userSnap.data().name || "Unknown";
        setProfessorNames((prev) => ({ ...prev, [userId]: profName }));
        return profName;
      }
    } catch (err) {
      console.error("Error fetching professor name:", err);
    }
    return "Unknown";
  };

  const getNextSevenDays = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const processScheduleData = async (doc) => {
    const dateId = doc.id;
    const data = doc.data();
    const timeSlots = [];

    for (const [timeSlot, slotData] of Object.entries(data)) {
      if (timeSlot !== "id") {
        const professorName = await fetchProfessorName(
          slotData.professor || slotData.createdBy
        );
        timeSlots.push({
          timeSlot,
          professorName,
          ...slotData,
        });
      }
    }

    return { [dateId]: timeSlots };
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const nextSevenDays = getNextSevenDays();
      const schedulesRef = collection(db, "schedules");
      const schedulesSnapshot = await getDocs(schedulesRef);

      const processedSchedules = {};

      for (const doc of schedulesSnapshot.docs) {
        if (nextSevenDays.includes(doc.id)) {
          const scheduleData = await processScheduleData(doc);
          Object.assign(processedSchedules, scheduleData);
        }
      }

      setSchedules(processedSchedules);
    } catch (err) {
      setError("Error fetching schedules: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                Weekly Lab Schedules
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                View all lab schedules for the next 7 days.
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {getNextSevenDays().map((date, index) => (
                  <div
                    key={date}
                    className="bg-white shadow-md rounded-lg border border-gray-100 p-3 sm:p-4 space-y-3 sm:space-y-4"
                  >
                    <h3 className="text-base sm:text-lg font-medium text-gray-800 break-words">
                      {formatDate(date)}
                    </h3>

                    <div className="max-h-96 overflow-y-auto">
                      {schedules[date]?.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                          {schedules[date].map((schedule, index) => (
                            <div
                              key={`${date}-${schedule.timeSlot}`}
                              className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-2 hover:bg-blue-50 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center text-sm text-gray-700 min-w-0">
                                  <Clock className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                                  <span className="truncate">
                                    {schedule.timeSlot}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700 min-w-0">
                                  <UserCircle className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                                  <span className="truncate">
                                    {schedule.professorName}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center text-sm text-gray-700 min-w-0">
                                <Users className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                                <span className="truncate">
                                  {schedule.batch}
                                </span>
                              </div>

                              <div className="flex items-center text-sm text-gray-700 min-w-0">
                                <BookOpen className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                                <span className="truncate">
                                  {schedule.subject}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                          No schedules for this day
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-start text-sm text-gray-500">
                <Calendar className="flex-shrink-0 w-4 h-4 mr-2 mt-0.5 text-blue-500" />
                <p className="break-words">
                  This view shows all scheduled lab classes for the next 7 days.
                  Schedules are organized by date for easy viewing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklySchedules;
