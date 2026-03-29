// // "use client";

// // import { useState } from "react";
// // import api from "../api/axios";

// // export default function CreateTemplate({ onSuccess, onClose }) {
// //   const [name, setName] = useState("");
// //   const [image, setImage] = useState(null);
// //   const [preview, setPreview] = useState("");
// //   const [loading, setLoading] = useState(false);

// //   // 📤 HANDLE UPLOAD
// //   const handleUpload = async () => {
// //     if (!name.trim()) {
// //       return alert("Please enter template name");
// //     }

// //     if (!image) {
// //       return alert("Please select image");
// //     }

// //     try {
// //       setLoading(true);

// //       const formData = new FormData();
// //       formData.append("name", name);
// //       formData.append("image", image);

// //       const res = await api.post(
// //         "/admin-dashboard/create-card-template",
// //         formData,
// //         {
// //           headers: {
// //             "Content-Type": "multipart/form-data",
// //           },
// //         },
// //       );

// //       // ✅ IMPORTANT: send correct data to parent
// //       onSuccess({
// //         id: res.data.id,
// //         image: res.data.image,
// //       });
// //     } catch (err) {
// //       console.error(err);
// //       alert("Failed to create template");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="p-6 max-w-[500px] mx-auto bg-white rounded-xl shadow space-y-4">
// //       <h2 className="text-xl font-semibold">Create Template</h2>

// //       {/* TEMPLATE NAME */}
// //       <div>
// //         <label className="text-sm font-medium">Template Name</label>
// //         <input
// //           type="text"
// //           placeholder="Enter template name"
// //           value={name}
// //           onChange={(e) => setName(e.target.value)}
// //           className="input w-full mt-1"
// //         />
// //       </div>

// //       {/* IMAGE UPLOAD */}
// //       <div>
// //         <label className="text-sm font-medium">Upload Background Image</label>
// //         <input
// //           type="file"
// //           accept="image/*"
// //           onChange={(e) => {
// //             const file = e.target.files[0];
// //             if (!file) return;

// //             setImage(file);
// //             setPreview(URL.createObjectURL(file));
// //           }}
// //           className="input w-full mt-1"
// //         />
// //       </div>

// //       {/* PREVIEW */}
// //       {preview && (
// //         <div className="border rounded-lg p-2">
// //           <p className="text-sm mb-1">Preview:</p>
// //           <img
// //             src={preview}
// //             alt="Preview"
// //             className="w-full h-[200px] object-contain"
// //           />
// //         </div>
// //       )}

// //       {/* ACTION BUTTONS */}
// //       <div className="flex justify-end gap-3 pt-4">
// //         <button onClick={onClose} className="px-4 py-2 border rounded-lg">
// //           Cancel
// //         </button>

// //         <button
// //           onClick={handleUpload}
// //           disabled={loading}
// //           className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
// //         >
// //           {loading ? "Uploading..." : "Create Template"}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState } from "react";

// export default function CreateTemplate({ onSuccess, onClose }) {
//   const [name, setName] = useState("");
//   const [preview, setPreview] = useState("");
//   const [imageFile, setImageFile] = useState(null);

//   const handleCreate = () => {
//     if (!name.trim()) {
//       return alert("Please enter template name");
//     }

//     if (!imageFile) {
//       return alert("Please select image");
//     }

//     // ✅ LOCAL DATA (NO API)
//     const localTemplate = {
//       id: Date.now(), // fake ID
//       name: name,
//       image: preview, // use preview as background
//     };

//     console.log("Local Template:", localTemplate);

//     // 👉 send to parent (like API response)
//     onSuccess(localTemplate);
//   };

//   return (
//     <div className="p-6 max-w-[500px] mx-auto bg-white rounded-xl shadow space-y-4">
//       <h2 className="text-xl font-semibold">Create Template</h2>

//       {/* TEMPLATE NAME */}
//       <div>
//         <label className="text-sm font-medium">Template Name</label>
//         <input
//           type="text"
//           placeholder="Enter template name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="input w-full mt-1"
//         />
//       </div>

//       {/* IMAGE UPLOAD */}
//       <div>
//         <label className="text-sm font-medium">Upload Background Image</label>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => {
//             const file = e.target.files[0];
//             if (!file) return;

//             setImageFile(file);
//             setPreview(URL.createObjectURL(file));
//           }}
//           className="input w-full mt-1"
//         />
//       </div>

//       {/* PREVIEW */}
//       {preview && (
//         <div className="border rounded-lg p-2">
//           <p className="text-sm mb-1">Preview:</p>
//           <img
//             src={preview}
//             alt="Preview"
//             className="w-full h-[200px] object-contain"
//           />
//         </div>
//       )}

//       {/* ACTION BUTTONS */}
//       <div className="flex justify-end gap-3 pt-4">
//         <button onClick={onClose} className="px-4 py-2 border rounded-lg">
//           Cancel
//         </button>

//         <button
//           onClick={handleCreate}
//           className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
//         >
//           Create Template
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";

export default function CreateTemplate({ onSuccess, onClose }) {
  const [name, setName] = useState("");

  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return alert("Enter name");
    if (!frontPreview) return alert("Select front image");
    if (!backPreview) return alert("Select back image");

    // ✅ LOCAL DATA
    const localTemplate = {
      id: Date.now(),
      name: name,
      image: frontPreview, // front
      backImage: backPreview, // ✅ back
    };

    console.log(localTemplate);

    onSuccess(localTemplate);
  };

  return (
    <div className="p-6 max-w-[500px] mx-auto bg-white rounded-xl shadow space-y-4">
      <h2 className="text-xl font-semibold">Create Template</h2>

      {/* NAME */}
      <input
        placeholder="Template Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input w-full"
      />

      {/* FRONT IMAGE */}
      <div>
        <label className="text-sm">Front Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) setFrontPreview(URL.createObjectURL(file));
          }}
        />

        {frontPreview && <img src={frontPreview} className="h-32 mt-2" />}
      </div>

      {/* BACK IMAGE */}
      <div>
        <label className="text-sm">Back Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) setBackPreview(URL.createObjectURL(file));
          }}
        />

        {backPreview && <img src={backPreview} className="h-32 mt-2" />}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="border px-4 py-2">
          Cancel
        </button>

        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2"
        >
          Create
        </button>
      </div>
    </div>
  );
}
