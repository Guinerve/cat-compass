import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./style.css";

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ maxWidth: 560, margin: "40px auto", padding: 16, fontFamily: "system-ui" }} role="alert">
        <h1>Something went wrong</h1>
        <p>Cat Compass hit an error: {this.state.error.message}</p>
        <button onClick={() => { try { localStorage.removeItem("cat-compass:v1"); } catch { /* ignore */ } location.reload(); }}>Reset saved data and reload</button>
      </div>
    );
  }
}

createRoot(document.getElementById("root")!).render(<StrictMode><Boundary><App /></Boundary></StrictMode>);
