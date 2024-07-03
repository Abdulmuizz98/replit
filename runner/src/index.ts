import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initWs } from "./ws";
import { getS3Folder } from "./s3";
import { readdir } from "fs/promises";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

(async () => {
  await initWs(httpServer);
})();

app.post("/setup", async (req, res) => {
  const { userId, replId } = req.body;

  if (!userId || !replId)
    res.status(400).json({ message: "Provide userId as well as replId" });

  try {
    const prefix = `Code/${userId}/${replId}/`;
    await getS3Folder(prefix, "/workspace/");
    console.log("/workspace setup successfully");
    res.status(200).json({ status: "Workspace correctly setup" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Workspace setup failed. Try again" });
  }
});
app.get("/status", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
