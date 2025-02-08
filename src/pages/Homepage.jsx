import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Lab Scheduling System
        </h1>
        <p className="text-gray-600 mt-3">
          Seamlessly schedule and manage lab sessions.
        </p>
      </header>

      <div className="flex flex-col md:flex-row justify-center gap-6 my-8">
        <Link
          to="/schedule"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Request Lab
        </Link>
        <Link
          to="/manage"
          className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
        >
          Manage Requests
        </Link>
      </div>

      <section className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Upcoming Lab Sessions
        </h2>
        <ul className="divide-y divide-gray-200">
          <li className="py-3">
            📅 Web Development -{" "}
            <span className="text-blue-500">Monday, 10 AM</span>
          </li>
          <li className="py-3">
            📅 Data Science -{" "}
            <span className="text-blue-500">Wednesday, 2 PM</span>
          </li>
          <li className="py-3">
            📅 AI & ML - <span className="text-blue-500">Friday, 11 AM</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default HomePage;
