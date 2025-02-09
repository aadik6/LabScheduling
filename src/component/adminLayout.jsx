import React from 'react';

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen gap-5">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col p-4 mt-10 fixed left-0 h-full">
        <h1 className="text-2xl font-bold mb-1 px-4">Admin Panel</h1>
        <hr/>
        <nav className="space-y-2">
          <a
            href="/myschedule"
            className="block py-1 mt-2 px-4 rounded hover:bg-gray-700 transition"
          >
            My classes
          </a>
          <a
            href="/schedules"
            className="block py-1 px-4 rounded hover:bg-gray-700 transition"
          >
            Schedule classes
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-2 bg-gray-100 p-6 items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
