import { useState } from "react";
import { useStopwatch } from "react-timer-hook";
import Timer from "../lib/index";
import "./App.css";

function App() {
  const { seconds, minutes, hours, days, isRunning, start, pause, reset } =
    useStopwatch({ autoStart: true });

  const [isShowTitle, setIsShowTitle] = useState(true);
  return (
    <div className="separator">
      <h2>UseStopwatch Demo</h2>
      <Timer
        seconds={seconds}
        minutes={minutes}
        hours={hours}
        isShowTitle={isShowTitle}
      />
    </div>
  );
}

export default App;