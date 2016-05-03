import React from 'react';
import ReactDOM from 'react-dom';
import HomeIntro from '../home-intro/HomeIntro.jsx';
import HomeImageSamples from '../home-image-samples/HomeImageSamples.jsx';
import Footer from '../footer/Footer.jsx';
import smoothScroll from '../../misc/smoothscroll.js';

import styles from './home.scss';

let Home = React.createClass({
    render() {
        console.log('Home render, this.props:', this.props);
        let {i18n} = this.props;
        return (
            <div>
                <HomeIntro i18n={i18n} scrollDown={this.scrollDown} />
                <HomeImageSamples
                    i18n={i18n}
                    ref={(e) => this.secondPageElem = e} />
                <Footer i18n={i18n} />
            </div>
        );
    },

    scrollDown() {
        if (!this.secondPageElem) return;
        let dom = ReactDOM.findDOMNode(this.secondPageElem);
        if (!dom) return;
        smoothScroll(dom, 500);
    },
});

export default Home
