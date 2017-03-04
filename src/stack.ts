export class Stack<T> {
    private _elements: T[];

    constructor() {
        this._elements = [];
    }

    push(t: T) {
        this._elements.push(t);
    }

    pop(): T | null {
        if (this.length() > 0)
            return this._elements.pop() !;

        return null;
    }

    length(): number {
        return this._elements.length;
    }

    peek(): T | null {
        if (this.length() > 0)
            return this._elements[this._elements.length - 1];

        return null;
    }

    [Symbol.iterator]() {
        return this._elements[Symbol.iterator]();
    }
}