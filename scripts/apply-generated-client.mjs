import { copyFile, rm } from "node:fs/promises"
import path from "node:path"

const projectRoot = process.cwd()
const tempDir = path.join(projectRoot, ".openapi-client-tmp")
const targetDir = path.join(projectRoot, "src", "client")

const generatedFiles = ["schemas.gen.ts", "sdk.gen.ts", "types.gen.ts"]

async function copyGeneratedFiles() {
  for (const fileName of generatedFiles) {
    const source = path.join(tempDir, fileName)
    const target = path.join(targetDir, fileName)
    await copyFile(source, target)
  }
}

async function cleanupTempDir() {
  await rm(tempDir, { recursive: true, force: true })
}

async function run() {
  try {
    await copyGeneratedFiles()
    console.log("Updated client files:", generatedFiles.join(", "))
  } finally {
    await cleanupTempDir()
  }
}

run().catch((error) => {
  console.error("Failed to apply generated client files:", error)
  process.exit(1)
})
