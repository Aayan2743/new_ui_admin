// import React, { useEffect, useState } from "react";
// import {
//   DndContext,
//   closestCenter,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
// } from "@dnd-kit/sortable";


// import {
//   showSuccessToast,
//   showErrorToast,
//   showLoader,
//   closeLoader,
// } from "../../utils/swal";
// import { CSS } from "@dnd-kit/utilities";

// import api from "../../api/axios";

// // 🔹 Sortable Item Component
// function SortableItem({ id, name }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     padding: "12px",
//     marginBottom: "10px",
//     background: isDragging ? "#e6f7ff" : "#fff",
//     border: "1px solid #ddd",
//     borderRadius: "10px",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     boxShadow: isDragging ? "0 6px 15px rgba(0,0,0,0.15)" : "none",
//   };

//   return (
//     <div ref={setNodeRef} style={style}>
//       <span>{name}</span>

//       {/* Drag Handle */}
//       <span
//         {...attributes}
//         {...listeners}
//         style={{
//           cursor: "grab",
//           padding: "6px 10px",
//           background: "#f0f0f0",
//           borderRadius: "6px",
//           fontWeight: "bold",
//         }}
//       >
//         ☰
//       </span>
//     </div>
//   );
// }

// // 🔹 Main Component
// export default function CategorySorter() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ Fetch categories
//   useEffect(() => {
//     console.log("📡 Fetching categories...");

//     api.get("/admin-dashboard/list-category-all-sort")
//       .then((res) => {
//         console.log("✅ API Response:", res.data);

//         const data = res.data.data || [];
//         setCategories(data);

//         console.log("📦 Categories Loaded:", data);
//       })
//       .catch((err) => {
//         console.error("❌ Fetch Error:", err);
//         alert("Failed to load categories");
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   // ✅ Drag End Handler
//   const handleDragEnd = (event) => {
//     const { active, over } = event;

//     console.log("🟡 Drag Event:", event);

//     // ❗ Prevent crash
//     if (!over) {
//       console.warn("⚠️ Dropped outside");
//       return;
//     }

//     if (active.id === over.id) {
//       console.log("⏭️ Same position, no change");
//       return;
//     }

//     const oldIndex = categories.findIndex(
//       (c) => c.id.toString() === active.id
//     );

//     const newIndex = categories.findIndex(
//       (c) => c.id.toString() === over.id
//     );

//     console.log("🔄 Old Index:", oldIndex, "New Index:", newIndex);

//     if (oldIndex === newIndex) return;

//     const newOrder = arrayMove(categories, oldIndex, newIndex);

//     console.log("📊 New Order:", newOrder);

//     setCategories(newOrder);

//     // 🔥 Prepare payload
//     const payload = newOrder.map((item, index) => ({
//       id: item.id,
//       position: index + 1,
//     }));

//     console.log("📤 Sending Payload:", payload);

//     showLoader("Saving order...");


//     // ✅ API call
//         api.post("/admin-dashboard/update-category-order", { order: payload })
//         .then(() => {
//             closeLoader();
//             showSuccessToast("Order updated");
//         })
//         .catch(() => {
//             closeLoader();
//             showErrorToast("Failed to save order");
//         });
//   };

//   if (loading) return <p>Loading categories...</p>;

//   return (
//     <div style={{ maxWidth: "450px", margin: "auto" }}>
//       <h3 style={{ textAlign: "center" }}>📂 Drag & Drop Categories</h3>

//       <DndContext
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//       >
//         <SortableContext
//           items={categories.map((c) => c.id.toString())}
//           strategy={verticalListSortingStrategy}
//         >
//           {categories.map((category) => (
//             <SortableItem
//               key={category.id}
//               id={category.id.toString()}
//               name={category.name}
//             />
//           ))}
//         </SortableContext>
//       </DndContext>
//     </div>
//   );
// }




import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import {
  showSuccessToast,
  showErrorToast,
  showLoader,
  closeLoader,
} from "../../utils/swal";

import { CSS } from "@dnd-kit/utilities";
import api from "../../api/axios";

// 🔹 Sortable Item Component
function SortableItem({ id, name, isActivePos }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "12px",
    marginBottom: "10px",
    background: isDragging
      ? "#e6f7ff"
      : isActivePos == 0
      ? "#ffe6e6" // 🔴 inactive
      : "#fff",
    border: isActivePos == 0
      ? "1px solid red"
      : "1px solid #ddd",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: isDragging ? "0 6px 15px rgba(0,0,0,0.15)" : "none",
    opacity: isActivePos == 0 ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <span>
        {name}
        {isActivePos == 0 && (
          <span
            style={{
              marginLeft: "8px",
              fontSize: "12px",
              color: "red",
              fontWeight: "bold",
            }}
          >
            (POS OFF)
          </span>
        )}
      </span>

      {/* Drag Handle */}
      <span
        {...attributes}
        {...listeners}
        style={{
          cursor: "grab",
          padding: "6px 10px",
          background: "#f0f0f0",
          borderRadius: "6px",
          fontWeight: "bold",
        }}
      >
        ☰
      </span>
    </div>
  );
}

// 🔹 Main Component
export default function CategorySorter() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch categories
  useEffect(() => {
    api.get("/admin-dashboard/list-category-all-sort")
      .then((res) => {
        const data = res.data.data || [];
        setCategories(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load categories");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ✅ Drag End Handler
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex(
      (c) => c.id.toString() === active.id
    );

    const newIndex = categories.findIndex(
      (c) => c.id.toString() === over.id
    );

    if (oldIndex === newIndex) return;

    const newOrder = arrayMove(categories, oldIndex, newIndex);
    setCategories(newOrder);

    const payload = newOrder.map((item, index) => ({
      id: item.id,
      position: index + 1,
    }));

    showLoader("Saving order...");

    api.post("/admin-dashboard/update-category-order", { order: payload })
      .then(() => {
        closeLoader();
        showSuccessToast("Order updated");
      })
      .catch(() => {
        closeLoader();
        showErrorToast("Failed to save order");
      });
  };

  if (loading) return <p>Loading categories...</p>;

  return (
    <div style={{ maxWidth: "450px", margin: "auto" }}>
      <h3 style={{ textAlign: "center" }}>📂 Drag & Drop Categories</h3>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => (
            <SortableItem
              key={category.id}
              id={category.id.toString()}
              name={category.name}
              isActivePos={category.is_active_pos} // ✅ PASS HERE
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}