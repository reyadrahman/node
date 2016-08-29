import AccountButton from './AccountButton.jsx';
import LanguageButton from './LanguageButton.jsx';

import React, { PropTypes } from 'react';
import { Glyphicon, Button, Dropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router';

let Header = React.createClass({
    // languageChanged(value) {
    //     console.log('Header: languageChanged', value);
    //     this.props.changeLang(value);
    // },
    //
    // toggleSideMenu() {
    //     this.props.toggleSideMenu();
    // },

    // makeFlag(item) {
    //     const { styles: { header: ss } } = this.props;
    //     let flag = item.value;
    //     flag = flag === 'en' ? 'us' : flag;
    //     return <span className={`flag flag-${flag} ${ss.flag}`} />
    // },

    render() {
        const { className, styles, styles: { header: ss },
                i18n, i18n: { strings: { header: strings } },
                children, extraItemsLeft, extraItemsRight } = this.props;

        // const cs = (Array.isArray(children) ? children : [children]).map(
        //     x => React.cloneElement(x, {
        //         i18n,
        //         styles,
        //         // className: ss.content,
        //     })
        // );
        console.log('***** children: ', children);
        // console.log('***** cs: ', cs);

        return (
            <div className={`${ss.root} ${className || ''}`}>
                <div className={ss.menu}>
                    <div className={ss.leftSection}>
                        { extraItemsLeft }
                        <Link to="/" className={ss.logo} />
                    </div>
                    <div className={ss.middleSection}>

                    </div>
                    <div className={ss.rightSection}>
                        { extraItemsRight }
                        <LanguageButton styles={styles} i18n={i18n} />
                        <AccountButton styles={styles} i18n={i18n} />
                    </div>
                </div>
                { children }
            </div>
        );
    },
});

export default Header;
