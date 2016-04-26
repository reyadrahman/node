import React from 'react'
import HomeIntro from '../../components/home-intro/HomeIntro.jsx';
import HomeImageSamples from '../../components/home-image-samples/HomeImageSamples.jsx';

import styles from './home.scss';

let Home = React.createClass({
    render() {
        return (
            <div>
                <HomeIntro />
                <HomeImageSamples />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
            </div>
        );
    }
});

export default Home
