import { useState, useEffect } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Nav from './navigation';
import Article from './article';
import settings from './settings';

function Page() {
  const [articlesList, setArticlesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${settings.apiURL}/src`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(articlesList => {
        setArticlesList(articlesList)
        setError(null);
      })
      .catch(error => {
        console.error("Error fetching articles list: " + error);
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      })
  }, [])

  if (loading) return <span>Loading...</span>
  if (error) return <span>Error</span>

  function createRouteRecursionFestival(list, path) {
    var routeArray = [];
    list.forEach((e, i) => {
      if (typeof (e) === 'string') {
        if (path.length > 0) {
          routeArray.push(<Route key={i}
            path={`/article/${path.join('/')}/${e}`}
            element={<Article article={`${path.join('/')}/${e}`} />} />
          )
        } else {
          routeArray.push(<Route key={i} path={"/article/" + e} element={<Article article={e} />} />)
        }
      } else {
        const pathName = e[0] //the first element contains the name
        const newPath = path.concat([pathName]);
        const newList = e.slice(1); //remove name from thing
        routeArray.push(createRouteRecursionFestival(newList, newPath))
      }
    });
    return routeArray
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Nav articlesList={articlesList} />}>
          <Route index element={<span>index</span>} />
          <Route path="*" element={<span>404 error</span>} />
          {createRouteRecursionFestival(articlesList, [])}
        </Route>
      </Routes>
    </BrowserRouter>
  );

}

ReactDOM.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
  document.getElementById('root')
);
