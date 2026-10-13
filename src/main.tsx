import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./style.css";
import { registerSW } from "virtual:pwa-register";

if (!window.catCompassDesktop && "serviceWorker" in navigator) {
  registerSW({ onNeedRefresh: () => {
    // Do not reload while a user edits records. An update applies on a later app start.
    console.info("A Cat Compass update is ready. Close all app windows and reopen to apply it.");
  } });
}

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ maxWidth: 560, margin: "40px auto", padding: 16, fontFamily: "system-ui" }} role="alert">
        <h1>Something went wrong</h1>
        <p>Cat Compass hit an error: {this.state.error.message}</p>
        <p>Your saved records have not been deleted.</p>
        <button onClick={() => location.reload()}>Reload without deleting records</button>
      </div>
    );
  }
}

createRoot(document.getElementById("root")!).render(<StrictMode><Boundary><App /></Boundary></StrictMode>);
