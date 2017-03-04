//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as vsColorBraces from '../src/extension';
import { Stack } from '../src/stack';

// Defines a Mocha test suite to group tests of similar kind together
suite("Stack tests", () => {

    // Defines a Mocha unit test
    test("test stack", () => {
        let s = new Stack<number>();
        assert.equal(s.length(), 0);

        s.push(1);
        assert.equal(s.length(), 1);
        assert.equal(s.peek(), 1);
        
        s.push(2);
        assert.equal(s.length(), 2);
        assert.equal(s.peek(), 2);

        let v1 = s.pop();
        assert.equal(v1, 2);        
        assert.equal(s.length(), 1);
        assert.equal(s.peek(), 1);

        let v2 = s.pop();
        assert.equal(v1, 1);        
        assert.equal(s.length(), 0);
    });
});