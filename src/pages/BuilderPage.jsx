// import { useParams, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import CardFieldBuilder from "./CardFieldBuilder";

// export default function BuilderPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [template, setTemplate] = useState(null);

//   useEffect(() => {
//     api
//       .get(`/admin-dashboard/get-template/${id}`)
//       .then((res) => setTemplate(res.data))
//       .catch(() => alert("Failed to load template"));
//   }, [id]);

//   if (!template) {
//     return <div className="p-6">Loading...</div>;
//   }

//   return (
//     <CardFieldBuilder
//       templateId={template.id}
//       templateImage={template.image}
//       onClose={() => navigate("/templates")}
//       reload={() => {}}
//     />
//   );
// }

import { useLocation, useNavigate } from "react-router-dom";
import CardFieldBuilder from "./CardFieldBuilder";

export default function BuilderPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const template = location.state;

  if (!template) {
    return <div>No template found</div>;
  }

  return (
    <CardFieldBuilder
      templateId={template.id}
      templateImage={template.image}
      templateBackImage={template.backImage}
      onClose={() => navigate("/templates")}
      reload={() => {}}
    />
  );
}
