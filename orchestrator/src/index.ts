import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import Docker from "dockerode";
import { serviceConfig as config } from "./service-config";

const app = express();
const port = process.env.PORT || 3000;

console.log("PORT: ", process.env.PORT);
const {
  DEV_TLD: devTld,
  WS_TLD: wsTld,
  DEV_PORT: devPort,
  WS_PORT: wsPort,
} = process.env;

console.log(devTld);
const dockerClient = new Docker({ socketPath: "/var/run/docker.sock" });
/**
 * TODO: Configure cors to allow requests from the frontend
 */
app.use(cors());
app.use(express.json());

/**
 *
 */
app.post("/start", async (req, res) => {
  console.log(req.body);
  const { userId, replId } = req.body;

  const devHost = `${replId}-${userId}.${devTld}`;
  const wsHost = `${replId}-${userId}.${wsTld}`;

  config.Name! = `runner-${replId}-${userId}`;
  config.Labels!["ingress.host"] = wsHost || "";
  config.Labels!["ingress.port"] = wsPort || "";
  config.Labels!["ingress.alt_host"] = devHost || "";
  config.Labels!["ingress.alt_port"] = devPort || "";

  try {
    const service = await dockerClient.createService(config);
    console.log(`Service ${service.id} created successfully.`);
    res.status(200).json({ serviceId: service.id, status: "created" });
  } catch (err: any) {
    console.error(`Error creating service: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.get("/status", (req, res) => {
  res.status(200).json({ status: "running" });
});

app.listen(port, () => {
  console.log("listening on port ", port);
});
