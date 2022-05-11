import style from './welcome.module.css'
import { useLocation, Link } from 'react-router-dom';

export default function NotFound(props) {
    const location = useLocation();
    return (
        <div className={style.container}>
            <div className={style.block}>
                <h1>404</h1>
                <span>Page <span className={style.softHighlight}>{location.pathname}</span> not found</span>
                <div>
                    <Link className={style.btn} to='/'>Back to home</Link>
                    <button className={style.btn} onClick={() => { window.history.go(-1) }}>Previous page</button>
                </div>
            </div>
        </div>
    )
}