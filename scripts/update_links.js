import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const repo = "ScriptingApp/Community-Scripts";
const branch = "main";
const readmePath = path.resolve("README.md");

// 获取这次提交中新增的 .scripting 文件
const diffOutput = execSync("git diff --name-status HEAD~1 HEAD", { encoding: "utf-8" });
const addedFiles = diffOutput
  .split("\n")
  .filter(line => (line.startsWith("A") || line.startsWith("M")) && line.endsWith(".scripting"))
  .map(line => line.split("\t")[1]);

if (addedFiles.length === 0) {
  console.log("No new .scripting files added.");
  process.exit(0);
}

// 生成分享链接
const links = addedFiles.map(f => {
  const relative = encodeURIComponent(f);
  const rawUrl = `https://github.com/${repo}/raw/refs/heads/${branch}/${relative}`;
  const shareUrl = `https://scripting.fun/import_scripts?urls=%5B%22${encodeURIComponent(rawUrl)}%22%5D`;
  return `- [${path.basename(f)}](${shareUrl})`;
});

let readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf-8") : "";

const marker = "<!-- AUTO_LINKS -->";
if (!readme.includes(marker)) {
  // 如果没有标记，追加到文件末尾
  readme += `\n\n${marker}\n## 分享链接\n\n${links.join("\n")}\n${marker}\n`;
} else {
  // 在 marker 前插入新增的链接
  readme = readme.replace(marker, `${links.join("\n")}\n\n${marker}`);
}

fs.writeFileSync(readmePath, readme);
