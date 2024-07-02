import { useSearchParams, useParams } from "react-router-dom";

export const Output = () => {
  let { userId } = useParams();

  if (!userId || !userId.startsWith("@")) {
    return <div>Invalid userId</div>;
  }
  userId = userId.slice(1).toLowerCase();
  const DEV_TLD = "replx-dev.oraio.tech";
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";
  const INSTANCE_URI = `https://${replId}-${userId}.${DEV_TLD}`;

  // const INSTANCE_URI = `http://localhost:8000`;

  return (
    <div style={{ height: "40vh", background: "white" }}>
      <iframe width={"100%"} height={"100%"} src={`${INSTANCE_URI}`} />
    </div>
  );
};
