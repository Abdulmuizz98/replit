import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { TerminalManager } from "./pty";
import { fetchContent, fetchDir, removeFile, writeToFile } from "./fs";
import { uploadDirToS3 } from "./s3";

const terminalManager = new TerminalManager();

export async function initWs(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("connected");
    const host = socket.handshake.headers.host as string;
    console.log("host is: ", host);
    const replId = host.split(".")[0].split("-")[0];
    console.log("replId is: ", replId);
    const userId = host.split(".")[0].split("-")[1];
    console.log("userId is: ", userId);

    if (!replId || !userId) {
      socket.disconnect();
      terminalManager.clear(socket.id);
      return;
    }
    fetchDir("/workspace/")
      .then((rootContent) => {
        console.log("rootContent: ", rootContent);
        socket.emit("loaded", { rootContent });
      })
      .catch((err) => {
        console.log("Error fetching worskpace: ", err);
        socket.disconnect();
      });

    socket.on("disconnect", async () => {
      console.log(`user ${userId} disconnected`);
      await uploadDirToS3(`Code/${userId}/${replId}/`, "/workspace/")
        .then(() =>
          // TODO: Create a system that only uploads changed files instead to minimize upload Cost
          console.log("Uploading workspace successful")
        )
        .catch((err) => {
          console.log("Error on backing up workpace after disconnect: ", err);
        });
    });

    socket.on("fetchContent", async (filePath, callback) => {
      // console.log("filepath: ", filePath);
      const content = await fetchContent(filePath);
      callback(content.toString());
      // console.log("content: ", content);
    });

    socket.on("fetchDir", (dirPath, callback) => {
      const files = fetchDir(dirPath);
      callback({ files, dirPath });
      // socket.emit("dirData", { files, dirPath });
    });

    socket.on("updateContent", ({ path, content }) => {
      const dirPath = path.split("/").slice(0, -1).join("/") + "/";
      const fileName = path.split("/").pop();
      writeToFile(dirPath, fileName, content);
    });

    socket.on("getTerminal", () => {
      terminalManager.createPty(socket.id, replId, (data, id) => {
        socket.emit("ptyData", { data });
        // console.log("result: ", data);
      });
    });

    socket.on("xtermData", ({ data }) => {
      terminalManager.write(socket.id, data);
      // console.log("data: ", data);
    });

    socket.on("createFile", (dirPath: string, fileName: string) => {
      writeToFile(dirPath, fileName, "");
    });

    socket.on("removeFile", (dirPath: string, fileName: string) => {
      const filePath = dirPath + fileName;
      removeFile(filePath);
    });
  });
}
