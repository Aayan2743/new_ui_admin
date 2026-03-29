"use client";

import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import {
  Stage,
  Layer,
  Text,
  Transformer,
  Image as KonvaImage,
} from "react-konva";
import useImage from "use-image";

// ✅ Image Component (important)
const URLImage = ({ src, ...props }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} {...props} />;
};

export default function CardFieldBuilder({
  templateId,
  templateImage,
  templateBackImage,
  onClose,
  reload,
}) {
  const [side, setSide] = useState("front");

  const transformerRef = useRef();
  const selectedRef = useRef();

  const [fields, setFields] = useState({
    front: [
      {
        name: "Name",
        type: "text",
        x: 50,
        y: 50,
        fontSize: 18,
        color: "#000000",
        fontStyle: "normal",
        fontFamily: "Arial",
        imageUrl: "",
      },
    ],
    back: [],
  });

  const [activeIndex, setActiveIndex] = useState(0); // ✅ MOVE HERE

  const currentFields = fields[side];

  useEffect(() => {
    setActiveIndex(0);
  }, [side]);

  useEffect(() => {
    if (selectedRef.current && transformerRef.current && activeIndex !== null) {
      transformerRef.current.nodes([selectedRef.current]);
      transformerRef.current.getLayer().batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [activeIndex, side]);

  const [loading, setLoading] = useState(false);
  const stageRef = useRef(null);

  const [frontImage] = useImage(templateImage);
  const [backImage] = useImage(templateBackImage || templateImage);

  // ➕ Add Field
  const addField = () => {
    const updated = { ...fields };

    updated[side].push({
      name: "",
      type: "text",
      x: 50,
      y: 50,
      fontSize: 18,
      color: "#000000",
      fontStyle: "normal",
      imageUrl: "",
    });

    setFields(updated);
    setActiveIndex(updated[side].length - 1);
  };

  // ✏️ Update Field
  const updateField = (index, key, value) => {
    const updated = { ...fields };
    updated[side][index][key] = value;
    setFields(updated);
  };

  const handleEdit = () => {
    // just ensure selected
    if (activeIndex !== null) {
      setActiveIndex(activeIndex);
    }
  };

  const duplicateField = () => {
    if (activeIndex === null) return;

    const updated = { ...fields };
    const field = updated[side][activeIndex];

    updated[side].push({
      ...field,
      x: field.x + 20, // slight offset
      y: field.y + 20,
    });

    setFields(updated);
    setActiveIndex(updated[side].length - 1);
  };

  const bringForward = () => {
    if (activeIndex === null) return;

    const updated = { ...fields };
    const arr = updated[side];

    if (activeIndex < arr.length - 1) {
      [arr[activeIndex], arr[activeIndex + 1]] = [
        arr[activeIndex + 1],
        arr[activeIndex],
      ];

      setFields(updated);
      setActiveIndex(activeIndex + 1);
    }
  };

  const sendBackward = () => {
    if (activeIndex === null) return;

    const updated = { ...fields };
    const arr = updated[side];

    if (activeIndex > 0) {
      [arr[activeIndex], arr[activeIndex - 1]] = [
        arr[activeIndex - 1],
        arr[activeIndex],
      ];

      setFields(updated);
      setActiveIndex(activeIndex - 1);
    }
  };

  // ❌ Remove Field
  const removeField = (index) => {
    const updated = { ...fields };

    updated[side] = updated[side].filter((_, i) => i !== index);

    setFields(updated);

    // ✅ FIX INDEX
    if (updated[side].length > 0) {
      setActiveIndex(0);
    } else {
      setActiveIndex(null);
    }
  };

  // 💾 Save
  const handleSave = async () => {
    try {
      setLoading(true);

      await api.post("/admin-dashboard/save-card-template", {
        template_id: templateId,
        fields: fields,
      });

      alert("Template saved successfully");
      reload();
      onClose();
    } catch (err) {
      alert("Error saving template");
    } finally {
      setLoading(false);
    }
  };

  // 📥 Download
  const handleDownload = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "card.png";
    link.href = uri;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[1200px] h-[700px] rounded-xl p-4 flex gap-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setSide("front")}
            className={`px-3 py-1 rounded ${
              side === "front" ? "bg-indigo-600 text-white" : "border"
            }`}
          >
            Front
          </button>

          <button
            onClick={() => setSide("back")}
            className={`px-3 py-1 rounded ${
              side === "back" ? "bg-indigo-600 text-white" : "border"
            }`}
          >
            Back
          </button>
        </div>

        {/* LEFT PANEL */}
        <div className="w-[300px] border rounded-lg p-3 overflow-y-auto space-y-3">
          <h3 className="font-semibold">Fields</h3>

          {currentFields.map((field, index) => (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`p-2 rounded cursor-pointer border ${
                activeIndex === index ? "border-indigo-500 bg-indigo-50" : ""
              }`}
            >
              {field.name || `Field ${index + 1}`}
            </div>
          ))}

          <button onClick={addField} className="text-indigo-600 text-sm">
            + Add Field
          </button>

          <select
            value={currentFields[activeIndex]?.fontFamily || "Arial"}
            onChange={(e) =>
              updateField(activeIndex, "fontFamily", e.target.value)
            }
            className="input w-full"
          >
            <option value="Arial">Arial</option>
            <option value="Poppins">Poppins</option>
            <option value="Roboto">Roboto</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier</option>
          </select>

          {/* EDIT PANEL */}
          {currentFields[activeIndex ?? 0] && (
            <div className="border-t pt-3 space-y-2">
              <h4 className="font-medium">Edit Field</h4>

              {/* TYPE */}
              <select
                value={currentFields[activeIndex ?? 0].type}
                onChange={(e) =>
                  updateField(activeIndex, "type", e.target.value)
                }
                className="input w-full"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>

              {/* TEXT OPTIONS */}
              {currentFields[activeIndex ?? 0].type === "text" && (
                <>
                  <input
                    value={currentFields[activeIndex ?? 0].name}
                    onChange={(e) =>
                      updateField(activeIndex, "name", e.target.value)
                    }
                    className="input w-full"
                    placeholder="Text"
                  />

                  <input
                    type="number"
                    value={currentFields[activeIndex ?? 0].fontSize}
                    onChange={(e) =>
                      updateField(activeIndex, "fontSize", e.target.value)
                    }
                    className="input w-full"
                    placeholder="Font Size"
                  />

                  <input
                    type="color"
                    value={currentFields[activeIndex ?? 0].color}
                    onChange={(e) =>
                      updateField(activeIndex, "color", e.target.value)
                    }
                    className="w-full h-10"
                  />

                  {/* STYLE BUTTONS */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateField(activeIndex, "fontStyle", "bold")
                      }
                      className="border px-2 py-1 font-bold"
                    >
                      B
                    </button>

                    <button
                      onClick={() =>
                        updateField(activeIndex, "fontStyle", "italic")
                      }
                      className="border px-2 py-1 italic"
                    >
                      I
                    </button>

                    <button
                      onClick={() =>
                        updateField(activeIndex, "fontStyle", "normal")
                      }
                      className="border px-2 py-1"
                    >
                      Normal
                    </button>
                  </div>
                </>
              )}

              {/* IMAGE FIELD */}
              {currentFields[activeIndex ?? 0].type === "image" && (
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    const url = URL.createObjectURL(file);
                    updateField(activeIndex, "imageUrl", url);
                  }}
                  className="input w-full"
                />
              )}

              <button
                onClick={() => removeField(activeIndex)}
                className="text-red-500 text-sm"
              >
                Delete Field
              </button>
            </div>
          )}
        </div>

        {/* CANVAS */}
        <div className="flex-1 border rounded-lg flex items-center justify-center bg-gray-50">
          {/* IMPORTANT: relative wrapper */}
          <div className="relative">
            {/* CANVAS */}
            <Stage width={700} height={400} ref={stageRef}>
              <Layer>
                {/* Background */}
                <KonvaImage
                  image={side === "front" ? frontImage : backImage}
                  width={700}
                  height={400}
                />

                {/* Fields */}
                {currentFields.map((field, index) => {
                  if (field.type === "image") {
                    return (
                      //   <URLImage
                      //     key={index}
                      //     src={field.imageUrl}
                      //     x={field.x}
                      //     y={field.y}
                      //     width={100}
                      //     height={100}
                      //     draggable
                      //     onClick={() => setActiveIndex(index)}
                      //     onDragEnd={(e) => {
                      //       updateField(index, "x", e.target.x());
                      //       updateField(index, "y", e.target.y());
                      //     }}
                      //   />

                      <URLImage
                        ref={activeIndex === index ? selectedRef : null}
                        key={index}
                        src={field.imageUrl}
                        x={field.x}
                        y={field.y}
                        width={field.width || 100}
                        height={field.height || 100}
                        draggable
                        onClick={() => setActiveIndex(index)}
                        // ✅ ADD THIS
                        onDragStart={() => setActiveIndex(index)}
                        // ✅ ADD THIS
                        dragBoundFunc={(pos) => ({
                          x: Math.max(0, Math.min(650, pos.x)),
                          y: Math.max(0, Math.min(350, pos.y)),
                        })}
                        onDragEnd={(e) => {
                          updateField(index, "x", e.target.x());
                          updateField(index, "y", e.target.y());
                        }}
                      />
                    );
                  }

                  return (
                    // <Text
                    //   key={index}
                    //   text={field.name || "Text"}
                    //   x={field.x}
                    //   y={field.y}
                    //   fontSize={parseInt(field.fontSize)}
                    //   fill={field.color}
                    //   fontStyle={field.fontStyle}
                    //   draggable
                    //   stroke={activeIndex === index ? "blue" : null}
                    //   strokeWidth={activeIndex === index ? 0.5 : 0}
                    //   onClick={() => setActiveIndex(index)}
                    //   onDragEnd={(e) => {
                    //     updateField(index, "x", e.target.x());
                    //     updateField(index, "y", e.target.y());
                    //   }}
                    // />
                    <Text
                      ref={activeIndex === index ? selectedRef : null}
                      key={index}
                      text={field.name || "Text"}
                      x={field.x}
                      y={field.y}
                      fontSize={parseInt(field.fontSize)}
                      fontFamily={field.fontFamily || "Arial"}
                      fill={field.color}
                      fontStyle={field.fontStyle}
                      draggable
                      onClick={() => setActiveIndex(index)}
                      // ✅ ADD THIS
                      onDragStart={() => setActiveIndex(index)}
                      // ✅ ADD THIS
                      dragBoundFunc={(pos) => ({
                        x: Math.max(0, Math.min(650, pos.x)),
                        y: Math.max(0, Math.min(350, pos.y)),
                      })}
                      // already you have
                      onDragEnd={(e) => {
                        updateField(index, "x", e.target.x());
                        updateField(index, "y", e.target.y());
                      }}
                    />
                  );

                  <div className="flex flex-wrap gap-2 mt-2">
                    {["₹", "$", "€", "©", "®", "★", "✓", "✔"].map((sym) => (
                      <button
                        key={sym}
                        onClick={() =>
                          updateField(
                            activeIndex,
                            "name",
                            (currentFields[activeIndex]?.name || "") + sym,
                          )
                        }
                        className="border px-2 py-1 rounded hover:bg-gray-100"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>;
                })}

                <Transformer
                  ref={transformerRef}
                  anchorSize={8}
                  anchorFill="#6366f1"
                  anchorStroke="#fff"
                  borderStroke="#6366f1"
                  borderDash={[4, 4]}
                />
              </Layer>
            </Stage>

            {currentFields[activeIndex ?? 0] && (
              <div
                className="absolute bg-white shadow-lg rounded-lg px-3 py-2 flex gap-3 items-center border"
                style={{
                  top: currentFields[activeIndex ?? 0].y - 50,
                  left: currentFields[activeIndex ?? 0].x + 20,
                }}
              >
                <button
                  onClick={() => removeField(activeIndex)}
                  className="text-red-500 hover:bg-red-100 px-2 py-1 rounded"
                >
                  🗑
                </button>

                <button
                  onClick={duplicateField}
                  className="hover:bg-gray-100 px-2 py-1 rounded"
                >
                  📋
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[200px] border rounded-lg p-3 space-y-3">
          <h3 className="font-semibold">Actions</h3>

          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            Save
          </button>

          <button
            onClick={handleDownload}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Download
          </button>

          <button onClick={onClose} className="w-full border py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
