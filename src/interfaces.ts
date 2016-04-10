import {Range} from 'vscode';

export interface IColorData {
    color?: string,
    bgcolor?: string
}

export interface IStackElement {
    char: string,
    range: Range,
    isQuote?: boolean
}