import { CreateServiceOptions } from "dockerode";

export const serviceConfig: CreateServiceOptions = {
  Name: "",
  TaskTemplate: {
    ContainerSpec: {
      Image: "oraio/runner-test:latest",
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
        TargetPort: 3001,
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
