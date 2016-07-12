import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { changeLang } from '../../actions/actions.js';

let Footer = React.createClass({
    languageChanged(e, item) {
        e.preventDefault();
        this.props.changeLang(item.value);
    },

    render() {
        let { styles, styles: { footer: ss },
              i18n: { strings: { footer: strings } } } = this.props;

        const supportLinks = [
            { label: strings.licence, link: '' },
            { label: strings.faqs, link: '' },
            { label: strings.pricing, link: '' },
        ];

        const companyLinks = [
            { label: strings.aboutUs, link: '' },
            { label: strings.press, link: '' },
            { label: strings.contact, link: '' },
            { label: strings.contributors, link: '' },
        ];

        const communitiesLinks = [
            { label: strings.twitter, link: '' },
            { label: strings.youtube, link: '' },
            { label: strings.vimeo, link: '' },
            { label: strings.linkedIn, link: '' },
        ];

        const languagesLinks = [
            { label: 'ENGLISH', link: '', value: 'en' },
            { label: 'FRANÇAIS', link: '', value: 'fr' },
        ];

        return (
            <div className={ss.root}>
                <div className={ss.logo} />
                <div className={ss.linkBoxesContainer}>
                    <LinkBox
                        title={ss.support}
                        links={supportLinks}
                        styles={styles}
                    />
                    <LinkBox
                        title={ss.theCompany}
                        links={companyLinks}
                        styles={styles}
                    />
                    <LinkBox
                        title={ss.communities}
                        links={communitiesLinks}
                        styles={styles}
                    />
                    <LinkBox
                        title={ss.languages}
                        links={languagesLinks}
                        onSelect={this.languageChanged}
                        styles={styles}
                    />
                </div>
            </div>
        );
    },
});

const LinkBox = React.createClass({
    render() {
        const { title, links, styles: { footer: ss }, onSelect } = this.props;
        return (
            <div className={ss.linkBox}>
                <div className={ss.linkBoxTitle}>
                    {title}
                </div>
                {
                    links.map((l, i) => {
                        let onClick = onSelect ?
                                      (e) => onSelect(e, l) :
                                      null;
                        return (
                            <Link
                                key={i} to={l.link} className={ss.linkBoxItem}
                                onClick={onClick}
                            >
                                {l.label}
                            </Link>
                        );
                    })
                }
            </div>
        );
    },
});

Footer = connect(
    null,
    dispatch => ({
        changeLang: (lang) => dispatch(changeLang(lang)),
    })
)(Footer);

export default Footer;
