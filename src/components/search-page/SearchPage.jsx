import React from 'react';
import Header from '../header/Header.jsx';
import Footer from '../footer/Footer.jsx';

import styles from './search-page.scss';

let SearchPage = React.createClass({
    render() {
        let { i18n } = this.props;
        console.log('SearchPage: ', this.props);
        return (
            <div>
                <Header i18n={i18n} />
                <Footer i18n={i18n} />
            </div>
        );
    },
});

export default SearchPage;
