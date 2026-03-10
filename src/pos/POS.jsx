import { useEffect, useState,useRef } from "react";
import CategoryPills from "./components/CategoryPills";
import ProductCard from "./components/ProductCard";
import CartPanel from "./CartPanel";
import VariationModal from "./components/VariationModal";
import api from "../api/axios";

export default function POS() {



  const barcodeInputRef = useRef(null);
const [barcode, setBarcode] = useState("");

  const [openSearch, setOpenSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [category, setCategory] = useState("all");

  const [cart, setCart] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = (products || []).slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  /* ================= LOAD CATEGORIES ================= */


  useEffect(() => {
  barcodeInputRef.current?.focus();
}, []);

// useEffect(() => {
//   let timer;

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       searchByBarcode(barcode);
//       setBarcode("");
//       return;
//     }

//     if (/^[0-9]$/.test(e.key)) {
//       setBarcode((prev) => prev + e.key);

//       clearTimeout(timer);

//       timer = setTimeout(() => {
//         setBarcode("");
//       }, 100);
//     }
//   };

//   window.addEventListener("keydown", handleKeyDown);

//   return () => {
//     window.removeEventListener("keydown", handleKeyDown);
//   };
// }, [barcode]);


// const searchByBarcode = async (code) => {
//   try {
//     const res = await api.get(`/admin-dashboard/product/product-by-barcode/${code}`);

//     const product = res.data;
//     const variant = product.variants[0];

//     const productData = {
//       id: product.id,
//       name: product.name
//     };

//     setSelectedProduct(productData);

//     // pass product manually
//     addVariantToCart(productData, variant);

//   } catch (err) {
//     console.log("Barcode not found");
//   }
// };


const searchByBarcode = async (code) => {
  try {

    const res = await api.get(
      `/admin-dashboard/product/product-by-barcode/${code}`
    );

    const product = res.data;
    const variant = product.variants[0];

    const productData = {
      id: product.id,
      name: product.name
    };

    setSelectedProduct(productData);

    addVariantToCart(productData, variant);

  } catch (err) {

    // 🔴 Handle barcode not found
    if (err.response?.data?.message === "Barcode not found") {
      alert("❌ Barcode not found");
      return;
    }

    // Other errors
    alert("Something went wrong");
    console.error(err);
  }
};


const addVariantToCart = (product, variant) => {

  if (variant.stock <= 0) {
    alert("Out of stock");
    return;
  }

  setCart((prev) => {
    const index = prev.findIndex(
      (i) =>
        i.product_id === product.id &&
        i.variation_id === variant.id
    );

    if (index !== -1) {
      if (prev[index].qty >= variant.stock) {
        alert("Stock limit reached");
        return prev;
      }

      const updated = [...prev];
      updated[index].qty += 1;
      return updated;
    }

    return [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,
        variation_id: variant.id,
        variation_name: variant.name,
        price: variant.price,
        stock: variant.stock,
        qty: 1,
      },
    ];
  });
};

// const handleBarcodeChange = (e) => {
//   const value = e.target.value;

//   if (value.length >= 8) { // barcode length
//     searchByBarcode(value);
//     setBarcode("");
//   } else {
//     setBarcode(value);
//   }
// };

const handleBarcodeKeyDown = (e) => {
  if (e.key === "Enter") {
    const code = e.target.value.trim();

    if (!code) return;

    searchByBarcode(code);
    setBarcode("");

    setTimeout(() => barcodeInputRef.current?.focus(), 50);
  }
};


  useEffect(() => {
    api
      .get("/admin-dashboard/list-category-all")
      .then((r) => setCategories(r.data.data))
      .catch((err) => console.error("Category fetch error:", err));
  }, []);

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when category changes
    api
      .get("/admin-dashboard/pos-products", {
        params: { category }, // removed brand
      })
      .then((r) => setProducts(r.data.data))
      .catch((err) => console.error("Product fetch error:", err));
  }, [category]);

  /* ================= OPEN VARIATION MODAL ================= */
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleSearch = async (value) => {
    setSearchText(value);

    if (!value) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await api.get("/admin-dashboard/pos-products-search", {
        params: { search: value },
      });

      setSearchResults(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const payload = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          variant_combination_id: item.variation_id,
          quantity: item.qty,
        })),
        payment_method: "cash",
        paid_amount: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        customer_name: "Walk-in Customer",
      };

      const res = await api.post("/admin-dashboard/create-order", payload);

      alert("Order placed successfully ✅");

      // Clear cart
      setCart([]);

      // Refresh products (stock updated)
      const refresh = await api.get("/admin-dashboard/pos-products", {
        params: { category },
      });

      setProducts(refresh.data.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Order failed");
    }
  };

  /* ================= ADD VARIANT TO CART ================= */
  const handleAddVariant = (variant) => {
    if (!selectedProduct) return;

    if (variant.stock <= 0) {
      alert("Out of stock");
      return;
    }

    setCart((prev) => {
      const index = prev.findIndex(
        (i) =>
          i.product_id === selectedProduct.id && i.variation_id === variant.id,
      );

      // Already in cart → increase qty
      if (index !== -1) {
        if (prev[index].qty >= variant.stock) {
          alert("Stock limit reached");
          return prev;
        }

        const updated = [...prev];
        updated[index].qty += 1;
        return updated;
      }

      // Add new item
      return [
        ...prev,
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          variation_id: variant.id,
          variation_name: variant.name,
          price: variant.price,
          stock: variant.stock,
          qty: 1,
        },
      ];
    });

    setOpenModal(false);
  };

  return (


    
    <div className="h-screen flex bg-gray-100">



      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* CATEGORY FILTER */}
        <CategoryPills
          items={categories}
          active={category}
          onChange={setCategory}
        />

        <div className="flex justify-end">
          <button
            onClick={() => setOpenSearch(true)}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            🔍 Search Product
          </button>
        </div>


        <div className="flex justify-between items-center">
<input
  ref={barcodeInputRef}
  value={barcode}
  onChange={(e)=>setBarcode(e.target.value)}
  onKeyDown={handleBarcodeKeyDown}
  placeholder="Scan barcode..."
  className="border p-2 rounded-lg w-64"
  autoFocus
/>

  {/* <button
    onClick={() => setOpenSearch(true)}
    className="px-4 py-2 bg-black text-white rounded-lg"
  >
    🔍 Search Product
  </button> */}
</div>

        {/* PRODUCTS GRID */}
        <div className="flex-1 grid grid-cols-6 gap-1 overflow-y-auto">
          {paginatedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => handleProductClick(p)}
            />
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              ◀ Prev
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 rounded-lg border transition ${
                    currentPage === i + 1
                      ? "bg-black text-white border-black"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              Next ▶
            </button>
          </div>
        )}
      </div>


     

      {openSearch && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] rounded-xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Search Product</h2>

              <button
                onClick={() => setOpenSearch(false)}
                className="text-red-500 font-bold"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Search product..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border p-2 rounded-lg mb-3"
            />

            <div className="max-h-[300px] overflow-y-auto">
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    handleProductClick(p);
                    setOpenSearch(false);
                  }}
                  className="p-2 border-b cursor-pointer hover:bg-gray-100"
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CART PANEL */}
      <CartPanel cart={cart} setCart={setCart} onCheckout={handleCheckout} />

      {/* VARIATION MODAL */}
      <VariationModal
        open={openModal}
        product={selectedProduct}
        onClose={() => setOpenModal(false)}
        onConfirm={handleAddVariant}
      />
    </div>
  );
}
