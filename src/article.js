import React from "react";
import style from './article.module.css';
import { Link } from "react-router-dom";

import img1 from './articles/img/qt-default.png';

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

class Article extends React.Component {
    render() {
        return (
            <article className={style.article}>
                <Title text="Title of article"></Title>

                <Paragraph
                    content={<Text text='Lorem ipsumLorem ipsumLorem ips
                    umLorem ipsumLorem ipsumLorem ipsumLorem ipsumLore
                    m ipsumLorem ipsumLorem ipsumLorem ipsum' />}>
                </Paragraph>

                <Codeblock code="Code block
                aksdjfhakldfs aksdjfhakldfs 
                aksdjfhakldfimg1s aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs aksdjfhakldfs" />

                <Image src={img1} alt="An image"></Image>

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
                } />

                <OrderedList
                    list={['I am an ordered list item 1',
                        'I am an ordered list item 2',
                        'I am an ordered list item 3']} />

                <Small text="I am small text."></Small>
            </article>
        );
    };
}

export default Article;