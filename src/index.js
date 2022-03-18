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

  // const articlesList = ['adwaita_theme_for_qt', 'arch_vm_with_gpu', 'bash_en_programador_de_tareas', 'bhyve_wireless_NAT', 'cant_disable_swap', 'coturn_synapse', 'debian_bullseye_bridged_network', 'grub_rescue_boot', 'mac_vm', 'matrix_vm_setup', 'my_tweaks', 'nextcloud_snap_setup', 'plasma_dynamic_wallpaper', 'resize_root_partition', 'rsync_commands'];
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Nav articlesList={articlesList} />}>
          <Route index element={<span>index</span>} />
          <Route path="*" element={<span>404 error</span>} />
          {articlesList.map((e, i) => {
            return (
              <Route key={i} path={"/article/" + e} element={<Article article={e} />} />
            )
          })}
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
