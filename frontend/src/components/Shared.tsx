/**
 * Shared.tsx
 *
 * Componentes reutilizables para tarjetas de métricas y visualización de batería.
 */

import { Battery } from "lucide-react";
import React from "react";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  small?: boolean;
}

/**
 * Componente de tarjeta para mostrar una métrica o valor con icono y título.
 */
export function Card({ icon, title, value, small = false }: CardProps) {
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

interface BatteryIconProps {
  status: string;
}

/**
 * Icono de batería con color según el estado (CRITICAL, LOW, OK).
 */
export function BatteryIcon({ status }: BatteryIconProps) {
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
