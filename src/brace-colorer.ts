import { TextEditorDecorationType, window, DecorationRenderOptions, Range } from 'vscode';
import { IColorData, ElementKind, IScopeElement } from './interfaces';
import { Stack } from './stack';
import { StackElement } from './stack_el';
import * as _ from 'lodash';

export class BraceColorer {
    private decorations: TextEditorDecorationType[];
    private errorDecoration: TextEditorDecorationType;
    private scopes: IScopeElement[];

    setupColors(colors: IColorData[], errorColor: IColorData) {
        this.decorations = colors.map(c => window.createTextEditorDecorationType({ color: c.color }));

        this.errorDecoration = window.createTextEditorDecorationType({
            backgroundColor: errorColor.bgcolor,
            color: errorColor.color
        });

        this.scopes = [];
    }

    _openBrace(element: StackElement, stack: Stack<StackElement>, decorations: Range[][]) {
        stack.push(element);
        //console.log("Found " + char + ", stack = " + JSON.stringify(stack));
    }

    _closedBrace(new_element: StackElement, stack: Stack<StackElement>, decorations: Range[][]): boolean {
        if (stack.length() > 0) {
            let el = stack.peek() !;

            if (new_element.matches_brace(el)) {
                stack.pop();

                let index = stack.length() % this.decorations.length;
                let decoration = this.decorations[index];

                decorations[index].push(el.range);
                decorations[index].push(new_element.range);

                let range = new Range(el.range.start, new_element.range.end);
                let scopeEl = <IScopeElement> { decoration: decoration, range: range };
                this.scopes.push(scopeEl);

                //console.log("Matched " + char + " with " + elChar + ", stack = " + JSON.stringify(stack));
                return true;
            }
        }

        return false;
    }

    colorize() {
        this.scopes.splice(0);

        let editor = window.activeTextEditor;
        let doc = editor.document;
        let text = doc.getText();
        let ranges: Range[] = [];
        let stack = new Stack<StackElement>();
        let isInConstant = false;

        let decorations: Range[][] = this.decorations.map(_ => []);
        let errorDecorations: Range[] = [];

        // console.log("-----------------------------------------------------");

        for (var i = 0, l = text.length; i < l; i++) {
            let char = text.charAt(i);
            let error = false;
            let range = new Range(doc.positionAt(i), doc.positionAt(i + 1));

            let el = new StackElement(char, range);

            if (el.kind === ElementKind.OpenBrace && !isInConstant) {
                this._openBrace(el, stack, decorations);
            }
            else if (el.kind === ElementKind.ClosedBrace && !isInConstant) {
                error = error || !this._closedBrace(el, stack, decorations);
            }
            else if (el.kind === ElementKind.Quote) {
                let last = stack.peek();

                if (last == null || last.kind !== ElementKind.Quote || char != last.char) {
                    if (last != null && el.matches_quote(last) && isInConstant)
                        continue;

                    isInConstant = true;
                    stack.push(el);
                    //console.log("Found " + char + ", stack = " + JSON.stringify(stack));
                }
                else {
                    if (el.matches_quote(last)) {
                        stack.pop();
                        isInConstant = false;
                        //console.log("Matched " + char + " with " + last.char + ", stack = " + JSON.stringify(stack));
                    }
                    else {
                        stack.push(el);
                        isInConstant = true;
                        //console.log("Found " + char + ", stack = " + JSON.stringify(stack));
                    }
                }
            }

            if (error) {
                // error
                errorDecorations.push(range);

                //console.log("Unexpected " + c + ", stack =  + JSON.stringify(stack));
            }
        }

        for (let pair of _.zip<TextEditorDecorationType | Range[]>(this.decorations, decorations)) {
            editor.setDecorations(<TextEditorDecorationType>pair[0], <Range[]>pair[1]);
        }

        for (let e of stack) {
            errorDecorations.push(e.range);
        }
        editor.setDecorations(this.errorDecoration, errorDecorations);

        console.log("Scopes: " + this.scopes.length);
    }
}
