import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // <-- import this
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store } from './store/store';  // Adjust the path as necessary

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>  
  <React.StrictMode>
    <BrowserRouter>   {/* Wrap here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
  </Provider>
);

reportWebVitals();
