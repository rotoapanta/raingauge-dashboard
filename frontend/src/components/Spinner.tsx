/**
 * Spinner.tsx
 *
 * Visual loading spinner component to indicate that data is being processed or loaded.
 *
 * Componente visual de carga (spinner) para indicar que los datos están siendo procesados o cargados.
 */

/**
 * Displays an animated spinner and a loading message.
 *
 * Muestra un spinner animado y un mensaje de carga.
 */
export function Spinner() {
  return (
    // Spinner container / Contenedor del spinner
    <div className="flex flex-col items-center justify-center py-8" aria-label="Cargando...">
      {/* SVG spinner icon / Icono SVG animado */}
      <svg
        className="animate-spin h-8 w-8 text-blue-400 mb-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      {/* Loading message / Mensaje de carga */}
      <span className="text-gray-400">Cargando datos...</span>
    </div>
  );
}
