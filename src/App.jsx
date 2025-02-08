import React from "react";
import Login from "./pages/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./component/header";
import Footer from "./component/footer";
import Home from "./pages/home";
import Schedules from "./pages/schedules";
import ForgetPassword from "./pages/forgetPw";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/Homepage";
import ScheduleClass from "./component/scheduleClass";
import ManageSchedules from "./component/ManageSchedules";

function App() {
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
