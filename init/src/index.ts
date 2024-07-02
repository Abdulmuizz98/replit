import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { createServer } from "http";
import "./connection";
import { Repl } from "./models/repls";
import { copyS3ToS3 } from "./s3";
import { startSession } from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;
const httpServer = createServer(app);

app.post("/project", async (req, res) => {
  const { userId, name } = req.body;

  if (!userId || !name)
    res.status(400).json({ message: "Provide userId as well as replId" });

  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      const repl = new Repl({ userId, name });
      await repl.save();
      await copyS3ToS3("base/nodejs/", `Code/${userId}/${repl._id}/`);

      res.status(200).json({
        status: "Repl created successfully",
        name: repl.name,
        _id: repl._id,
        userId: repl.userId,
      });
    });
  } catch (err: any) {
    if (err.message.includes("duplicate key error")) {
      res.status(400).json({ message: "Repl with this name already exists" });
    } else {
      res.status(500).json({ message: err.message });
    }
  } finally {
    await session.endSession();
  }
});

app.get("/repls/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const repls = await Repl.find({ userId });
    res.status(200).json(repls);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
