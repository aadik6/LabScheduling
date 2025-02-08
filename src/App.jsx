import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Header from "./component/header";
import Footer from "./component/footer";
import HomePage from "./pages/Homepage";
import ScheduleClass from "./component/scheduleClass";
import Login from "./pages/login";
import ForgetPassword from "./pages/forgetPw";
import ManageSchedules from "./component/ManageSchedules";
import { Toaster } from "react-hot-toast";
import Loader from "./component/Loader";
import ClassSchedules from "./component/ClassSchedules";
import WeeklySchedules from "./component/WeeklySchedules";
import ProtectedRoute from "./utils/protectedRoute";

function App() {
  const { reFetch, loading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = reFetch();
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loader />
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<WeeklySchedules />} />
        <Route path="/myschedule" element={<ClassSchedules />} />
        <Route path="/schedules" element={<ScheduleClass />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="" element={<ProtectedRoute />}>
          <Route path="/manage" element={<ManageSchedules />} />
        </Route>
      </Routes>
      <Toaster />
      <Footer />
    </Router>
  );
}

export default App;
