const vscode = require("vscode");

function activate(ctx) {
    ctx.subscriptions.push(
        vscode.languages.registerHoverProvider(
            ["javascript", "typescript", "javascriptreact", "typescriptreact"],
            {
                provideHover(document, position) {
                    const range = document.getWordRangeAtPosition(position, /"([^"]+)"/);
                    if (!range) return;

                    const raw = document.getText(range);
                    let key = raw.slice(1, -1);

                    if (key.includes(":")) {
                        key = key.split(":")[1];
                    }

                    const value = findDollarValueInLCF(key);
                    if (!value) return; // solo valores con $

                    const md = new vscode.MarkdownString(`**${key}** → \`${value}\``);
                    md.isTrusted = true;

                    return new vscode.Hover(md, range);
                }
            }
        )
    );
}

function deactivate() {}

function findDollarValueInLCF(key) {
    const docs = vscode.workspace.textDocuments.filter(d => d.fileName.endsWith(".lcf"));

    for (const doc of docs) {
        for (let i = 0; i < doc.lineCount; i++) {
            const line = doc.lineAt(i).text.trim();

            const m = line.match(/^\$([A-Za-z0-9_]+)\s*>>\s*(.+)$/);
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
