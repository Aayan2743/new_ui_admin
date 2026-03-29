import { useNavigate } from "react-router-dom";
import CreateTemplate from "./CreateTemplate";

export default function CreateTemplatePage() {
  const navigate = useNavigate();

  return (
    <CreateTemplate
      onClose={() => navigate("/templates")}
      onSuccess={(data) => {
        // 👉 go to builder page
        navigate(`/templates/builder/${data.id}`, {
          state: {
            image: data.image,
            backImage: data.backImage, // ✅ add this
          },
        });
      }}
    />
  );
}
