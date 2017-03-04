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
        window.onDidChangeTextEditorSelection(this.onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);        
        workspace.onDidChangeConfiguration(this.updateConf, this, subscriptions);    

        this.updateConf();
        this.colorer.colorize();

        // create a combined disposable from both event subscriptions
        this.disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this.disposable.dispose();
    }

    private onEvent() {
        this.colorer.colorize();
    }

    private updateConf() {
        let conf = workspace.getConfiguration();
        let colors = conf.get<IColorData[]>('colorBraces.colors') || [];
        
        let default_colors = ["red", "#55F", "yellow", "#5F5", "#FF00FF"].map(c => ({ color: c }));

        let errorColor : IColorData = conf.get('colorBraces.errorColor') || {};
        errorColor.bgcolor = errorColor.bgcolor || "red";
        errorColor.color = errorColor.color || "white";
        colors = colors.length > 0 ? colors : default_colors;

        this.colorer.setupColors(colors, errorColor);
    }
}