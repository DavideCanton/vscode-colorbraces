export class Stack<T> {
    private _elements: T[];
    
    constructor(){
        this._elements = [];
    }

    push(t: T) {
        this._elements.push(t);
    }

    pop(): T {
        return this._elements.pop();
    }

    length(): number {
        return this._elements.length;
    }

    peek(): T {
        return this._elements[this._elements.length - 1];
    }
    
    elements(): T[] {
        return this._elements;
    }
}