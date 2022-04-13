import { useState, useEffect } from "react";
import style from './article.module.css';
import settings from "./settings";
import Markdown from "./markdown";

export default function Article(props) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${settings.apiURL}/src/${props.article}`)
            .then(response => {
                if (response.ok) {
                    return response.text()
                }
                throw response;
            })
            .then(data => {
                setData(data);
                setError(null);
            })
            .catch(error => {
                console.error('Error fetching article:' + error);
                setError(error);
            })
            .finally(() => {
                setLoading(false)
            })
    }, [props.article])

    if (loading) return <article className={style.article}>Loading...</article>;
    if (error) return <article className={style.article}>Error downloading article</article>

    console.log(data)

    return (
        <article className={style.article}>
            <Markdown markdown={data} graphTop={false} graphBottom={!false}></Markdown>
        </article>
    );
}