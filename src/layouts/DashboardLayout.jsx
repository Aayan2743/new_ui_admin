// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import { useAuth } from "../auth/AuthContext";
// import Sidebar from "./Sidebar";
// import { useAppSettings } from "../context/AppSettingsContext";
// import { useLogoSettings } from "../context/LogoSettingsContext";

// const SIDEBAR_WIDTH = "88px";


// export default function DashboardLayout() {
//   const { user, logout } = useAuth();
//   const { settings } = useAppSettings();
//   const [open, setOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar open={open} setOpen={setOpen} logout={logout} />

//       {open && (
//         <div
//           className="fixed inset-0 bg-black/40 z-30 md:hidden"
//           onClick={() => setOpen(false)}
//         />
//       )}

//       <div className="flex flex-col min-h-screen md:ml-0 lg:ml-[88px] transition-all">
//         {/* HEADER */}
//         <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-20">
//           <button className="md:hidden text-2xl" onClick={() => setOpen(true)}>
//             ☰
//           </button>

//           {/* LOGO + NAME */}
//           <div className="flex items-center gap-2">
//             {settings.logo && (
//               <img
//                 src={settings.logo}
//                 alt="App Logo"
//                 className="h-7 object-contain"
//               />
//             )}
//             <span className="font-bold text-green-700">
//               {settings.app_name || "Application"}
//             </span>
//           </div>

//           {/* USER */}
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
//               {user?.name?.charAt(0) || "A"}
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 p-4 md:p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "./Sidebar";
import { useAppSettings } from "../context/AppSettingsContext";
import { useLogoSettings } from "../context/LogoSettingsContext";

const SIDEBAR_WIDTH = "88px";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { settings } = useAppSettings();
  const { settings: logoSettings } = useLogoSettings(); // ✅ get data from LogoSettingsContext
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={open} setOpen={setOpen} logout={logout} />

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-col min-h-screen md:ml-0 lg:ml-[88px] transition-all">
        {/* HEADER */}
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-20">
          <button className="md:hidden text-2xl" onClick={() => setOpen(true)}>
            ☰
          </button>

          {/* LOGO + NAME */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-green-700">
               {logoSettings?.app_name && (
                <span className="ml-1 text-gray-700">
                   {logoSettings.app_name} -
                </span>
              )}
              Application
            </span>
          </div>

          {/* USER */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
              {user?.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}




