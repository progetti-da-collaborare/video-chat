import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  //<React.StrictMode>
    <App />
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

//window.addEventListener("load", () => alert("qwerty!"));

/*
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        scope: "http://localhost:3005/",
      });
      if (registration.installing) {
        console.log("Service worker installing")
      } else if (registration.waiting) {
        console.log("Service worker installed")
      } else if (registration.active) {
        console.log("Service worker active")
      };
      navigator.serviceWorker.addEventListener('message', function(event) {
        console.log("Got reply from service worker: " + event.data)
      })
    } catch (error) {
      const yy = 0.9
      console.error(`Registration failed with ${error}`)
    }
  }
}

registerServiceWorker()
*/