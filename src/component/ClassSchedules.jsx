import React, { useState, useEffect } from "react";
import { db } from "../config/firebase.config";
import { collection, getDocs } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { Calendar, Clock, Users, BookOpen, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import AdminLayout from "./adminLayout";

function ClassSchedules() {
  const [activeTab, setActiveTab] = useState("schedules");
  const [schedules, setSchedules] = useState([]);
  const [pendingSchedules, setPendingSchedules] = useState([]);
  const [declinedSchedules, setDeclinedSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuthStore();
  const uid = user.uid;

  const processScheduleData = (doc) => {
    const dateId = doc.id;
    const data = doc.data();
    const timeSlots = [];

    Object.entries(data).forEach(([timeSlot, slotData]) => {
      if (slotData.createdBy === uid) {
        timeSlots.push({
          timeSlot,
          date: dateId,
          ...slotData,
        });
      }
    });

    return timeSlots;
  };

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      if (tab === "schedules") {
        const schedulesRef = collection(db, "schedules");
        const schedulesSnapshot = await getDocs(schedulesRef);

        const processedSchedules = schedulesSnapshot.docs
          .map(processScheduleData)
          .flat()
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setSchedules(processedSchedules);
      } else if (tab === "pendingSchedules") {
        const pendingSchedulesRef = collection(db, "pendingSchedules");
        const pendingSnapshot = await getDocs(pendingSchedulesRef);
        const pendingData = pendingSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((schedule) => schedule.createdBy === uid);
        setPendingSchedules(pendingData);
      } else if (tab === "declinedSchedules") {
        const declinedSchedulesRef = collection(db, "declinedSchedules");
        const declinedSnapshot = await getDocs(declinedSchedulesRef);
        const declinedData = declinedSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((schedule) => schedule.createdBy === uid);
        setDeclinedSchedules(declinedData);
      }
    } catch (err) {
      setError("Error fetching schedules: " + err.message);
      toast.error("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="p-8">
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800">
                Lab Class Schedules
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                View and manage your lab class schedules
              </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 p-2 bg-gray-50">
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "schedules"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("schedules")}
              >
                Active Schedules
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "pendingSchedules"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("pendingSchedules")}
              >
                Pending
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "declinedSchedules"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("declinedSchedules")}
              >
                Declined
              </button>
            </div>

            <div className="p-6">
              {activeTab === "schedules" && (
                <div className="space-y-4">
                  {schedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No active schedules found.</p>
                    </div>
                  ) : (
                    schedules.map((schedule, index) => (
                      <div
                        key={`${schedule.date}-${schedule.timeSlot}`}
                        className="border border-gray-200 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(schedule.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {schedule.timeSlot}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          {schedule.batch}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                          {schedule.subject}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "pendingSchedules" && (
                <div className="space-y-4">
                  {pendingSchedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No pending schedules found.</p>
                    </div>
                  ) : (
                    pendingSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="border border-gray-200 rounded-lg p-4 space-y-2 bg-yellow-50"
                      >
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(schedule.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {schedule.timeSlot}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                          {schedule.subject}
                        </div>
                        <div className="flex items-center text-sm text-yellow-600 mt-2">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Awaiting Approval
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "declinedSchedules" && (
                <div className="space-y-4">
                  {declinedSchedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No declined schedules found.</p>
                    </div>
                  ) : (
                    declinedSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="border border-gray-200 rounded-lg p-4 space-y-2 bg-red-50"
                      >
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(schedule.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {schedule.timeSlot}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                          {schedule.subject}
                        </div>
                        {schedule.declineMessage && (
                          <div className="flex items-start text-sm text-red-600 mt-2">
                            <AlertCircle className="w-4 h-4 mr-2 mt-0.5" />
                            <p>{schedule.declineMessage}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}

export default ClassSchedules;
