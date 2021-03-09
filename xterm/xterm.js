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
term.open(document.getElementById("terminal"));
term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");

const shellprompt = '$ ';
term.prompt = function () {
  term.write('\r\n' + shellprompt);
};

term.writeln('Welcome to xterm.js');
term.writeln('');
term.prompt();
term.setOption('cursorBlink', true);

term.onKey(ev => {
  console.log(ev);
  term.write(ev.key);
  if ( ev.key === '\r' ) {
    term.prompt();
  }
});
