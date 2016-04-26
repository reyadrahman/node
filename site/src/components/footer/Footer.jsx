import React from 'react';
import { Link } from 'react-router';

import styles from './footer.scss';

const supportLinks = [
    {label: 'LICENCE', link: ''},
    {label: 'FAQs', link: ''},
    {label: 'PRICING', link: ''},
];

const companyLinks = [
    {label: 'ABOUT US', link: ''},
    {label: 'PRESS', link: ''},
    {label: 'CONTACT', link: ''},
    {label: 'CONTRIBUTORS', link: ''},
];

const communitiesLinks = [
    {label: 'TWITTER', link: ''},
    {label: 'YOUTUBE', link: ''},
    {label: 'VIMEO', link: ''},
    {label: 'LINKED IN', link: ''},
];

const Footer = React.createClass({
    render() {
        return (
            <div className={styles.root}>
                <div className={styles.logo} />
                <div className={styles.linkBoxesContainer}>
                    <LinkBox title="SUPPORT" links={supportLinks} />
                    <LinkBox title="THE COMPANY" links={companyLinks} />
                    <LinkBox title="COMMUNITIES" links={communitiesLinks} />
                </div>
            </div>
        );
    }
});

const LinkBox = React.createClass({
    render() {
        return (
            <div className={styles.linkBox}>
                <div className={styles.linkBoxTitle}>
                    {this.props.title}
                </div>
                {
                    this.props.links.map((l,i) => {
                        return (
                            <Link key={i} to={l.link} className={styles.linkBoxItem}>{l.label}</Link>
                        )
                    })
                }
            </div>
        );
    }
});

export default Footer;
