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

function App() {
  const { reFetch, loading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = reFetch();
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="bg-red-500">Loading...</p>;
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/schedules" element={<ScheduleClass />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/manage" element={<ManageSchedules />} />
      </Routes>
      <Toaster />
      <Footer />
    </Router>
  );
}

export default App;
