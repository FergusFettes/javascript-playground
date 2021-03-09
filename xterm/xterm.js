import { Terminal } from "xterm";
import React from 'react';
import { render } from 'react-dom';

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
};


const App = () => (
  <div style={styles}>
  </div>
);
const term = new Terminal();

render(<App />, document.getElementById('root'));
var shellprompt = '$ ';
term.open(document.getElementById("terminal"));
term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");

term.prompt = function () {
  term.write('\r\n' + shellprompt);
};

term.writeln('Welcome to xterm.js');
term.writeln('This is a local terminal emulation, without a real terminal in the back-end.');
term.writeln('Type some keys and commands to play around.');
term.writeln('');
term.prompt();
term.setOption('cursorBlink', true);

var cmd = '';

term.on('key', function (key, ev) {
  var printable = (
    !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
  );

  if (ev.keyCode == 13) {
    if(cmd === 'clear')
    {
      term.clear();
    }
    cmd = '';
    term.prompt();
  } else if (ev.keyCode == 8) {
    // Do not delete the prompt
    console.log(term.rows);
    if (term.x > 2) {
      term.write('\b \b');
    }
  } else if (printable) {
    cmd += key;
    term.write(key);
  }
});

term.on('paste', function (data, ev) {
  term.write(data);
});
