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
    var knoten = { 0: [0], 1: data.split('\n'), };
    var knoteTypes = { 0: 'root', 1: null, };
    const spetialChars = ['#', '-', '*', '`', '<', '!'];

    function parse(G, k, kTypes) {
        k[0][0] += 1; //count rescursions.
        const knot = k[1] //array of things to be parsed
        const current = knot[0] //string to be parsed
        function addNode(content, type) { //content is expected to always be an array
            const nodeCount = G[0];
            const newLastNote = nodeCount;
            const kantenCount = G[1];
            const currentLastNode = nodeCount - 1;
            const currentLastNodeContentsCopy = k[currentLastNode];
            k[currentLastNode] = content
            kTypes[currentLastNode] = type
            k[newLastNote] = currentLastNodeContentsCopy.slice(content.length,);
            kTypes[newLastNote] = null
            G[0] += 1 //add one to nodes count
            G[1] += 1 //add one to kanten count
            G.push(0);
            G.push(newLastNote)
            console.log(G)
            console.log(k)
            console.log(kTypes)
        }
        function complexAddNode(string) { //content is expected to always be an array
            if (!isNaN(string.split(' ', 1) * 1)) { //if starts with a number
                var i = 0;
                while (!isNaN(knot[i].split(' ', 1) * 1) || knot[i].slice(0, 1) == ' ') { //text starts with number or white space
                    if (i + 1 == knot.lengh) break;
                    i += 1;
                }
                const listArray = knot.slice(0, i) //include in node until i
                addNode(listArray, 'ol')
            } else if (string.split(' ', 1) == '-' || string.split(' ', 1) == '*') { //if its an unordered list
                var i = 0;
                while (knot[i].split(' ', 1) == '-' || knot[i].split(' ', 1) == '*' || knot[i].slice(0, 1) == ' ') { //text starts with - or * or white space
                    if (i + 1 == knot.lengh) break;
                    i += 1;
                }
                const listArray = knot.slice(0, i) //include in node until i
                addNode(listArray, 'ul')
            } else if (string == '```') { //if it's code block
                var i = 1;
                while (knot[i] !== '```') { //text isn't ```
                    if (i + 1 == knot.lengh) break;
                    i += 1;
                }
                const listArray = knot.slice(0, i + 1) //include in node until i + 1
                addNode(listArray, 'codeBlock')
            }
        }
        if (current === '') {//if current string is empty delete it from the knoten
            knot.slice(1,);
        } else if (spetialChars.indexOf(current[0]) !== -1 || !isNaN(current.split(' ', 1) * 1)) { //if first letter of the string is a spetial character or starts with number followed by dot
            console.log('Spetial Char in:' + current);
            switch (current[0]) { //if it is a single line spetial character
                case '#':
                    //is a title
                    addNode([current], 'Title');
                    break;
                case '!':
                    //is an image
                    addNode([current], 'Image');
                    break;
                case '<':
                    //is <small>
                    addNode([current], 'Small');
                    break;
                default:
                    complexAddNode(current);
                    break;
            }
        } else { //add normal patagraph
            console.log('No spetial Char in:' + current);
            addNode([current], 'Paragraph')
        }

        function findParentOf(node) {
            const array = G.slice(2);
            for (var i = 1; i < array.length; i += 2) {
                if (array[i] == node) return array[i - 1];
            }
        }

        function mergeGraphs(cG, ck, ckTypes, node) { //merge with parent of original null {node}
            const parentNode = findParentOf(node);
            console.log(`parendNode= ${parentNode}`);
            k[node] = ck[1];
            kTypes[node] = ckTypes[1];
            addNode(ck[2], null);

        }
        console.log('Recursions: '+ k[0][0])
        for (const key in kTypes) {
            if (k[0][0] > 4) { // if there are more than 4 recursions
                console.warn('Max recursions: '+ k[0][0])
                break
            } else if (kTypes[key] == null) { // if there's a node with null type
                console.log(`found ${k[key]} with null type`);
                const [childG, childK, childKTypes] = parse([2, 1, 0, 1], { 0: [k[0][0]], 1: k[key] }, { 0: 'root', 1: null, });
                console.log(childG);
                console.log(childK);
                console.log(childKTypes);
                mergeGraphs(childG, childK, childKTypes, key);
            }
        }

        // for (const key in k) {
        //     console.log(key)
        //     if (k[key].length > 1) {
        //         parse([2, 1, 0, 1], { 0: [], 1: k[key] }, {0: 'root', 1: null,})
        //     } else {
        //         return
        //     }
        // }

        return [G, k, kTypes]
    }

    const resultArray = parse(graph, knoten, knoteTypes);
    console.log('Results:');
    console.log(resultArray[0]);
    console.log(resultArray[1]);
    console.log(resultArray[2]);

    return (
        <article className={style.article}>
            <Title text={props.article}></Title>

            <Paragraph content={data} />
        </article>
    );
}

function Title(props) {
    return (
        <h1 className={style.h1}>{props.text}</h1>
    );
}

function H2(props) {
    return (
        <h2 className={style.h2}>{props.text}</h2>
    );
}

function H3(props) {
    return (
        <h3 className={style.h3}>{props.text}</h3>
    );
}

function H4(props) {
    return (
        <h4 className={style.h4}>{props.text}</h4>
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