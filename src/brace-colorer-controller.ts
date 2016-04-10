import { Disposable, window, workspace } from 'vscode';
import {IColorData} from './interfaces';
import {BraceColorer} from './brace-colorer';

export class BraceColorerController implements Disposable {
    private colorer: BraceColorer;
    private disposable: Disposable;

    constructor(colorer: BraceColorer) {
        this.colorer = colorer;

        // subscribe to selection change and editor activation events
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
        workspace.onDidChangeConfiguration(this._updateConf, this, subscriptions);

        this._updateConf();
        this.colorer.colorize();

        // create a combined disposable from both event subscriptions
        this.disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this.disposable.dispose();
    }

    private _onEvent() {
        this.colorer.colorize();
    }

    private _updateConf() {
        let conf = workspace.getConfiguration();
        let colors = conf.get<IColorData[]>('colorBraces.colors') || [];

        let errorColor = conf.get<IColorData>('colorBraces.errorColor') || <IColorData>{};
        errorColor.bgcolor = errorColor.bgcolor || "red";
        errorColor.color = errorColor.color || "white";
        colors = colors.length > 0 ? colors : [{ color: "red" }, { color: "blue" }, { color: "yellow" }, { color: "green" }, { color: "white" }, { color: "#FF00FF" }];

        this.colorer.setupColors(colors, errorColor);
    }
}