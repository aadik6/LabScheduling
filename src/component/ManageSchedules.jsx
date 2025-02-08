import React, { useState, useEffect } from "react";
import { db } from "../config/firebase.config";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import {
  Trash,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Calendar,
  Clock,
  Users,
  BookOpen,
  User,
  Search,
} from "lucide-react";
import Loader from "./Loader";

function ManageSchedules() {
  const [pendingSchedules, setPendingSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [declineMessage, setDeclineMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sortDirection, setSortDirection] = useState("asc");
  const [professorNames, setProfessorNames] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProfessorName = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data().name;
      }
      return "Unknown Professor";
    } catch (err) {
      console.error("Error fetching professor name:", err);
      return "Unknown Professor";
    }
  };

  const fetchPendingSchedules = async () => {
    try {
      const schedulesRef = collection(db, "pendingSchedules");
      const q = query(schedulesRef, orderBy("date", sortDirection));
      const querySnapshot = await getDocs(q);
      const schedules = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = { id: doc.id, ...doc.data() };
          if (!professorNames[data.createdBy]) {
            const profName = await fetchProfessorName(data.createdBy);
            setProfessorNames((prev) => ({
              ...prev,
              [data.createdBy]: profName,
            }));
          }
          return data;
        })
      );
      setPendingSchedules(schedules);
      setFilteredSchedules(schedules);
    } catch (err) {
      setError("Failed to fetch pending schedules");
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSchedules();
  }, [sortDirection]);

  useEffect(() => {
    const filtered = pendingSchedules.filter((schedule) => {
      const searchString = searchQuery.toLowerCase();
      const professorName = (
        professorNames[schedule.createdBy] || ""
      ).toLowerCase();
      return (
        schedule.batch.toLowerCase().includes(searchString) ||
        schedule.subject.toLowerCase().includes(searchString) ||
        professorName.includes(searchString) ||
        schedule.date.includes(searchString) ||
        schedule.timeSlot.includes(searchString)
      );
    });
    setFilteredSchedules(filtered);
  }, [searchQuery, pendingSchedules, professorNames]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleApprove = async (schedule) => {
    setIsProcessing(true);
    try {
      const scheduleRef = doc(db, "schedules", schedule.date);
      await setDoc(
        scheduleRef,
        {
          [schedule.timeSlot]: {
            batch: schedule.batch,
            subject: schedule.subject,
            professor: schedule.createdBy,
            timestamp: new Date().toISOString(),
          },
        },
        { merge: true }
      );
      await deleteDoc(doc(db, "pendingSchedules", schedule.id));
      setPendingSchedules((current) =>
        current.filter((s) => s.id !== schedule.id)
      );
      toast.success("Schedule approved successfully!");
    } catch (err) {
      setError("Failed to approve schedule");
      console.error("Error approving schedule:", err);
      toast.error("Failed to approve schedule");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      if (!selectedSchedule) return;
      await deleteDoc(doc(db, "pendingSchedules", selectedSchedule.id));
      const declinedRef = doc(db, "declinedSchedules", selectedSchedule.id);
      await setDoc(declinedRef, {
        ...selectedSchedule,
        declineMessage: declineMessage || "",
        declinedAt: new Date().toISOString(),
      });
      setPendingSchedules((current) =>
        current.filter((s) => s.id !== selectedSchedule.id)
      );
      setDeclineMessage("");
      setIsDeclineModalOpen(false);
      setSelectedSchedule(null);
      toast.success("Schedule declined successfully!");
    } catch (err) {
      setError("Failed to decline schedule");
      console.error("Error declining schedule:", err);
      toast.error("Failed to decline schedule");
    } finally {
      setIsProcessing(false);
    }
  };
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h1 className="text-2xl font-semibold text-gray-800">
                Schedule Requests
              </h1>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search schedules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full sm:w-64 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={toggleSortDirection}
                  className="flex items-center justify-center px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Sort by Date{" "}
                  {sortDirection === "asc" ? (
                    <ChevronUp className="ml-2 w-4 h-4" />
                  ) : (
                    <ChevronDown className="ml-2 w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-6">
            {filteredSchedules.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No Schedules Found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery
                    ? "No schedules match your search criteria."
                    : "There are no schedule requests waiting for review."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition-colors duration-200"
                  >
                    <div className="p-4 lg:p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Date
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(schedule.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Time Slot
                            </p>
                            <p className="text-sm text-gray-500">
                              {schedule.timeSlot}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Users className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Batch
                            </p>
                            <p className="text-sm text-gray-500">
                              {schedule.batch}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Subject
                            </p>
                            <p className="text-sm text-gray-500">
                              {schedule.subject}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {professorNames[schedule.createdBy] || "Loading..."}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setIsDeclineModalOpen(true);
                            }}
                            disabled={isProcessing}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleApprove(schedule)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isDeclineModalOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-25 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900">
              Decline Schedule Request
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please provide a reason for declining this schedule request
              (optional):
            </p>
            <textarea
              value={declineMessage}
              onChange={(e) => setDeclineMessage(e.target.value)}
              className="mt-4 w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter reason for declining (optional)"
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeclineModalOpen(false);
                  setSelectedSchedule(null);
                  setDeclineMessage("");
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
              >
                {isProcessing ? "Declining..." : "Decline Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSchedules;
