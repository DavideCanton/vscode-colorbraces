'use strict';

import {ExtensionContext} from 'vscode';
import {BraceColorerController} from './brace-colorer-controller';
import {BraceColorer} from './brace-colorer';

export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "Colorer" is now active!');

    let colorer = new BraceColorer();
    let ctrl = new BraceColorerController(colorer);

    context.subscriptions.push(ctrl);
}
