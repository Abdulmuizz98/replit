import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Editor } from "./Editor";
import { useParams } from "react-router-dom";
import { File, RemoteFile, Type } from "./external/editor/utils/file-manager";
import { useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { Output } from "./Output";
import { TerminalComponent as Terminal } from "./Terminal";
import axios from "axios";
import { PiFileSqlThin } from "react-icons/pi";

function useSocket(replId: string) {
  const WS_TLD = "replx.oraio.tech";
  let { userId } = useParams();

  if (!userId || !userId.startsWith("@")) {
    return <div>Invalid userId</div>;
  }
  userId = userId.slice(1);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`wss://${replId}-${userId}.${WS_TLD}`);
    // const newSocket = io(`ws://localhost:3001`);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [replId, userId]);

  return socket;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end; /* Aligns children (button) to the right */
  padding: 10px; /* Adds some space around the button */
`;

const Workspace = styled.div`
  display: flex;
  margin: 0;
  font-size: 16px;
  width: 100%;
`;

const LeftPanel = styled.div`
  flex: 1;
  width: 60%;
`;

const RightPanel = styled.div`
  flex: 1;
  width: 40%;
`;

export const CodingPage = () => {
  let { userId } = useParams();

  if (!userId || !userId.startsWith("@")) {
    return <div>Invalid userId</div>;
  }
  userId = userId.slice(1).toLowerCase();
  const WS_TLD = "replx.oraio.tech";
  const [podCreated, setPodCreated] = useState(false);
  const [podRunning, setPodRunning] = useState(false);
  const [workspaceSet, setWorkspaceSet] = useState(false);
  const [searchParams] = useSearchParams();
  const ORCHESTRATOR_URL = "http://localhost:3002";

  const replId = searchParams.get("replId") ?? "";
  const RUNNER_URL = `https://${replId}-${userId}.${WS_TLD}`;

  async function isPodRunning() {
    try {
      const res = await axios.get(`${RUNNER_URL}/status`);
      return res.status === 200;
    } catch (err) {
      return false;
    }
  }
  async function setupWorkspace() {
    try {
      console.log("here");
      const res = await axios.post(`${RUNNER_URL}/setup`, { userId, replId });
      return res.status === 200;
    } catch (err) {
      return false;
    }
  }
  console.log("podCreated: ", podCreated);
  console.log("podRunning: ", podRunning);
  console.log("Workspace: ", workspaceSet);
  useEffect(() => {
    if (replId) {
      axios
        .post(`${ORCHESTRATOR_URL}/start`, { userId, replId })
        .then((res) => {
          console.log("status: ", res.status);
          if (res.status === 200) {
            console.log(res.data);
            setPodCreated(true);
          } else {
            throw new Error(res.data.error);
          }
        })
        .catch((err) => {
          if (err.response.status === 400) {
            // /start returns 400 when the service already exists
            setPodCreated(true);
          }
          console.error(err);
        });
    }
  }, []);

  useEffect(() => {
    async function ensurePodIsRunning(delay: number, retries: number) {
      let result = false;

      for (let i = 0; i < retries; i++) {
        await new Promise((resolve) => setTimeout(resolve, delay)); // 2 seconds delay
        result = await isPodRunning();
        if (result) return true;
      }
      return result;
    }

    if (podCreated) {
      const res = ensurePodIsRunning(2000, 10);
      res.then((result) => {
        if (result) {
          setPodRunning(true);
        } else {
          console.log("Pod Created but not running yet");
        }
      });
    }
  }, [podCreated]);

  useEffect(() => {
    if (podRunning) {
      setupWorkspace().then((result) => {
        if (result) {
          console.log("Workspace setup completed");
          setWorkspaceSet(true);
        } else {
          console.log("Workspace setup failed");
        }
      });
    }
  }, [podRunning]);

  if (!replId) {
    return <div>Not found</div>;
  }

  if (!podCreated || !podRunning || !workspaceSet) {
    return <>Booting...</>;
  }
  return <CodingPagePostPodCreation />;
};

export const CodingPagePostPodCreation = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";
  const [loaded, setLoaded] = useState(false);
  const socket = useSocket(replId);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on("loaded", ({ rootContent }: { rootContent: RemoteFile[] }) => {
        console.log("rootContent: ", rootContent);
        setLoaded(true);
        setFileStructure(rootContent);
      });
    }
  }, [socket]);
  console.log("fileStructure: ", fileStructure);

  const onSelect = (file: File) => {
    if (file.type === Type.DIRECTORY) {
      socket?.emit("fetchDir", file.path, (data: RemoteFile[]) => {
        setFileStructure((prev) => {
          const allFiles = [...prev, ...data];
          return allFiles.filter(
            (file, index, self) =>
              index === self.findIndex((f) => f.path === file.path)
          );
        });
      });
    } else {
      socket?.emit("fetchContent", file.path, (data: string) => {
        file.content = data;
        setSelectedFile(file);
      });
    }
  };

  if (!loaded) {
    return "Loading...";
  }

  return (
    <Container>
      <ButtonContainer>
        <button onClick={() => setShowOutput(!showOutput)}>See output</button>
      </ButtonContainer>
      <Workspace>
        <LeftPanel>
          <Editor
            socket={socket}
            selectedFile={selectedFile}
            onSelect={onSelect}
            files={fileStructure}
          />
        </LeftPanel>
        <RightPanel>
          {showOutput && <Output />}
          <Terminal socket={socket} />
        </RightPanel>
      </Workspace>
    </Container>
  );
};
