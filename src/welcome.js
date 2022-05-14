import style from './welcome.module.css'
import htmlfileIcon from './text-html.png'
import folderIcon from './folder.png'
import textfileIcon from './text-x-generic.png'

export default function Welcome(props) {
    return (
        <div className={style.container}>
            <div className={style.section}>
                <h2>Welcome to blog.kykvit!</h2>
                <span>Markdown syntax based dynamic blog system written in React.js</span>
            </div>
            <div className={style.section}>
                <h2>Text to web</h2>
                <span>Never has been so easy</span>
                <div className={style.graphics}>
                    <img className={style.icon} src={textfileIcon}></img>
                    <img className={style.icon} src={textfileIcon}></img>
                    <img className={style.icon} src={folderIcon}></img>
                    <img className={style.icon} src={textfileIcon}></img>
                    <img className={style.icon} src={textfileIcon}></img>
                    <img className={style.icon} src={htmlfileIcon}></img>
                    <img className={style.icon} src={htmlfileIcon}></img>
                    <img className={style.icon} src={htmlfileIcon}></img>
                    <img className={style.icon} src={htmlfileIcon}></img>
                </div>
            </div>
            <div className={style.section} >
                <h2>Markdown with style</h2>
                <span>Supports all common Markdown features, and some obscure ones ;)</span>
                <table className={style.table}>
                    <thead>
                        <tr>
                            <th className={style.th}>Feature</th>
                            <th className={style.th}>Supported</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className={style.feature}>Bold text</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Bad thing</td>
                            <td className={style.unsupported}>No</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className={style.section + ' ' + style.photo}>
                <div className={style.iblock}>
                    <h2>Data visualization</h2>
                    <span>Peek inside the algorithm</span>
                    {/* <img src={graphpic} className={style.photo}></img> */}
                    <ul>
                        <li>Fun</li>
                        <li>Colorful</li>
                        <li>Beautiful</li>
                    </ul>
                </div>
            </div>
            <div className={style.section}>
                <h2>Handmade using React</h2>
                <ul>
                    <li>Seemless page switching</li>
                    <ul>
                        <li>Thanks to <code>react-router-dom</code></li>
                    </ul>
                    <li>Markdown parser</li>
                    <ul>
                        <li>Is this really a website anymore?</li>
                    </ul>
                    <li>Graph simulations</li>
                    <ul>
                        <li>Uses real life physics</li>
                        <li>So out of place you may question why is it there</li>
                    </ul>
                </ul>
            </div>
        </div>
    )
}