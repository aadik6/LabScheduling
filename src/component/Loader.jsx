import React from "react";

const Loader = () => {
  return (
    <div>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce delay-75"></div>
          <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
