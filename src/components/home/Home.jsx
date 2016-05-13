import React from 'react';
import ReactDOM from 'react-dom';
import HomeIntro from '../home-intro/HomeIntro.jsx';
import HomeImageSamples from '../home-image-samples/HomeImageSamples.jsx';
import Footer from '../footer/Footer.jsx';
import smoothScroll from '../../misc/smoothscroll.js';

let Home = React.createClass({

    // scrollDown() {
    //     if (!this.secondPageElem) return;
    //     const dom = ReactDOM.findDOMNode(this.secondPageElem);
    //     if (!dom) return;
    //     smoothScroll(dom, 500);
    // },

    render() {
        console.log('Home render, this.props:', this.props);
        const { styles, styles: { home: ss }, i18n } = this.props;
        return (
            <div>
                <HomeIntro i18n={i18n} styles={styles} scrollDown={this.scrollDown} />

                {/*
                <HomeImageSamples
                    i18n={i18n}
                    styles={styles}
                    ref={(e) => this.secondPageElem = e}
                />
                <Footer i18n={i18n} styles={styles} />
                */}
            </div>
        );
    },
});

export default Home;
