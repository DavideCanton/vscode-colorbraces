import {TextEditorDecorationType, window, DecorationRenderOptions, Range} from 'vscode';
import {IColorData, IStackElement} from './interfaces';
import {Stack} from './stack';

export class BraceColorer {
    public static QUOTES: string = '"\'';
    public static BRACES: string = '([{)]}';

    private decorations: TextEditorDecorationType[];
    private errorDecoration: TextEditorDecorationType;

    setupColors(colors: IColorData[], errorColor: IColorData) {
        this.decorations = colors.map(c => window.createTextEditorDecorationType({ color: c.color }));

        this.errorDecoration = window.createTextEditorDecorationType({
            backgroundColor: errorColor.bgcolor,
            color: errorColor.color
        });
    }

    static is_open_brace(c: string): boolean {
        let index = BraceColorer.BRACES.indexOf(c);
        return index >= 0 && index < BraceColorer.BRACES.length / 2;
    }

    static is_closed_brace(c: string): boolean {
        let index = BraceColorer.BRACES.indexOf(c);
        return index >= BraceColorer.BRACES.length / 2;
    }

    static is_corresponding_brace(c: string, opened_brace: string): boolean {
        let offset = BraceColorer.BRACES.length / 2;
        return BraceColorer.BRACES.indexOf(c) === BraceColorer.BRACES.indexOf(opened_brace) + offset;
    }

    static is_quote(c: string): boolean {
        return BraceColorer.QUOTES.indexOf(c) >= 0;
    }

    colorize() {
        let editor = window.activeTextEditor;
        let doc = editor.document;
        let text = doc.getText();
        let ranges: Range[] = [];
        let stack = new Stack<IStackElement>();
        let isInConstant = false;

        let decorations : Range[][] = this.decorations.map(_ => []);
        let errorDecorations : Range[] = [];

        // console.log("-----------------------------------------------------");

        for (var i = 0, l = text.length; i < l; i++) {
            let char = text.charAt(i);
            let error = false;
            let range = new Range(doc.positionAt(i), doc.positionAt(i + 1));

            if (BraceColorer.is_open_brace(char) && !isInConstant) {
                stack.push({ char: char, range: range });

                //console.log("Found " + char + ", stack = " + JSON.stringify(stack));
            }
            else if (BraceColorer.is_closed_brace(char) && !isInConstant) {
                if (stack.length() > 0) {
                    let {char: elChar, range: elRange } = stack.peek()!;
                    
                    if (BraceColorer.is_corresponding_brace(char, elChar)) {
                        stack.pop();
                        decorations[stack.length() % this.decorations.length].push(elRange);
                        decorations[stack.length() % this.decorations.length].push(range);

                        //console.log("Matched " + char + " with " + elChar + ", stack = " + JSON.stringify(stack));
                    }
                    else
                        error = true;

                }
                else
                    error = true;
            }
            else if (BraceColorer.is_quote(char)) {
                let last = stack.length() > 0 ? stack.peek() : null;
                if (last == null || !last.isQuote || char != last.char) {
                    if (last != null && char != last.char && isInConstant)
                        continue;

                    isInConstant = true;
                    stack.push({ char: char, isQuote: true, range: range });
                    //console.log("Found " + char + ", stack = " + JSON.stringify(stack));
                }
                else {
                    if (char == last.char) {
                        stack.pop();
                        isInConstant = false;
                        //console.log("Matched " + char + " with " + last.char + ", stack = " + JSON.stringify(stack));
                    }
                    else {
                        stack.push({ char: char, isQuote: true, range: range });
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

        for (let i in decorations) {
            editor.setDecorations(this.decorations[i], decorations[i]);
        }

        errorDecorations.push(...stack.elements().map(e => e.range));
        editor.setDecorations(this.errorDecoration, errorDecorations);
    }
}
