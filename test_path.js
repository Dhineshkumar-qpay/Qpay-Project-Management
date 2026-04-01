import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("CWD:", process.cwd());
console.log("__dirname:", __dirname);
const rootResolve = path.resolve(__dirname, '..', '..', '..');
console.log("Root Resolve:", rootResolve);

const uploadDirCwd = path.join(process.cwd(), "uploads");
console.log("Upload Dir (CWD):", uploadDirCwd);

const uploadDirRel = path.resolve(rootResolve, "uploads");
console.log("Upload Dir (Relative):", uploadDirRel);

if (fs.existsSync(uploadDirCwd)) {
    console.log("Upload Dir (CWD) exists!");
} else {
    console.log("Upload Dir (CWD) does NOT exist!");
}
