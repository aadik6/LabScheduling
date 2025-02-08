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
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { Trash, CheckCircle } from "lucide-react";

function ManageSchedules() {
  const [pendingSchedules, setPendingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [declineMessage, setDeclineMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPendingSchedules = async () => {
    try {
      const schedulesRef = collection(db, "pendingSchedules");
      const q = query(schedulesRef, where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      const schedules = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingSchedules(schedules.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      setError("Failed to fetch pending schedules");
      console.error("Error fetching schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSchedules();
  }, []);

  const handleApprove = async (schedule) => {
    setIsProcessing(true);
    try {
      const scheduleRef = doc(db, "schedules", schedule.date);
      await setDoc(scheduleRef, {
        [schedule.timeSlot]: {
          batch: schedule.batch,
          subject: schedule.subject,
          professor: schedule.professor,
          timestamp: new Date().toISOString(),
        },
      }, { merge: true });
      await deleteDoc(doc(db, "pendingSchedules", schedule.id));
      setPendingSchedules((current) => current.filter((s) => s.id !== schedule.id));
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
        declineMessage: declineMessage,
        declinedAt: new Date().toISOString(),
      });
      setPendingSchedules((current) => current.filter((s) => s.id !== selectedSchedule.id));
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

  const handleDeleteAll = async () => {
    setIsProcessing(true);
    try {
      const schedulesRef = collection(db, "pendingSchedules");
      const querySnapshot = await getDocs(schedulesRef);
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      setPendingSchedules([]);
      toast.success("All schedules deleted successfully!");
    } catch (err) {
      setError("Failed to delete all schedules");
      console.error("Error deleting schedules:", err);
      toast.error("Failed to delete all schedules");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptAll = async () => {
    setIsProcessing(true);
    try {
      const schedulesRef = collection(db, "pendingSchedules");
      const querySnapshot = await getDocs(schedulesRef);
      const acceptPromises = querySnapshot.docs.map(async (doc) => {
        const schedule = { id: doc.id, ...doc.data() };
        const scheduleRef = doc(db, "schedules", schedule.date);
        await setDoc(scheduleRef, {
          [schedule.timeSlot]: {
            batch: schedule.batch,
            subject: schedule.subject,
            professor: schedule.professor,
            timestamp: new Date().toISOString(),
          },
        }, { merge: true });
        await deleteDoc(doc.ref);
      });
      await Promise.all(acceptPromises);
      await fetchPendingSchedules();
      toast.success("All schedules accepted successfully!");
    } catch (err) {
      setError("Failed to accept all schedules");
      console.error("Error accepting schedules:", err);
      toast.error("Failed to accept all schedules");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading schedules...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Manage Schedule Requests</h1>
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDeleteAll}
            disabled={isProcessing}
            className="flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition disabled:opacity-50 mr-2"
          >
            <Trash className="mr-2" /> Delete All
          </button>
          <button
            onClick={handleAcceptAll}
            disabled={isProcessing}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
          >
            <CheckCircle className="mr-2" /> Accept All
          </button>
        </div>
        {pendingSchedules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600">No pending schedules to review</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingSchedules.map((schedule) => (
              <div key={schedule.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Date & Time</h3>
                    <p className="text-gray-600">{new Date(schedule.date).toLocaleDateString()}</p>
                    <p className="text-gray-600">{schedule.timeSlot}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Class Details</h3>
                    <p className="text-gray-600">{schedule.batch}</p>
                    <p className="text-gray-600">{schedule.subject}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Professor</h3>
                    <p className="text-gray-600">{schedule.professor}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setIsDeclineModalOpen(true);
                    }}
                    disabled={isProcessing}
                    className="flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleApprove(schedule)}
                    disabled={isProcessing}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {isDeclineModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4">Decline Schedule Request</h2>
              <p className="text-gray-600 mb-4">Please provide a reason for declining this schedule request (optional):</p>
              <textarea
                value={declineMessage}
                onChange={(e) => setDeclineMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 mb-4"
                rows={3}
                placeholder="Enter reason for declining (optional)"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsDeclineModalOpen(false);
                    setSelectedSchedule(null);
                    setDeclineMessage("");
                  }}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecline}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  {isProcessing ? "Declining..." : "Decline Schedule"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageSchedules;
