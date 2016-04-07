'use strict';

import * as vsc from 'vscode';

interface IColorData {
    color?: string,
    bgcolor?: string
}

export function activate(context: vsc.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error).
    // This line of code will only be executed once when your extension is activated.
    console.log('Congratulations, your extension "Colorer" is now active!');

    // create a new word counter
    let colorer = new BraceColorer();
    let ctrl = new BraceColorerController(colorer);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(ctrl);
}

class BraceColorer {
    private decorations: vsc.TextEditorDecorationType[];
    private errorDecoration: vsc.TextEditorDecorationType;

    setupColors(colors: IColorData[], errorColor: IColorData) {
        this.decorations = colors.map(c => vsc.window.createTextEditorDecorationType(<vsc.DecorationRenderOptions>{
            color: c.color
        }));

        this.errorDecoration = vsc.window.createTextEditorDecorationType(<vsc.DecorationRenderOptions>{
            backgroundColor: errorColor.bgcolor,
            color: errorColor.color
        });
    }

    colorize() {
        let editor = vsc.window.activeTextEditor;
        let doc = editor.document;
        let text = doc.getText();
        let ranges = [];
        let stack = [];

        let decorations = [];
        for (var i = 0, l = this.decorations.length; i < l; i++)
            decorations.push([]);
        let errorDecorations = [];

        //console.log("-----------------------------------------------------");

        for (var i = 0, l = text.length; i < l; i++) {
            let c = text.charAt(i);
            if ("{[(".indexOf(c) >= 0) {
                let range = new vsc.Range(doc.positionAt(i), doc.positionAt(i + 1));
                stack.push({ char: c, range: range });

                //console.log("Found " + c + ", stack = " + JSON.stringify(stack));
            }
            else if ("}])".indexOf(c) >= 0) {
                let error = false;
                let range = new vsc.Range(doc.positionAt(i), doc.positionAt(i + 1));

                if (stack.length > 0) {
                    let o = stack[stack.length - 1];
                    let m = o.char;
                    if (m === "{" && c === "}" || m === "[" && c === "]" || m === "(" && c === ")") {
                        stack.pop();
                        decorations[stack.length % this.decorations.length].push(o.range);
                        decorations[stack.length % this.decorations.length].push(range);

                        //console.log("Matched " + c + " with " + m + ", stack = " + JSON.stringify(stack));
                    }
                    else
                        error = true;

                }
                else
                    error = true;

                if (error) {
                    // error
                    errorDecorations.push(range);

                    //console.log("Unexpected " + c + ", stack = " + JSON.stringify(stack));

                    break;
                }
            }
        }

        for (let i in decorations) {
            editor.setDecorations(this.decorations[i], decorations[i]);
        }

        errorDecorations.push(...stack.map(e => e.range));
        editor.setDecorations(this.errorDecoration, errorDecorations);
    }
}

class BraceColorerController implements vsc.Disposable {
    private colorer: BraceColorer;
    private disposable: vsc.Disposable;

    constructor(colorer: BraceColorer) {
        this.colorer = colorer;

        // subscribe to selection change and editor activation events
        let subscriptions: vsc.Disposable[] = [];
        vsc.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        vsc.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
        vsc.workspace.onDidChangeConfiguration(this._updateConf, this, subscriptions);

        this._updateConf();
        this.colorer.colorize();

        // create a combined disposable from both event subscriptions
        this.disposable = vsc.Disposable.from(...subscriptions);
    }

    dispose() {
        this.disposable.dispose();
    }

    private _onEvent() {
        this.colorer.colorize();
    }

    private _updateConf() {
        let conf = vsc.workspace.getConfiguration();
        let colors = conf.get<IColorData[]>('colorBraces.colors') || [];

        let errorColor = conf.get<IColorData>('colorBraces.errorColor') || <IColorData>{};
        errorColor.bgcolor = errorColor.bgcolor || "red";
        errorColor.color = errorColor.color || "white";
        colors = colors.length > 0 ? colors : [{ color: "red" }, { color: "blue" }, { color: "yellow" }, { color: "green" }, { color: "white" }, { color: "#FF00FF" }];

        this.colorer.setupColors(colors, errorColor);
    }
}