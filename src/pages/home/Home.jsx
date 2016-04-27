import React from 'react'
import HomeIntro from '../../components/home-intro/HomeIntro.jsx';
import HomeImageSamples from '../../components/home-image-samples/HomeImageSamples.jsx';
import Footer from '../../components/footer/Footer.jsx';

import styles from './home.scss';

let Home = React.createClass({
    render() {
        return (
            <div>
                <HomeIntro />
                <HomeImageSamples />
                <Footer />
            </div>
        );
    }
});

export default Home
