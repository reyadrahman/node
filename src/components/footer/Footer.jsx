import React from 'react';
import { Link } from 'react-router';

import styles from './footer.scss';

const Footer = React.createClass({
    render() {
        let {i18n: {strings: {footer: ss}}} = this.props;

        const supportLinks = [
            {label: ss.licence, link: ''},
            {label: ss.faqs, link: ''},
            {label: ss.pricing, link: ''},
        ];

        const companyLinks = [
            {label: ss.aboutUs, link: ''},
            {label: ss.press, link: ''},
            {label: ss.contact, link: ''},
            {label: ss.contributors, link: ''},
        ];

        const communitiesLinks = [
            {label: ss.twitter, link: ''},
            {label: ss.youtube, link: ''},
            {label: ss.vimeo, link: ''},
            {label: ss.linkedIn, link: ''},
        ];

        return (
            <div className={styles.root}>
                <div className={styles.logo} />
                <div className={styles.linkBoxesContainer}>
                    <LinkBox title={ss.support} links={supportLinks} />
                    <LinkBox title={ss.theCompany} links={companyLinks} />
                    <LinkBox title={ss.communities} links={communitiesLinks} />
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
