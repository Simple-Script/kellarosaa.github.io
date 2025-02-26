"use strict";
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// brainfuck.js (translated from brainfuck.php)
function brainfuck(code) {
    let tape = new Array(30000).fill(0);
    let pointer = 0;
    let output = "";
    let codeIndex = 0;
    let codeArray = code.split('');
    let loopStartToEnd = {};
    let loopStack = [];
    for (let i = 0; i < codeArray.length; i++) {
        if (codeArray[i] === '[') {
            loopStack.push(i);
        } else if (codeArray[i] === ']') {
            let start = loopStack.pop();
            loopStartToEnd[start] = i;
            loopStartToEnd[i] = start;
        }
    }
    while (codeIndex < codeArray.length) {
        let c = codeArray[codeIndex];
        switch(c){
            case '>':
                pointer++;
                break;
            case '<':
                pointer--;
                break;
            case '+':
                tape[pointer]++;
                break;
            case '-':
                tape[pointer]--;
                break;
            case '.':
                output += String.fromCharCode(tape[pointer]);
                break;
            case ',':
                // No input provided, do nothing.
                break;
            case '[':
                if(tape[pointer] === 0){
                    codeIndex = loopStartToEnd[codeIndex];
                }
                break;
            case ']':
                if(tape[pointer] !== 0){
                    codeIndex = loopStartToEnd[codeIndex];
                }
                break;
        }
        codeIndex++;
    }
    return output;
}

// util.js (translated from util.php)
// Converts text to a Brainfuck program that outputs the text.
function fuck_text(input) {
    let result = "";
    for(let i = 0; i < input.length; i++){
        let charCode = input.charCodeAt(i);
        result += "[-]" + "+".repeat(charCode) + ".";
    }
    return result;
}

// Wordwrap function identical to PHP's wordwrap($string, 75, "\n")
function wordwrap(str, width, newline) {
    let regex = new RegExp('.{1,' + width + '}', 'g');
    return str.match(regex).join(newline);
}

app.all("/", (req, res) => {
    // Equivalent of: $input  = isset($_REQUEST['input']) ? (string) $_REQUEST['input'] : '';
    let input = (typeof req.body.input !== "undefined" ? String(req.body.input) : (typeof req.query.input !== "undefined" ? String(req.query.input) : ''));
    let output = '';
    
    // if(isset($_REQUEST['do'])) switch((string) $_REQUEST['do']){
    if(typeof req.body.do !== "undefined" || typeof req.query.do !== "undefined"){
        let doStr = (typeof req.body.do !== "undefined" ? String(req.body.do) : String(req.query.do));
        switch(doStr){
            case 'Text to Ook!':
            case 'Text to short Ook!':
                output = fuck_text(input);
                // $output = strtr($output,array('>' => 'Ook. Ook? ',
                //                               '<' => 'Ook? Ook. ',
                //                               '+' => 'Ook. Ook. ',
                //                               '-' => 'Ook! Ook! ',
                //                               '.' => 'Ook! Ook. ',
                //                               ',' => 'Ook. Ook! ',
                //                               '[' => 'Ook! Ook? ',
                //                               ']' => 'Ook? Ook! ',
                //                              ));
                let mapping = {
                    '>': 'Ook. Ook? ',
                    '<': 'Ook? Ook. ',
                    '+': 'Ook. Ook. ',
                    '-': 'Ook! Ook! ',
                    '.': 'Ook! Ook. ',
                    ',': 'Ook. Ook! ',
                    '[': 'Ook! Ook? ',
                    ']': 'Ook? Ook! '
                };
                output = output.split('').map(ch => mapping[ch] ? mapping[ch] : ch).join('');
                if(doStr === 'Text to short Ook!'){
                    output = output.replace(/Ook/g, '');
                    output = output.replace(/ /g, '');
                    // $output = preg_replace('/(.....)/','\\1 ', $output);
                    output = output.replace(/(.{5})/g, '$1 ');
                }
                // $output = wordwrap($output,75,"\n");
                output = wordwrap(output,75,"\n");
                break;
            case 'Text to Brainfuck':
                output = fuck_text(input);
                // $output = preg_replace('/(.....)/','\\1 ', $output);
                output = output.replace(/(.{5})/g, '$1 ');
                // $output = wordwrap($output,75,"\n");
                output = wordwrap(output,75,"\n");
                break;
            case 'Ook! to Text':
                let lookup = {
                    '.?': '>',
                    '?.': '<',
                    '..': '+',
                    '!!': '-',
                    '!.': '.',
                    '.!': ',',
                    '!?': '[',
                    '?!': ']'
                };
                // $input = preg_replace('/[^\.?!]+/','',$input);
                input = input.replace(/[^\.?!]+/g, '');
                let len = input.length;
                for(let i = 0; i < len; i += 2){
                    output += lookup[input.substr(i,2)];
                }
                output = brainfuck(output);
                break;
            case 'Brainfuck to Text':
                output = brainfuck(input);
                break;
        }
    }
    
    // Output the HTML content as a response
    res.send(`<!DOCTYPE html>
<html lang="html">
<head>
    <title>Brainfuck/Text/Ook! obfuscator - deobfuscator. Decode and encode online.</title>

    <style>
        body {
            font-size: 80%;
            font-family: sans-serif;
        }
        a {
            text-decoration: none;
            color: #600;
        }
        textarea {
            border: solid 1px #000;
            width: 450px;
        }
        input, select {
            border: solid 1px #000;
        }
    </style>
</head>
<body>
<form action="" method="post">
<textarea name="input" cols="80" rows="10">${output}</textarea><br />
<input type="submit" name="do" value="Text to Ook!" />
<input type="submit" name="do" value="Text to short Ook!" />&nbsp;&nbsp;&nbsp;
<input type="submit" name="do" value="Ook! to Text" /><br />
<input type="submit" name="do" value="Text to Brainfuck" />&nbsp;&nbsp;&nbsp;
<input type="submit" name="do" value="Brainfuck to Text" />
</form>

</body>
</html>`);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000.");
});
