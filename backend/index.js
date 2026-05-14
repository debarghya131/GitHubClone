const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

dotenv.config();

yargs(hideBin(process.argv))
  .command("start", "Starts a new server", {}, startServer)
  .command("init", "Initialise a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    }
  )
  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    }
  )
  .command("push", "Push commits to S3", {}, pushRepo)
  .command("pull", "Pull commits from S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Comit ID to revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    }
  )
  .demandCommand(1, "You need at least one command")
  .help().argv;

function startServer() {
  const app = express();
  const port = process.env.PORT || 3002;

  const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_URL;
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOptions = {
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(express.json());

  if (!mongoURI) {
    console.error("MONGODB_URI or MONGODB_URL is required.");
    process.exit(1);
  }

  mongoose
    .connect(mongoURI)
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.error("Unable to connect : ", err));

  app.use("/", mainRouter);

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
      socket.join(userID);
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
  });
}
