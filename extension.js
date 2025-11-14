const vscode = require("vscode");

function activate(ctx) {
    ctx.subscriptions.push(
        vscode.languages.registerHoverProvider(
            ["javascript", "typescript", "javascriptreact", "typescriptreact"],
            {
                provideHover(document, position) {
                    const range = document.getWordRangeAtPosition(position, /"([^"]+)"/);
                    if (!range) return;

                    const raw = document.getText(range); // "config:port"
                    const key = raw.slice(1, -1);       // config:port

                    if (!key.startsWith("config:")) return;

                    const value = findValueInLCF(key.split(":")[1]);
                    if (!value) return;

                    const md = new vscode.MarkdownString(`**${key}** → \`${value}\``);
                    md.isTrusted = true;

                    return new vscode.Hover(md, range);
                }
            }
        )
    );
}

function deactivate() {}


function findValueInLCF(key) {
    const docs = vscode.workspace.textDocuments.filter(d => d.fileName.endsWith(".lcf"));

    for (const doc of docs) {
        for (let i = 0; i < doc.lineCount; i++) {
            const line = doc.lineAt(i).text.trim();

            // port>>3000   |   value>>"Hello world"
            const m = line.match(/^([A-Za-z0-9_]+)\s*>>\s*(.+)$/);
            if (!m) continue;

            const k = m[1];
            const v = m[2].replace(/^"|"$/g, "");

            if (k === key) return v;
        }
    }
    return null;
}

exports.activate = activate;
exports.deactivate = deactivate;