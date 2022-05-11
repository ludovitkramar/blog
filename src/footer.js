import s from './footer.module.css';
import { Link } from "react-router-dom";

export default function Footer(props) {
    return (
        <footer className={s.footer}>
            <span>Made by Ludovit Kramar</span>
            <ul className={s.list}>
                <li><Link className={s.a} to='/article/copyright'>Copyright</Link></li>
                <li><Link className={s.a} to='/article/privacy'>Privacy</Link></li>
                <li><Link className={s.a} to='/article/license'>License</Link></li>
            </ul>            
        </footer>
    )
}