const fs = require("fs");
const path = require("path");

// 项目根目录
const scriptingDir = path.resolve(__dirname, "../");
const readmePath = path.resolve(scriptingDir, "README.md");

let collectedLinks = [];

// 遍历目录，收集 .scripting 文件
function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach((file) => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isFile() && filepath.endsWith(".scripting")) {
            callback(filepath);
        }
    });
}

// 生成 scripting.fun 链接
function generateScriptLink(filename) {
    const baseUrl = "https://github.com/ScriptingApp/Community-Scripts/raw/refs/heads/main/";
    const fullUrl = baseUrl + encodeURIComponent(path.basename(filename));
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
const replacement = `${startTag}\n${linksMarkdown}\n${endTag}`;

// 替换或追加
if (readmeContent.includes(startTag)) {
    readmeContent = readmeContent.replace(new RegExp(`${startTag}[\\s\\S]*?${endTag}`), replacement);
} else {
    readmeContent += `\n\n${replacement}\n`;
}

fs.writeFileSync(readmePath, readmeContent, "utf-8");
console.log("README.md updated with latest links.");
