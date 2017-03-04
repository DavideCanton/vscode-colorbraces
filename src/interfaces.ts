import { TextEditorDecorationType, Range } from 'vscode';

export interface IColorData {
    color?: string,
    bgcolor?: string
}

export interface IScopeElement {
    range: Range,
    decoration: TextEditorDecorationType
}

export enum ElementKind {
    OpenBrace,
    ClosedBrace,
    Quote,
    Other
}