import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Nav from './navigation';
import Article from './article';

class Page extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Nav />}>
            <Route index element={<span>index</span>} />
            <Route path="q" element={<Article />} />
            <Route path="*" element={<span>404 error</span>} />
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
  document.getElementById('root')
);
