// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import {compile, CompilationError} from '@andrivet/z80-assembler';

export function App() {
  return (
    <div>
      <NxWelcome title="z80-assembler-app" />
    </div>
  );
}

export default App;
