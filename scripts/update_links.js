const fs = require("fs");
const path = require("path");

// 项目根目录
const projectRoot = process.env.GITHUB_WORKSPACE || path.resolve(__dirname, "../");
const scriptingDir = projectRoot;
const readmePath = path.join(projectRoot, "README.md");

let collectedLinks = [];

// 遍历目录（递归收集 .scripting 文件）
function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach((file) => {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isFile() && filepath.endsWith(".scripting")) {
            callback(filepath);
        } else if (stat.isDirectory()) {
            walkDir(filepath, callback);
        }
    });
}

// 生成 scripting.fun 链接
function generateScriptLink(filename) {
    const baseUrl = "https://github.com/ScriptingApp/Community-Scripts/raw/refs/heads/main/";
    const relativePath = path.relative(scriptingDir, filename).replace(/\\/g, "/");
    const fullUrl = baseUrl + encodeURIComponent(relativePath);
    const name = path.basename(filename, ".scripting"); // 去掉后缀
    const link = `https://scripting.fun/import_scripts?urls=${encodeURIComponent(`[\"${fullUrl}\"]`)}`;
    return { name, link };
}

// 收集所有链接
walkDir(scriptingDir, (file) => {
    collectedLinks.push(generateScriptLink(file));
});

// 写入 README.md
let readmeContent = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf-8") : "";
const startTag = "<!-- SCRIPTS_LINKS_START -->";
const endTag = "<!-- SCRIPTS_LINKS_END -->";

const linksMarkdown = collectedLinks.map(({ name, link }) => `- [${name}](${link})`).join("\n");
const replacement = `${startTag}\n${linksMarkdown}\n<!-- updated at ${new Date().toISOString()} -->\n${endTag}`;

if (readmeContent.includes(startTag)) {
    readmeContent = readmeContent.replace(new RegExp(`${startTag}[\\s\\S]*?${endTag}`), replacement);
} else {
    readmeContent += `\n\n${replacement}\n`;
}

fs.writeFileSync(readmePath, readmeContent, "utf-8");
console.log("README.md updated with latest links.");
