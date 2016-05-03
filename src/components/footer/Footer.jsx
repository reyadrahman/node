import React from 'react';
import Link from '../link/Link.jsx';
import { connect } from 'react-redux';
import {changeLang} from '../../actions/actions.js';

import styles from './footer.scss';

let Footer = React.createClass({
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
            {label: ss.vimeo, link: 'hh'},
            {label: ss.linkedIn, link: '!ff', value: 'gg'},
        ];

        const languagesLinks = [
            {label: 'ENGLISH', link: '!en', value: 'en'},
            {label: 'FRANÇAIS', link: '!fr', value: 'fr'},
        ];

        return (
            <div className={styles.root}>
                <div className={styles.logo} />
                <div className={styles.linkBoxesContainer}>
                    <LinkBox title={ss.support} links={supportLinks} />
                    <LinkBox title={ss.theCompany} links={companyLinks} />
                    <LinkBox title={ss.communities} links={communitiesLinks} />
                    <LinkBox title={ss.languages} links={languagesLinks}
                        onSelect={this.languageChanged}
                    />
                </div>
            </div>
        );
    },

    languageChanged(item) {
        this.props.changeLang(item.value);
    },
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
                        let onClick = this.props.onSelect ?
                                      () => this.props.onSelect(l) :
                                      null;
                        return (
                            <Link
                                key={i} to={l.link} className={styles.linkBoxItem}
                                onClick={onClick}
                            >
                                {l.label}
                            </Link>
                        )
                    })
                }
            </div>
        );
    }
});

Footer = connect(
    null,
    dispatch => ({
        changeLang: (lang) => dispatch(changeLang(lang)),
    })
)(Footer);

export default Footer;
