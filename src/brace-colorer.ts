import {TextEditorDecorationType, window, DecorationRenderOptions, Range} from 'vscode';
import {IColorData, IStackElement} from './interfaces';
import {Stack} from './stack';

export class BraceColorer {
    private decorations: TextEditorDecorationType[];
    private errorDecoration: TextEditorDecorationType;

    setupColors(colors: IColorData[], errorColor: IColorData) {
        this.decorations = colors.map(c => window.createTextEditorDecorationType(<DecorationRenderOptions>{
            color: c.color
        }));

        this.errorDecoration = window.createTextEditorDecorationType(<DecorationRenderOptions>{
            backgroundColor: errorColor.bgcolor,
            color: errorColor.color
        });
    }

    colorize() {
        let editor = window.activeTextEditor;
        let doc = editor.document;
        let text = doc.getText();
        let ranges = [];
        let stack = new Stack<IStackElement>();
        let isInConstant = false;

        let decorations = [];
        for (var i = 0, l = this.decorations.length; i < l; i++)
            decorations.push([]);
        let errorDecorations = [];

        // console.log("-----------------------------------------------------");

        for (var i = 0, l = text.length; i < l; i++) 
        {
            let char = text.charAt(i);
            let error = false;
            let range = new Range(doc.positionAt(i), doc.positionAt(i + 1));

            if ("{[(".indexOf(char) >= 0 && !isInConstant) 
            {
                stack.push({ char: char, range: range });

                //console.log("Found " + char + ", stack = " + JSON.stringify(stack));
            }
            else if ("}])".indexOf(char) >= 0 && !isInConstant) 
            {
                if (stack.length() > 0) 
                {
                    let elem = stack.peek();
                    let elChar = elem.char;
                    if (elChar === "{" && char === "}" || elChar === "[" && char === "]" || elChar === "(" && char === ")") 
                    {
                        stack.pop();
                        decorations[stack.length() % this.decorations.length].push(elem.range);
                        decorations[stack.length() % this.decorations.length].push(range);

                        //console.log("Matched " + char + " with " + elChar + ", stack = " + JSON.stringify(stack));
                    }
                    else
                        error = true;

                }
                else
                    error = true;
            }
            else if ("'\"".indexOf(char) >= 0) 
            {
                let last = stack.length() > 0 ? stack.peek() : null;                
                if (last == null || !last.isQuote || char != last.char)
                {
                    if(last != null && char != last.char && isInConstant)
                        continue;
                    
                    isInConstant = true;
                    stack.push({ char: char, isQuote: true, range: range });
                    //console.log("Found " + char + ", stack = " + JSON.stringify(stack));
                }    
                else 
                {
                    if (char == last.char) 
                    {
                        stack.pop();
                        isInConstant = false;
                        //console.log("Matched " + char + " with " + last.char + ", stack = " + JSON.stringify(stack));
                    }
                    else 
                    {
                        stack.push({ char: char, isQuote: true, range: range });
                        isInConstant = true;
                        //console.log("Found " + char + ", stack = " + JSON.stringify(stack));
                    }
                }
            }

            if (error) 
            {
                // error
                errorDecorations.push(range);

                //console.log("Unexpected " + c + ", stack =  + JSON.stringify(stack));
            }
        }

        for (let i in decorations) 
        {
            editor.setDecorations(this.decorations[i], decorations[i]);
        }

        errorDecorations.push(...stack.elements().map(e => e.range));
        editor.setDecorations(this.errorDecoration, errorDecorations);
    }
}
