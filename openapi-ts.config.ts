import path from "node:path"
import { defineConfig } from "@hey-api/openapi-ts"
import * as dotenv from "dotenv"

const _envResult = dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const apiUrl = process.env.VITE_API_URL?.trim()
const _normalizedApiBase = (apiUrl || "http://localhost:8000")
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/i, "")

const openApiInput =
  process.env.OPENAPI_JSON_URL?.trim() || "openapi.json" || "openapi.json"

export default defineConfig({
  input: openApiInput,
  output: "./.openapi-client-tmp",

  plugins: [
    "legacy/axios",
    {
      name: "@hey-api/sdk",
      // NOTE: this doesn't allow tree-shaking
      asClass: true,
      operationId: true,
      classNameBuilder: "{{name}}Service",
      methodNameBuilder: (operation) => {
        // @ts-expect-error
        let name: string = operation.name
        // @ts-expect-error
        const service: string = operation.service

        if (service && name.toLowerCase().startsWith(service.toLowerCase())) {
          name = name.slice(service.length)
        }

        return name.charAt(0).toLowerCase() + name.slice(1)
      },
    },
    {
      name: "@hey-api/schemas",
      type: "json",
    },
    {
      name: "@hey-api/typescript",
      enums: "javascript",
    },
  ],
})
