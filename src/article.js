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

    var G = [1, 0,]; //kantenliste
    var nD = { 0: 0, };
    var nT = { 0: 'root', };

    function parser(markdown, graph, nodeData, nodeType) {
        const newlineSpetialCharacters = ['# ', '##', '- ', '* ', '``', '!['];
        var currentParentNode = 0;
        function getNodesCount() { return graph[0] };
        function updateNodesLinksCount() {
            const linksArray = graph.slice(2);
            var nodesArray = [];
            const linksCount = linksArray.length / 2;
            for (const i in linksArray) {
                const nodeIndex = linksArray[i];
                if (!nodesArray.includes(nodeIndex)) nodesArray.push(nodeIndex)
            }
            const nodesCount = nodesArray.length;
            graph[0] = nodesCount;
            graph[1] = linksCount;
        }

        function isLineImage(line) {
            var isImage = true;
            if (!line.slice(0, 2) == '![') isImage = false //if starts correctly
            //bellow checks order of things
            if (line.indexOf('!') > line.indexOf('[')) isImage = false;
            if (line.indexOf('[') > line.indexOf(']')) isImage = false;
            if (line.indexOf(']') > line.indexOf('(')) isImage = false;
            if (line.indexOf('(') > line.indexOf('"')) isImage = false;
            if (line.indexOf('"') > line.lastIndexOf('"')) isImage = false;
            if (line.lastIndexOf('"') > line.indexOf(')')) isImage = false;
            if (line.slice(line.indexOf(')')) !== ')') isImage = false; //if there's anything after )
            return isImage
        }

        function isLineHeading(beforeFirstWhiteSpace) {
            var isHeading = true;
            for (const key in beforeFirstWhiteSpace) {
                if (beforeFirstWhiteSpace[key] !== '#') isHeading = false;
            }
            return isHeading
        }

        function handleLineWithSpetialCharacters(line) {
            const beforeFirstWhiteSpace = line.split(' ', 1)[0];
            if (!isNaN(beforeFirstWhiteSpace * 1)) { //if its a number, ol
                consumeLine(1); //TODO
            } else if (isLineImage(line)) {
                console.warn(line + ' is an image'); //img
                function extractSource(input) {
                    var src = input.substring(line.indexOf('(') + 1, line.indexOf('"')); //between ( and "
                    src = src.replace(' ', ''); //remove white spaces
                    if (src.slice(0, 4) == 'http') return src //if starts with http leave as is
                    return src.slice(src.lastIndexOf('/') + 1) //otherwise take only what's after /
                }
                const imgProperties = {
                    src: extractSource(line),
                    alt: line.substring(line.indexOf('[') + 1, line.indexOf(']')),
                    title: line.substring(line.indexOf('"') + 1, line.lastIndexOf('"')),
                }
                createNode('Image', imgProperties);
                consumeLine(1);
            } else if (isLineHeading(beforeFirstWhiteSpace)) {  //headings or title
                console.warn(line + 'is heading');
                const text = line.slice(beforeFirstWhiteSpace.length + 1); //remove #s from text
                switch (beforeFirstWhiteSpace.length) {
                    case 1:
                        createNode('Title', text);
                        break;
                    case 2:
                        createNode('H2', text);
                        break;
                    case 3:
                        createNode('H3', text);
                        break;
                    default:
                        createNode('H4', text);
                        break;
                }
                consumeLine(1);
            } else if (beforeFirstWhiteSpace == '-' || beforeFirstWhiteSpace == '*') { //ul
                consumeLine(1); //TODO
            } else if (beforeFirstWhiteSpace == '```') { //code block
                consumeLine(1); //TODO
            }
        }
        [].flat()
        function createNode(type, content) {
            const newNodeNumber = getNodesCount();
            graph.push(currentParentNode);
            graph.push(newNodeNumber);
            nodeData[newNodeNumber] = content;
            nodeType[newNodeNumber] = type;
            updateNodesLinksCount();
        }

        function consumeLine(quantity) {
            markdown = markdown.slice(quantity);
        }

        function processLine(line) {
            if (line == '') {
                consumeLine(1)
                return
            }
            const firstTwoCharacters = line.slice(0, 2);
            if (newlineSpetialCharacters.includes(firstTwoCharacters) || !isNaN(firstTwoCharacters * 1) && firstTwoCharacters !== '  ') {
                handleLineWithSpetialCharacters(line)
                console.log('spetial chars: ' + line)
            } else {
                createNode('Paragraph', line);
                consumeLine(1);
            };
        }

        var line = 0
        while (markdown.length > 0) { //process until there's no more lines
            console.warn('Progress:');
            console.log(`line:${line}`);
            console.log(`line:${markdown[0]}`)
            console.log(markdown);
            console.log(graph);
            console.log(nodeData);
            console.log(nodeType);
            processLine(markdown[0]);
            line += 1;
        }

        return [markdown, graph, nodeData, nodeType]
    }

    const [mdsrc, tree, treeContents, treeTags] = parser(data.split('\n'), G, nD, nT);
    console.log('Results:');
    console.log(mdsrc);
    console.log(tree);
    console.log(treeContents);
    console.log(treeTags);

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
        <img src={props.src} alt={props.alt} title={props.title} className={style.img}></img>
    )
}