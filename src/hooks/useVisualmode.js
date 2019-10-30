import { useState } from "react";

export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  function transition(mode, replace = false) {
    if (replace) {
      history.pop()
    }

    setHistory(prev => [...prev, mode])
    setMode(mode)
  }

  function back() {
    if (history.length > 1) {
      history.pop()
      setHistory(history)
      setMode(history[history.length - 1])
    }
  }

  console.log(history);

  return { mode, transition, back }
}
