import React from "react";

export function SuccessAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-green-700 text-white px-4 py-2 rounded mb-2 text-center font-semibold">
      {message}
    </div>
  );
}
