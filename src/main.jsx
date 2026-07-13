import React from "react";
import ReactDOM from "react-dom/client";
import Whimsy from "./Whimsy.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Whimsy />
  </React.StrictMode>
);

// Register the service worker so Whimsy can be installed to a phone's home
// screen and keeps working with no signal. Skipped in local dev.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installability and offline support are a nice-to-have; never block
      // the app itself if registration fails on a given browser.
    });
  });
}
