import { ElementKind } from './interfaces';
import { Range } from 'vscode';
import * as _ from 'lodash';

export class StackElement {
    char: string;
    range: Range;
    kind: ElementKind;

    static QUOTES: string = '"\'';
    static OPEN_BRACES: string = '([{';
    static CLOSED_BRACES: string = ')]}';

    constructor(char: string, range: Range) {
        this.char = char;
        this.range = range;

        this._setKind();
    }

    matches_brace(other: StackElement): boolean {
        let open, closed;

        if (this.kind === ElementKind.OpenBrace && other.kind === ElementKind.ClosedBrace) {
            open = this;
            closed = other;
        }
        else if (this.kind === ElementKind.ClosedBrace && other.kind === ElementKind.OpenBrace) {
            open = other;
            closed = this;
        }
        else
            return false;

        return StackElement.is_corresponding_brace(this.char, other.char);
    }

    matches_quote(other: StackElement): boolean {
        if (this.kind === ElementKind.Quote && other.kind === ElementKind.Quote)
            return this.char === other.char;

        return false;
    }

    _setKind() {
        if (StackElement.is_open_brace(this.char))
            this.kind = ElementKind.OpenBrace;

        else if (StackElement.is_closed_brace(this.char))
            this.kind = ElementKind.ClosedBrace;

        else if (StackElement.is_quote(this.char))
            this.kind = ElementKind.Quote;

        else
            this.kind = ElementKind.Other;
    }

    static is_open_brace(char: string): boolean {
        return _.includes(StackElement.OPEN_BRACES, char);
    }

    static is_closed_brace(char: string): boolean {
        return _.includes(StackElement.CLOSED_BRACES, char);
    }

    static is_quote(char: string): boolean {
        return _.includes(StackElement.QUOTES, char);
    }

    static is_corresponding_brace(closed_brace: string, opened_brace: string): boolean {
        return StackElement.CLOSED_BRACES.indexOf(closed_brace) === StackElement.OPEN_BRACES.indexOf(opened_brace);
    }
}