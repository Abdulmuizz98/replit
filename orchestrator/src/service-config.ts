import { CreateServiceOptions } from "dockerode";

const env = process.env;
const envVar = [
  `AWS_ACCESS_KEY_ID=${env.AWS_ACCESS_KEY_ID}`,
  `AWS_SECRET_ACCESS_KEY=${env.AWS_SECRET_ACCESS_KEY}`,
  `AWS_REGION=${env.AWS_REGION}`,
  `AWS_S3_BUCKET_NAME=${env.AWS_S3_BUCKET_NAME}`,
];

export const serviceConfig: CreateServiceOptions = {
  Name: "",
  TaskTemplate: {
    ContainerSpec: {
      Image: "oraio/runner:latest",
      Env: envVar,
    },
    Resources: {
      Limits: {
        NanoCPUs: 300000000, // 0.3 CPUs
        MemoryBytes: 300 * 1024 * 1024, // 300MB
      },
      Reservations: {
        NanoCPUs: 200000000, // 0.2 CPUs
        MemoryBytes: 200 * 1024 * 1024, // 200MB
      },
    },
    RestartPolicy: {
      Condition: "on-failure",
    },
  },
  Mode: {
    Replicated: {
      Replicas: 1,
    },
  },
  UpdateConfig: {
    Order: "start-first",
    Parallelism: 2,
    Delay: 10 * 1000 * 1000000, // 10 seconds in nanoseconds
  },
  EndpointSpec: {
    Ports: [
      {
        Protocol: "tcp",
        TargetPort: 3000,
      },
      {
        Protocol: "tcp",
        TargetPort: 8000,
      },
    ],
  },
  Labels: {
    "ingress.host": "",
    "ingress.port": "",
    "ingress.alt_host": "",
    "ingress.alt_port": "",
    "ingress.virtual_proto": "http",
    "ingress.ssl": "enable",
    "ingress.ssl_redirect": "enable",
  },
  Networks: [
    {
      Target: "ingress-routing",
    },
  ],
};
