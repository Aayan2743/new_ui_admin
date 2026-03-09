import { useEffect, useRef, useState } from "react";

export default function VariationModal({ open, product, onClose, onConfirm }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  if (!open || !product) return null;

  const variants = product.variants || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-[480px] max-w-[95vw] shadow-xl">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">Select Variation</h3>
            <p className="text-sm text-gray-500">{product.name}</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>

        {/* VARIANTS */}
        <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto">
          {variants.length === 0 && (
            <div className="text-center text-gray-400 text-sm">
              No variants available
            </div>
          )}

          {variants.map((variant) => (
            <VariantRow
              key={variant.id}
              variant={variant}
              active={selected?.id === variant.id}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-2 text-sm"
          >
            Cancel
          </button>

          <button
            disabled={!selected}
            onClick={() => onConfirm(selected)}
            className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= VARIANT ROW ================= */

function VariantRow({ variant, active, onSelect }) {
  const images = variant.images || [];
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const startHover = () => {
    if (images.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 800);
  };

  const stopHover = () => {
    clearInterval(timerRef.current);
    setIndex(0);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const outOfStock = (variant.stock ?? 0) <= 0;

  return (
    <button
      disabled={outOfStock}
      onMouseEnter={startHover}
      onMouseLeave={stopHover}
      onClick={() => onSelect(variant)}
      className={`
        w-full flex gap-3 items-center border rounded-xl p-3 text-left transition
        ${
          outOfStock
            ? "opacity-40 cursor-not-allowed"
            : active
              ? "border-indigo-600 bg-indigo-50"
              : "hover:bg-gray-50"
        }
      `}
    >
      {/* IMAGE */}
      <div className="h-14 w-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {images.length > 0 ? (
          <img
            src={images[index]?.image_url}
            alt={variant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="flex-1">
        <p className="font-medium text-sm">{variant.name}</p>
        <p className="text-xs text-gray-500">Stock: {variant.stock ?? 0}</p>
      </div>

      {/* PRICE */}
      <p className="font-semibold text-sm">₹ {variant.price ?? 0}</p>
    </button>
  );
}
