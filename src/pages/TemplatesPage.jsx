import { useNavigate } from "react-router-dom";

export default function TemplatesPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/templates/create")}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        + Create Template
      </button>
    </div>
  );
}
