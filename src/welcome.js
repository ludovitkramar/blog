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
                <h2>Text in, website out</h2>
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
                            <td className={style.feature}>Heading</td>
                            <td className={style.partial}>With # only</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Bold</td>
                            <td className={style.partial}>With * only</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Italic</td>
                            <td className={style.partial}>With * only</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Blockquote</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Ordered List</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Unrdered List</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Code</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Horizontal Rule</td>
                            <td className={style.partial}>With *** or ---</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Link</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Image</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Table</td>
                            <td className={style.unsupported}>No</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Fenced Code Block</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Footnote</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Heading ID</td>
                            <td className={style.unsupported}>No</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Definition List</td>
                            <td className={style.unsupported}>No</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Emoji</td>
                            <td className={style.partial}>Unicode Emojis</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Highlight</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Subscript</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>Superscript</td>
                            <td className={style.supported}>Yes</td>
                        </tr>
                        <tr>
                            <td className={style.feature}>HTML</td>
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