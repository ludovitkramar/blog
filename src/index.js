import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import './index.css';
import RsyncCommands from "./articles/rsync_commands.js";

class Article extends React.Component {
  render() {
    return (
      <RsyncCommands />
    )
  }
}

function Nav() {
  return (
    <>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="q">q</Link></li>
          <li><Link to="/qad">Link to nowhere</Link></li>
          <li><Link to="/Article">article</Link></li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
}

class Page extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Nav />}>
            <Route index element={<span>index</span>} />
            <Route path="q" element={<Article />} />
            <Route path="Article" element={<RsyncCommands />} />
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
