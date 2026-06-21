import WigglePath from './WigglePath';
import './style.css';

export default function App() {
  return (
    <div className="wiggle-wrap">
      <header className="thread-copy">
        <h1>Pull the Thread</h1>
        <p>Move slowly from tangled toward clear.</p>
      </header>
      <WigglePath />
    </div>
  );
}
