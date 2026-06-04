import WigglePath from './WigglePath';
import './style.css';

export default function App() {
  return (
    <div className="wiggle-wrap">
      <header className="thread-copy">
        <h1>How calm are you today?</h1>
        <p>Drag {'->'}</p>
      </header>
      <WigglePath />
    </div>
  );
}
