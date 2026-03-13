import { useEffect, useState } from "react";
import api from "../api/axios";
import useDynamicTitle from "../hooks/useDynamicTitle";

export default function BulkVariantImages() {
  useDynamicTitle("Product & Variant Images");

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [variantImages, setVariantImages] = useState({});
  const [productImages, setProductImages] = useState({});

  const [previewVariantImages, setPreviewVariantImages] = useState({});
  const [previewProductImages, setPreviewProductImages] = useState({});

  const [barcodePopup, setBarcodePopup] = useState(false);
  const [barcodeList, setBarcodeList] = useState([]);

  const [uploading, setUploading] = useState(false);

  /* ================= FETCH ================= */

  const openBarcodePopup = (variant) => {
    setBarcodeList(variant.barcodes || []);
    setBarcodePopup(true);
  };

  const closeBarcodePopup = () => {
    setBarcodePopup(false);
  };

  const printSingleBarcode = async (barcode) => {
    const res = await api.get(
      `/admin-dashboard/product/print-single-barcode/${barcode}`,
      { responseType: "text" },
    );

    sendToPrinter(res.data);
  };

  const printBarcode = async (variantId) => {
    const res = await api.get(
      `/admin-dashboard/product/print-barcode/${variantId}`,
      {
        responseType: "text",
      },
    );

    const tspl = res.data;

    sendToPrinter(tspl);
  };

  const sendToPrinter = async (tspl) => {
    try {
      if (!window.qz) {
        alert("QZ Tray not loaded");
        return;
      }

      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
      }

      //  const printers = await qz.printers.find();

      const printer = await qz.printers.find("4BARCODE 4B-2054TB");
      console.log("Available printers:", printer);

      const config = qz.configs.create(printer);

      await qz.print(config, [tspl]);
    } catch (error) {
      console.error("Print error:", error);
      alert("Printer error");
    }
  };
  const fetchVariants = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin-dashboard/product-variants", {
        params: { search: query, page, perPage },
      });

      setVariants(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [query, page]);

  /* ================= SELECT IMAGES ================= */

  const handleVariantImageChange = (variantId, files) => {
    const fileArray = Array.from(files);

    setVariantImages((prev) => ({
      ...prev,
      [variantId]: fileArray,
    }));

    const previews = fileArray.map((file) => URL.createObjectURL(file));

    setPreviewVariantImages((prev) => ({
      ...prev,
      [variantId]: previews,
    }));
  };

  const handleProductImageChange = (productId, files) => {
    const fileArray = Array.from(files);

    setProductImages((prev) => ({
      ...prev,
      [productId]: fileArray,
    }));

    const previews = fileArray.map((file) => URL.createObjectURL(file));

    setPreviewProductImages((prev) => ({
      ...prev,
      [productId]: previews,
    }));
  };

  /* ================= DELETE ================= */

  const deleteVariantImage = async (id) => {
    if (!window.confirm("Delete variant image?")) return;

    try {
      await api.delete(`/admin-dashboard/delete-variant-image/${id}`);
      fetchVariants();
    } catch {
      alert("Delete failed");
    }
  };

  const deleteProductImage = async (id) => {
    if (!window.confirm("Delete product image?")) return;

    try {
      await api.delete(`/admin-dashboard/delete-product-image/${id}`);
      fetchVariants();
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= UPLOAD ================= */
  const generateBarcode = async () => {
    try {
      const res = await api.get(
        `/admin-dashboard/product/generate-old-barcodes`,
      );

      alert(res.data.message || "Barcodes generated");

      fetchVariants(); // refresh table
    } catch (err) {
      console.error(err);
      alert("Failed to generate barcodes");
    }
  };

  const uploadImages = async () => {
    const formData = new FormData();

    Object.entries(variantImages).forEach(([variantId, files]) => {
      files.forEach((file) => {
        formData.append(`variant_images[${variantId}][]`, file);
      });
    });

    Object.entries(productImages).forEach(([productId, files]) => {
      files.forEach((file) => {
        formData.append(`product_images[${productId}][]`, file);
      });
    });

    try {
      setUploading(true);

      const res = await api.post(
        "/admin-dashboard/bulk-product-variant-images",
        formData,
      );

      alert(`Uploaded ${res.data.uploaded} images`);

      setVariantImages({});
      setProductImages({});
      setPreviewVariantImages({});
      setPreviewProductImages({});

      fetchVariants();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Product & Variant Image Manager
        </h1>

        <div className="flex gap-2">
          <input
            placeholder="Search product or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setQuery(search);
                setPage(1);
              }
            }}
            className="border px-3 py-2 rounded-lg"
          />

          <button
            onClick={() => {
              setQuery(search);
              setPage(1);
            }}
            className="bg-gray-100 border px-4 py-2 rounded-lg"
          >
            Search
          </button>

          <button
            onClick={() => {
              setSearch("");
              setQuery("");
              setPage(1);
            }}
            className="bg-red-100 border px-4 py-2 rounded-lg"
          >
            Reset
          </button>

          <button
            onClick={() => generateBarcode()}
            className="bg-yellow-100 px-3 py-1 rounded text-xs"
          >
            Generate
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Barcodes</th>
              <th className="px-4 py-3">Product Images</th>
              <th className="px-4 py-3">Variant Images</th>
              <th className="px-4 py-3">Upload</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              variants.map((v, i) => (
                <tr key={v.id} className="border-t">
                  <td className="px-4 py-3">{(page - 1) * perPage + i + 1}</td>

                  <td className="px-4 py-3 font-medium">{v.product_name}</td>

                  <td className="px-4 py-3">
                    {v.variation_values?.join(" / ") || "-"}
                  </td>

                  <td className="px-4 py-3">{v.sku}</td>
                  <td className="px-4 py-3">{v.qty ?? "-"}</td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openBarcodePopup(v)}
                        className="bg-indigo-100 px-3 py-1 rounded text-xs"
                      >
                        View
                      </button>

                      <button
                        onClick={() => printBarcode(v.id)}
                        className="bg-green-100 px-3 py-1 rounded text-xs"
                      >
                        Print
                      </button>
                    </div>
                  </td>

                  {/* PRODUCT IMAGES */}

                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {v.product_images?.map((img) => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.url}
                            className="w-12 h-12 object-cover border rounded"
                          />

                          <button
                            onClick={() => deleteProductImage(img.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    {previewProductImages[v.product_id] && (
                      <div className="flex gap-2 mt-2">
                        {previewProductImages[v.product_id].map((p, i) => (
                          <img
                            key={i}
                            src={p}
                            className="w-12 h-12 border rounded"
                          />
                        ))}
                      </div>
                    )}
                  </td>

                  {/* VARIANT IMAGES */}

                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {v.variant_images?.map((img) => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.url}
                            className="w-12 h-12 object-cover border rounded"
                          />

                          <button
                            onClick={() => deleteVariantImage(img.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    {previewVariantImages[v.id] && (
                      <div className="flex gap-2 mt-2">
                        {previewVariantImages[v.id].map((p, i) => (
                          <img
                            key={i}
                            src={p}
                            className="w-12 h-12 border rounded"
                          />
                        ))}
                      </div>
                    )}
                  </td>

                  {/* UPLOAD */}

                  {/* <td className="px-4 py-3">

                  <div className="space-y-2">

                    <input
                      type="file"
                      multiple
                      onChange={(e)=>handleProductImageChange(
                        v.product_id,
                        e.target.files
                      )}
                    />

                    <input
                      type="file"
                      multiple
                      onChange={(e)=>handleVariantImageChange(
                        v.id,
                        e.target.files
                      )}
                    />

                  </div>

                </td> */}

                  <div className="flex flex-col gap-2">
                    {/* PRODUCT IMAGE UPLOAD */}

                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border px-3 py-2 rounded text-sm flex items-center justify-center">
                      📦 Product Images
                      <input
                        type="file"
                        multiple
                        hidden
                        onChange={(e) =>
                          handleProductImageChange(v.product_id, e.target.files)
                        }
                      />
                    </label>

                    {productImages[v.product_id] && (
                      <span className="text-xs text-gray-500">
                        {productImages[v.product_id].length} selected
                      </span>
                    )}

                    {/* VARIANT IMAGE UPLOAD */}

                    <label className="cursor-pointer bg-indigo-100 hover:bg-indigo-200 border px-3 py-2 rounded text-sm flex items-center justify-center">
                      🎨 Variant Images
                      <input
                        type="file"
                        multiple
                        hidden
                        onChange={(e) =>
                          handleVariantImageChange(v.id, e.target.files)
                        }
                      />
                    </label>

                    {variantImages[v.id] && (
                      <span className="text-xs text-gray-500">
                        {variantImages[v.id].length} selected
                      </span>
                    )}
                  </div>
                </tr>
              ))}
          </tbody>
        </table>

        {/* PAGINATION */}

        <div className="flex justify-center gap-2 py-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-indigo-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>

      {/* UPLOAD BUTTON */}

      <div className="flex justify-end">
        <button
          onClick={uploadImages}
          disabled={uploading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
      </div>

      {barcodePopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] max-h-[500px] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Barcodes</h2>

              <button onClick={closeBarcodePopup} className="text-red-500">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm">
              {barcodeList.length === 0 && <p>No barcodes</p>}

              {/* {barcodeList.map((b, i) => (
                <div key={i} className="border px-3 py-2 rounded">
                  {b}
                </div>
              ))} */}

              {barcodeList.map((b, i) => (
                <div
                  key={i}
                  className="border px-3 py-2 rounded flex justify-between items-center"
                >
                  <span>{b}</span>

                  <button
                    onClick={() => printSingleBarcode(b)}
                    className="bg-green-100 px-3 py-1 rounded text-xs"
                  >
                    Print
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
