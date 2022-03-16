// import { useEffect, useState } from "react";
import settings from "../settings";

function Articles() {
    return ['adwaita_theme_for_qt', 'arch_vm_with_gpu', 'bash_en_programador_de_tareas', 'bhyve_wireless_NAT', 'cant_disable_swap', 'coturn_synapse', 'debian_bullseye_bridged_network', 'grub_rescue_boot', 'mac_vm', 'matrix_vm_setup', 'my_tweaks', 'nextcloud_snap_setup', 'plasma_dynamic_wallpaper', 'resize_root_partition', 'rsync_commands'];

//     const res = await fetch(`${settings.apiURL}/src`, {
//         method: "GET",
//     });
//     const articles = await res.json();
//     console.log(articles)
//     return articles
}
// function Articles() {
//     // const [data, setData] = useState([]);
//     // const [loading, setLoading] = useState([true]);
//     // const [error, setError] = useState([null]);

//     // useEffect(() => {
//     //     fetch(`${settings.apiURL}/src`)
//     //         .then(response => {
//     //             if (response.ok) {
//     //                 return response.json();
//     //             }
//     //             throw response;
//     //         })
//     //         .then(data => {
//     //             setData(data)
//     //         })
//     //         .catch(error => {
//     //             console.error("Error fetching articles list: " + error);
//     //             setError(error);
//     //         })
//     //         .finally(() => {
//     //             setLoading(false);
//     //         })
//     // }, [])

//     return ['mac_vm', 'hahalol'];
// };

export default Articles;