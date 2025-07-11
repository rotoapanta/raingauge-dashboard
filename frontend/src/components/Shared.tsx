import { Battery } from "lucide-react";
import React from "react";

export function Card({
  icon,
  title,
  value,
  small = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${small ? "bg-gray-900 rounded p-2" : "bg-gray-800 rounded-lg shadow p-4"}`}
      tabIndex={0}
      aria-label={title + ': ' + value}
      title={title}
    >
      <div className="text-blue-400" aria-hidden="true">{icon}</div>
      <div>
        <h2 className={small ? "text-xs font-semibold" : "text-lg font-semibold"}>{title}</h2>
        <p className={small ? "text-base font-bold" : "text-2xl font-bold"}>{value}</p>
      </div>
    </div>
  );
}

export function BatteryIcon({ status }: { status: string }) {
  const color =
    status === "CRITICAL"
      ? "text-red-600"
      : status === "LOW"
      ? "text-yellow-400"
      : "text-green-400";
  return (
    <div className={color}>
      <Battery />
    </div>
  );
}
