import { Terminal } from "xterm";

const term = new Terminal();
term.open(document.getElementById("terminal"));

const shellprompt = "$ ";
term.prompt = function() {
  term.write("\r\n" + shellprompt);
};

term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");
term.writeln("");
term.prompt();
term.setOption("cursorBlink", true);

term.onKey(ev => {
  console.log(ev);
  term.write(ev.key);
  if (ev.key === "\r") {
    term.prompt();
  }
});
