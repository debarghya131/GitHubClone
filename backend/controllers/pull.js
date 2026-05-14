const fs = require("fs").promises;
const path = require("path");
const { GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: "commits/",
      })
    );

    const objects = data.Contents || [];

    for (const object of objects) {
      const key = object.Key;
      const commitDir = path.join(
        commitsPath,
        path.dirname(key).split("/").pop()
      );

      await fs.mkdir(commitDir, { recursive: true });

      const params = {
        Bucket: S3_BUCKET,
        Key: key,
      };

      const fileContent = await s3.send(new GetObjectCommand(params));
      const bodyBytes = await fileContent.Body.transformToByteArray();
      await fs.writeFile(path.join(repoPath, key), Buffer.from(bodyBytes));
    }

    console.log("All commits pulled from S3.");
  } catch (err) {
    console.error("Unable to pull : ", err);
  }
}

module.exports = { pullRepo };
