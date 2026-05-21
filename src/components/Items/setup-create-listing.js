const fs = require("node:fs")
const path = require("node:path")

const dirPath = path.join(__dirname, "CreateListing")

// Create directory
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true })
  console.log(`Created directory: ${dirPath}`)
}

// Create files
const files = {
  "Step1BasicInfo.tsx": `export default function Step1BasicInfo() {
  return <div>Step 1: Basic Info</div>;
}`,
  "Step2Description.tsx": `export default function Step2Description() {
  return <div>Step 2: Description</div>;
}`,
  "Step3Images.tsx": `export default function Step3Images() {
  return <div>Step 3: Images</div>;
}`,
  "Step4Review.tsx": `export default function Step4Review() {
  return <div>Step 4: Review</div>;
}`,
}

Object.entries(files).forEach(([filename, content]) => {
  const filePath = path.join(dirPath, filename)
  fs.writeFileSync(filePath, content)
  console.log(`Created file: ${filePath}`)
})

console.log("Setup complete!")
