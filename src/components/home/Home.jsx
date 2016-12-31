import React from 'react';
import Header from '../header/Header.jsx';
import Menu from './Menu.jsx';
import {connect} from 'react-redux';
import {Glyphicon, Grid, Col, Clearfix} from 'react-bootstrap';

const backgroundPicture = require('../../resources/background-picture.jpg');

let Home = React.createClass({
    getInitialState() {
        return {
            quotesIndex:          0,
            quotesDirection:      null,
            isLightboxOpen:       false,
            lightboxCurrentIndex: 0,
        };
    },

    quotesOnSelect(selectedIndex, e) {
        this.setState({
            quotesIndex:     selectedIndex,
            quotesDirection: e.direction,
        });
    },

    screenshotClicked(i) {
        this.setState({
            isLightboxOpen:       true,
            lightboxCurrentIndex: i,
        });
    },

    closeLightbox() {
    },

    lightboxHandleClickImage() {

    },

    lightboxGotoNext() {
        this.setState({
            lightboxCurrentIndex: this.state.lightboxCurrentIndex + 1
        });
    },

    lightboxGotoPrevious() {
        this.setState({
            lightboxCurrentIndex: this.state.lightboxCurrentIndex - 1
        });
    },

    lightboxGotoImage(i) {
        this.setState({
            lightboxCurrentIndex: i,
        });
    },

    closeLightbox() {
        this.setState({isLightboxOpen: false});
    },


    render() {
        const {className, currentUser, i18n, i18n: {strings: {home: strings}}} = this.props;

        const sideMenuStrings = i18n.strings.sideMenu;
        let menu              = [
            {'to': 'services', 'glyph': 'check', 'string': sideMenuStrings.features, 'scroll': true},
        ];

        let githubRibbon;

        if (currentUser.signedIn) {
            menu.unshift({'to': '/test', 'glyph': 'cog', 'string': sideMenuStrings.admin});
        } else {
            githubRibbon = (
                <a href="https://github.com/deepiksdev/node" className="github-ribbon">
                    <img
                        src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67"
                        alt="Fork me on GitHub"
                        data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"/></a>
            )
        }

        return (
            <div className="home-comp">
                <Header
                    className={`home-comp ${className || ''}`}
                    i18n={i18n}
                    leftItemsBeforeLogo={[
                        <Menu i18n={i18n} menu={menu} />
                    ]}
                />
                <section className="intro">
                    <div className="background-image">
                        <img src={backgroundPicture}/>
                    </div>

                    <div className="intro-message">
                        {githubRibbon}
                        <br/><br/><br/><br/><br/><br/><br/><br/><br/>
                        { strings.hello }<br/>{ strings.baseline }
                    </div>
                </section>

                <section id="services" className="services">
                    <div className="section-heading">
                        <h1>{ strings.services_h }</h1>
                        <p>
                            { strings.services_t }
                        </p>
                    </div>
                    <Grid>
                        <Col sm={6} md={3} className="service">
                            <div className="service-icon">
                                <Glyphicon glyph="globe"/>
                            </div>
                            <div className="description">
                                <h5>{ strings.universal_h }</h5>
                                <p>
                                    { strings.universal_t }
                                </p>
                            </div>
                        </Col>
                        <Col sm={6} md={3} className="service">
                            <div className="service-icon">
                                <Glyphicon glyph="bell"/>
                            </div>
                            <div className="description">
                                <h5>{ strings.notifications_h }</h5>
                                <p>
                                    { strings.notifications_t }
                                </p>
                            </div>
                        </Col>
                        <Clearfix visibleSmBlock/>
                        <Col sm={6} md={3} className="service">
                            <div className="service-icon">
                                <Glyphicon glyph="stats"/>
                            </div>
                            <div className="description">
                                <h5>{ strings.tracking_h }</h5>
                                <p>
                                    { strings.tracking_t }
                                </p>
                            </div>
                        </Col>
                        <Col sm={6} md={3} className="service">
                            <div className="service-icon">
                                <Glyphicon glyph="user"/>
                            </div>
                            <div className="description">
                                <h5>{ strings.ai_h }</h5>
                                <p>
                                    { strings.ai_t }
                                </p>
                            </div>
                        </Col>
                    </Grid>
                </section>

                <footer>

                    <div className="bottom-footer">
                        Copyright © 2017 - Deepiks
                    </div>

                </footer>
            </div>
        );
    },
});

Home = connect(
    state => ({
        currentUser: state.currentUser,
    })
)(Home);

export default Home;
