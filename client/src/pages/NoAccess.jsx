import React from 'react';

export default function NoAccess() {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    </div>
  );
}
