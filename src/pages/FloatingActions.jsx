import { FaTrash, FaPlus, FaSearch, FaExpand } from "react-icons/fa";

export default function FloatingActions({ onDelete, onAdd, onZoom, onResize }) {
  return (
    <div className="absolute top-4 right-4 grid grid-cols-2 gap-3">
      <button
        onClick={onDelete}
        className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-md"
      >
        <FaTrash />
      </button>

      <button
        onClick={onAdd}
        className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-md"
      >
        <FaPlus />
      </button>

      <button
        onClick={onZoom}
        className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-md"
      >
        <FaSearch />
      </button>

      <button
        onClick={onResize}
        className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-md"
      >
        <FaExpand />
      </button>
    </div>
  );
}
