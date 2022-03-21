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

    const G = [1, 0,]; //kantenliste
    const nD = { 0: 0, };
    const nT = { 0: 'root', };

    function parser(markdown, graph, nodeData, nodeType) {
        const newlineSpetialCharacters = ['# ', '##', '- ', '* ', '``', '!['];
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
            if (!line.slice(0, 2) === '![') isImage = false //if starts with ![
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

        function handleLineWithSpetialCharacters(line, rootNode) {
            const beforeFirstWhiteSpace = line.split(' ', 1)[0];
            if (!isNaN(beforeFirstWhiteSpace * 1)) { //if its a number, ol
                console.warn(`${line} is ol`)
                const olRootNode = createNode('OrderedList', 0, rootNode);
                var listLinesCount = 0;
                var lastListItemNode = null;
                for (const i in markdown) {
                    const currentLineFirstCharacter = markdown[i][0];
                    const currentLineBeforeSpace = markdown[i].split(' ', 1)[0];
                    if (isNaN(currentLineBeforeSpace * 1) &&
                        currentLineFirstCharacter !== ' ') break //if line doesn't start with a number or white space
                    listLinesCount += 1;
                }
                for (var i = 0; i < listLinesCount; i++) { //for all of the lines that are part of the list
                    const listItem = markdown[i];
                    if (listItem[0] === ' ') { //if starts with white space
                        // find all following lines that start with spaces, 
                        var linesWithSpaces = [];
                        for (var j = 0; j < listLinesCount; j++) {
                            try {
                                const nextLine = markdown[i + j];
                                if (nextLine[0] !== ' ') break
                            } catch (error) {
                                console.error(error)
                                console.error('error parsing lines with sapces ')
                                break;
                            }
                            linesWithSpaces.push(markdown[i + j])
                        }
                        i = i + j - 1; //skip lines with spaces
                        // calculate the number of spaces of the first line, 
                        var spacesCount = 0;
                        for (const key in listItem) { //for each letter in the first line that starts with spaces
                            if (listItem[key] === ' ') {
                                spacesCount += 1;
                            } else {
                                break;
                            }
                        }
                        // slice it from all the lines and 
                        linesWithSpaces = linesWithSpaces.map((value) => {
                            return value.slice(spacesCount);
                        })
                        console.log('💥')
                        console.log(linesWithSpaces)
                        // parse them as another markdown document
                        const G = [1, 0,]; //kantenliste
                        const nD = { 0: 0, };
                        const nT = { 0: 'root', };
                        const [childMarkdown, childGraph, childNodeData, childNodeType] = parser(linesWithSpaces, G, nD, nT);
                        console.log('🎗️')
                        console.log(childGraph);
                        console.log(childNodeData);
                        console.log(childNodeType);
                        // merge it to the current graph and nodedata and nodetype
                        const newNodesToMergeCount = childGraph[0] - 1;
                        function findParentOf(node, graph) {
                            const LinksArray = graph.slice(2);
                            for (var index = 1; index < LinksArray.length; index += 2) {
                                if (LinksArray[index] === node) return LinksArray[index - 1];
                            }
                        }
                        var childNodesMapping = { 0: lastListItemNode };
                        for (var k = 1; k <= newNodesToMergeCount; k++) {
                            if (findParentOf(k, childGraph) === 0) { //parent of the node in the child graph is the root of the child graph
                                const newNode = createNode(childNodeType[k], childNodeData[k], childNodesMapping[0])
                                childNodesMapping[k] = newNode;
                            } else {
                                const parentOfChild = findParentOf(k, childGraph);
                                const newNode = createNode(childNodeType[k], childNodeData[k], childNodesMapping[parentOfChild])
                                childNodesMapping[k] = newNode;
                            }
                        }
                    } else { //starts with number
                        if (listItem !== '') {
                            lastListItemNode = createNode('listItem', listItem.slice(listItem.indexOf(' ') + 1), olRootNode)
                        }
                    }
                }
                consumeLine(listLinesCount);
            } else if (isLineImage(line)) {
                function extractSource(input) {
                    var src = input.substring(line.indexOf('(') + 1, line.indexOf('"')); //between ( and "
                    src = src.replace(' ', ''); //remove white spaces
                    if (src.slice(0, 4) === 'http') return src //if starts with http leave as is
                    return src.slice(src.lastIndexOf('/') + 1) //otherwise take only what's after /
                }
                const imgProperties = {
                    src: extractSource(line),
                    alt: line.substring(line.indexOf('[') + 1, line.indexOf(']')),
                    title: line.substring(line.indexOf('"') + 1, line.lastIndexOf('"')),
                }
                createNode('Image', imgProperties, rootNode);
                consumeLine(1);
            } else if (isLineHeading(beforeFirstWhiteSpace)) {  //headings or title
                const text = line.slice(beforeFirstWhiteSpace.length + 1); //remove #s from text
                switch (beforeFirstWhiteSpace.length) {
                    case 1:
                        createNode('Title', text, rootNode);
                        break;
                    case 2:
                        createNode('H2', text, rootNode);
                        break;
                    case 3:
                        createNode('H3', text, rootNode);
                        break;
                    default:
                        createNode('H4', text, rootNode);
                        break;
                }
                consumeLine(1);
            } else if (beforeFirstWhiteSpace === '-' || beforeFirstWhiteSpace === '*') { //ul
                console.warn(line + ' is ul');
                const ulRootNode = createNode('UnorderedList', 0, rootNode);
                var listLinesCount = 0;
                var lastListItemNode = null;
                for (const i in markdown) {
                    const currentLineFirstCharacter = markdown[i][0];
                    if (currentLineFirstCharacter !== '-' &&
                        currentLineFirstCharacter !== '*' &&
                        currentLineFirstCharacter !== ' ') break //if line doesn't start with - * or white space
                    listLinesCount += 1;
                }
                for (var i = 0; i < listLinesCount; i++) { //for all of the lines that are part of the list
                    const listItem = markdown[i];
                    if (listItem[0] === ' ') { //if starts with white space
                        // find all following lines that start with spaces, 
                        var linesWithSpaces = [];
                        for (var j = 0; j < listLinesCount; j++) {
                            try {
                                const nextLine = markdown[i + j];
                                if (nextLine[0] !== ' ') break
                            } catch (error) {
                                console.error(error)
                                console.error('error parsing lines with sapces ')
                                break;
                            }
                            linesWithSpaces.push(markdown[i + j])
                        }
                        i = i + j - 1; //skip lines with spaces
                        // calculate the number of spaces of the first line, 
                        var spacesCount = 0;
                        for (const key in listItem) { //for each letter in the first line that starts with spaces
                            if (listItem[key] === ' ') {
                                spacesCount += 1;
                            } else {
                                break;
                            }
                        }
                        // slice it from all the lines and 
                        linesWithSpaces = linesWithSpaces.map((value) => {
                            return value.slice(spacesCount);
                        })
                        console.log('💥')
                        console.log(linesWithSpaces)
                        // parse them as another markdown document
                        const G = [1, 0,]; //kantenliste
                        const nD = { 0: 0, };
                        const nT = { 0: 'root', };
                        const [childMarkdown, childGraph, childNodeData, childNodeType] = parser(linesWithSpaces, G, nD, nT);
                        console.log('🎗️')
                        console.log(childGraph);
                        console.log(childNodeData);
                        console.log(childNodeType);
                        // merge it to the current graph and nodedata and nodetype
                        const newNodesToMergeCount = childGraph[0] - 1;
                        function findParentOf(node, graph) {
                            const LinksArray = graph.slice(2);
                            for (var index = 1; index < LinksArray.length; index += 2) {
                                if (LinksArray[index] === node) return LinksArray[index - 1];
                            }
                        }
                        var childNodesMapping = { 0: lastListItemNode };
                        for (var k = 1; k <= newNodesToMergeCount; k++) {
                            if (findParentOf(k, childGraph) === 0) { //parent of the node in the child graph is the root of the child graph
                                const newNode = createNode(childNodeType[k], childNodeData[k], childNodesMapping[0])
                                childNodesMapping[k] = newNode;
                            } else {
                                const parentOfChild = findParentOf(k, childGraph);
                                const newNode = createNode(childNodeType[k], childNodeData[k], childNodesMapping[parentOfChild])
                                childNodesMapping[k] = newNode;
                            }
                        }
                    } else { //starts with - or *
                        lastListItemNode = createNode('listItem', listItem.slice(2), ulRootNode)
                    }
                }
                consumeLine(listLinesCount);
            } else if (line.slice(0, 3) === '```') { //code block
                var codeLinesCount = 0;
                for (const i in markdown) {
                    if (i > 0 && markdown[i].slice(0, 3) === '```') break //if not first line and line starts with ```
                    codeLinesCount += 1;
                }
                createNode('Codeblock', markdown.slice(1, codeLinesCount), rootNode)
                consumeLine(codeLinesCount + 2);
            } else {
                console.error(`Error handling line with spetial characters at line: ${line}`)
                consumeLine(1);
            }
        }

        function createNode(type, content, parentNode) {
            const newNodeNumber = getNodesCount();
            graph.push(parentNode);
            graph.push(newNodeNumber);
            nodeData[newNodeNumber] = content;
            nodeType[newNodeNumber] = type;
            updateNodesLinksCount();
            return newNodeNumber;
        }

        function consumeLine(quantity) {
            markdown = markdown.slice(quantity);
        }

        function processLine(line, rootNode) {
            if (line === '') {
                consumeLine(1)
                return
            }
            const firstTwoCharacters = line.slice(0, 2);
            if (newlineSpetialCharacters.includes(firstTwoCharacters) || (!isNaN(firstTwoCharacters * 1) && firstTwoCharacters !== '  ')) {
                handleLineWithSpetialCharacters(line, rootNode)
                console.log('spetial chars: ' + line)
            } else {
                createNode('Paragraph', line, rootNode);
                consumeLine(1);
            };
        }

        var lineCount = 0
        while (markdown.length > 0) { //process until there's no more lines
            console.log('🟡 Progress:');
            console.log(`line:${lineCount}`);
            console.log(`line:${markdown[0]}`)
            console.log(markdown);
            console.log(graph);
            console.log(nodeData);
            console.log(nodeType);
            processLine(markdown[0], 0);
            lineCount += 1;
        }

        return [markdown, graph, nodeData, nodeType]
    }

    const [mdsrc, tree, treeContents, treeTags] = parser(data.replaceAll('\t', '         ').split('\n'), G, nD, nT); //replace all tabs with 9 spaces and create and array wheren each item is a line of the markdown document
    console.log('🟢 Results:');
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