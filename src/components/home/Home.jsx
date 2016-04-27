import React from 'react'
import HomeIntro from '../home-intro/HomeIntro.jsx';
import HomeImageSamples from '../home-image-samples/HomeImageSamples.jsx';
import Footer from '../footer/Footer.jsx';

import styles from './home.scss';

let Home = React.createClass({
    render() {
        console.log('Home render');
        let {i18n} = this.props;
        return (
            <div>
                <HomeIntro i18n={i18n} />
                <HomeImageSamples i18n={i18n} />
                <Footer i18n={i18n} />
            </div>
        );
    }
});

export default Home
