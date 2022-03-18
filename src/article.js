import { useState, useEffect } from "react";
import style from './article.module.css';
import { Link } from "react-router-dom";
import settings from "./settings";

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
    if (error) return <article className={style.article}>Error</article>

    console.log(data)

    var graph = [2, 1, 0, 1]; //kantenliste
    var knoten = { 0: ['root'], 1: data.split('\n'), };
    const spetialChars = ['#', ' ', '-', '*', '`', '<', '!'];

    function parse(G, k) {
        function addNode(content) { //content is expected to always be an array
            const nodeCount = G[0];
            const newLastNote = nodeCount;
            const kantenCount = G[1];
            const currentLastNode = nodeCount - 1;
            const currentLastNodeContentsCopy = k[currentLastNode];
            k[currentLastNode] = content
            k[newLastNote] = currentLastNodeContentsCopy.slice(1,);
            G[0] += 1 //add one to nodes count
            G[1] += 1 //add one to kanten count
            G.push(0);
            G.push(newLastNote)
            console.log(G)
            console.log(k)
        }
        var index = 1;
        const knot = k[index] //array of things to be parsed
        const current = knot[0] //string to be parsed
        if (spetialChars.indexOf(current[0]) !== -1) { //if first letter of the string is a spetial character
            console.log('Spetial Char in:' + current);
            switch (current[0]) { //if it is a single line spetial character
                case '#':
                    //is a title
                    addNode([current]);
                    break;
                case '!':
                    //is an image
                    break;
                case '<':
                    //is <small>
                    break;
                default:
                    break;
            }
        } else {
            console.log('No spetial Char in:' + current);
        }

        // for (const key in k) {
        //     console.log(key)
        //     if (k[key].length > 1) {
        //         parse([2, 1, 0, 1], { 0: ['root'], 1: k[key] })
        //     } else {
        //         return
        //     }
        // }
    }

    parse(graph, knoten);

    return (
        <article className={style.article}>
            <Title text={props.article}></Title>

            <Paragraph content={data} />

            {/* <Paragraph
                content={<Text text='Lorem ipsumLorem ipsumLorem ips
                    umLorem ipsumLorem ipsumLorem ipsumLorem ipsumLore
                    m ipsumLorem ipsumLorem ipsumLorem ipsum' />}>
            </Paragraph>

            <Codeblock code="Code block
                aksdjfhakldfs aksdjfhakldfs 
                aksdjfhakldfimg1s aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs" />

            <Image src={settings.apiURL+'/media/qt-default.png'} alt="An image"></Image>

            <UnorderedList
                list={['I am a list item 1',
                    'I am a list item 2',
                    'I am a list item 3']} />

            <Paragraph
                content={<>I am a generated paragraph.<Link to="/" className={style.a}>With a ink to index</Link></>}>
            </Paragraph>

            <Paragraph content={
                <>
                    <Text text="This is the start of a paragraph with a " />
                    <Code code="code section"></Code>
                    <Text text=" and some mor alksjhd lashdlakj slas da s dlashl dhakjs hmee text." />
                    <Text text=" and some more text." />
                    <Text text=" and so alksjhd lashdlakj slas da s dlashl dhakjs hme more text." />
                    <Text text=" and some more text." />
                    <Text text=" and some more text." />
                    <Text text=" and  alksjhd lashdlakj slas da s dlashl dhakjs hmesome alksjhd lashdlakj slas da s dlashl dhakjs hme more text." />
                    <Text text=" and some more text." />
                    <Text text=" and some more text." />
                    <Text text=" and s alksjhd lashdlakj slas da s dlashl dhakjs hmeome more text." />
                    <Text text=" and some alksjhd lashdlakj slas da s dlashl dhakjs hme more text." />
                    <Code code="code section"></Code>
                    <Text text=" and some more text." />
                    <Text text=" and some more text." />
                    <Text text=" and some m alksjhd lashdlakj slas da s dlashl dhakjs hmeore text." />
                    <Text text=" and some  alksjhd lashdlakj slas da s dlashl dhakjs hmemore text." />
                    <Text text=" and some more text." />
                    <Text text=" and some more text." />
                    <Text text=" and some more text." />
                    <Text text=" and some m alksjhd lashdlakj slas da s dlashl dhakjs hmeore text." />
                    <Text text=" and some more text." />
                    <Text text=" and some more text." />
                </>
            } /> */}

            <OrderedList
                list={['I am an ordered list item 1',
                    'I am an ordered list item 2',
                    'I am an ordered list item 3']} />

            <Small text="I am small text."></Small>
        </article>
    );
}

function Title(props) {
    return (
        <h1 className={style.h1}>{props.text}</h1>
    );
}

function OrderedList(props) {
    // props.list is the array of the list items
    function generateList(list) {
        const code = list.map((element, index) => {
            return (
                <li className={style.li} key={index}>
                    {element}
                </li>
            )
        });
        return code;
    }

    return (
        <ol className={style.ol}>
            {generateList(props.list)}
        </ol>
    );
}

function UnorderedList(props) {
    // props.list is the array of the list items
    function generateList(list) {
        const code = list.map((element, index) => {
            return (
                <li className={style.li} key={index}>
                    {element}
                </li>
            )
        });
        return code;
    }

    return (
        <ul className={style.ul}>
            {generateList(props.list)}
        </ul>
    );
}

function Paragraph(props) {
    return (
        <p className={style.p}>{props.content}</p>
    );
}

function Text(props) {
    return (
        <span className={style.span}>{props.text}</span>
    );
}

function Small(props) {
    return (
        <small className={style.small}>{props.text}</small>
    );
}

function Code(props) {
    return (
        <code className={style.code}>{props.code}</code>
    );
}

function Codeblock(props) {
    return (
        <div className={style.code}>
            <code>
                {props.code}
            </code>
        </div>
    );
}

function Image(props) {
    return (
        <img src={props.src} alt={props.alt} className={style.img}></img>
    )
}