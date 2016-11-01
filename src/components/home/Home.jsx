import * as actions from '../../app-state/actions.js';
import Header from '../header/Header.jsx';
import Menu from './Menu.jsx';
import HomeContactForm from './HomeContactForm.jsx';
import Chat from '../webchat/Chat.jsx';

import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon,
         Grid, Col, Row, Panel, Button, Image, Clearfix,
         Carousel, FormGroup, ControlLabel, FormControl,
         InputGroup, Dropdown } from 'react-bootstrap';
import Lightbox from 'react-images';
import { Link as ScrollLink } from 'react-scroll';




const ribbonUrl = require('../../resources/ribbon.png');
const avatarUrl = require('../../resources/avatar.jpg');
const avatar1Url = require('../../resources/avatars/1.jpg');
const avatar2Url = require('../../resources/avatars/2.jpg');
const avatar3Url = require('../../resources/avatars/3.jpg');
const avatar4Url = require('../../resources/avatars/4.jpg');

const emmanuelUrl = require('../../resources/avatars/6.jpg');
const brunoUrl = require('../../resources/avatars/7.jpg');

const nadellaUrl = require('../../resources/avatars/SatyaNadella.jpg');
const ellisonUrl = require('../../resources/avatars/LarryEllison.jpg');
const zuckerbergUrl = require('../../resources/avatars/MarkZuckerberg.jpg');

const drahiBuilding = require('../../resources/drahi-building.jpg');

const backgroundVideo =  require('../../resources/background-video.mp4');

const screenshots = [
    require('../../resources/screenshots/1.jpg'),
    require('../../resources/screenshots/2.jpg'),
    require('../../resources/screenshots/3.jpg'),
    require('../../resources/screenshots/4.jpg'),
    require('../../resources/screenshots/5.jpg'),
    require('../../resources/screenshots/6.jpg'),
    require('../../resources/screenshots/7.jpg'),
    require('../../resources/screenshots/8.jpg'),
];

const Link = ScrollLink;


let Home = React.createClass({
    getInitialState() {
        return {
            quotesIndex: 0,
            quotesDirection: null,
            isLightboxOpen: false,
            lightboxCurrentIndex: 0,
        };
    },

    quotesOnSelect(selectedIndex, e) {
        this.setState({
            quotesIndex: selectedIndex,
            quotesDirection: e.direction,
        });
    },

    screenshotClicked(i) {
        this.setState({
            isLightboxOpen: true,
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
        this.setState({ isLightboxOpen: false });
    },


    render() {
        const { className, currentUser, i18n, i18n: { strings: { home: strings } } } = this.props;

        const sideMenuStrings = i18n.strings.sideMenu;
        var menu = [
            { 'to': 'services', 'glyph': 'check', 'string': sideMenuStrings.features, 'scroll': true },
            { 'to': 'pricing', 'glyph': 'euro', 'string': sideMenuStrings.pricing, 'scroll': true },
            { 'to': 'team', 'glyph' : 'user', 'string': sideMenuStrings.team, 'scroll': true },
            { 'to': 'screenshots', 'glyph': 'globe', 'string': sideMenuStrings.channels, 'scroll': true },
            { 'to': 'updates',  'glyph': 'tasks', 'string': sideMenuStrings.timeline, 'scroll': true },
            { 'to': 'contact', 'glyph': 'mail', 'string': sideMenuStrings.contact, 'scroll': true }
        ];

        if (currentUser.signedIn) {
            menu = [
                { 'to': '/test', 'glyph': 'cog', 'string': sideMenuStrings.admin },
                ...menu
            ];
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
                    <video className="video" src={backgroundVideo} autoPlay loop>
                        No support message
                    </video>
                    <div className="intro-message">
                       <br/><br/><br/><br/><br/><br/><br/><br/><br/>{ strings.hello }<br/>{ strings.baseline }
                    </div>
                </section>
                <Chat />

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
                                <Glyphicon glyph="globe" />
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
                                <Glyphicon glyph="bell" />
                            </div>
                            <div className="description">
                                <h5>{ strings.notifications_h }</h5>
                                <p>
                                    { strings.notifications_t }
                                </p>
                            </div>
                        </Col>
                        <Clearfix visibleSmBlock />
                        <Col sm={6} md={3} className="service">
                            <div className="service-icon">
                                <Glyphicon glyph="stats" />
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
                                <Glyphicon glyph="user" />
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
                <section id="pricing" className="pricing">
                    <div className="section-heading">
                        <h1>{ strings.pricing}</h1>
                    </div>


                    <Grid>

                        <Col xs={12} sm={6} md={3}>
                            <Panel
                                className="pricing-panel"
                                bsStyle="success"
                                header={'Personnal'}
                                footer={
                                    <Link href="#" to="contact" spy={true} smooth={true} duration={500}><Button bsStyle="primary" bsSize="large" block>Contact</Button></Link>
                                }
                            >
                                <div className="price">
                                    <strong>{ strings.price_1}</strong>
                                </div>
                                <ul className="feature-list">
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_1_1}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_1_2}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="remove" className="text-danger" /> { strings.feature_1_3}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_1_4}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_1_5}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_1_6}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_1_7}
                                    </li>
                                </ul>
                            </Panel>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Panel
                                className="pricing-panel"
                                bsStyle="success"
                                header={'Business'}
                                footer={
                                    <Link href="#" to="contact" spy={true} smooth={true} duration={500}><Button bsStyle="primary" bsSize="large" block>Contact</Button></Link>
                                }
                            >
                                <div className="price">
                                    149€<span className="subscript">/m</span>
                                </div>
                                <ul className="feature-list">
                                  <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_2_1}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_2_2}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_2_3}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_2_4}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_2_5}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_2_6}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_2_7}
                                    </li>
                                </ul>
                            </Panel>
                        </Col>
                        <Clearfix visibleSmBlock />
                        <Col xs={12} sm={6} md={3}>
                            <Panel
                                className="pricing-panel"
                                bsStyle="primary"
                                header={[
                                    'Reseller'
                                ]}
                                footer={
                                    <Link href="#" to="contact" spy={true} smooth={true} duration={500}><Button bsStyle="primary" bsSize="large" block>Contact</Button></Link>
                                }
                            >
                                <div className="price">
                                    499€<span className="subscript">/m</span>
                                </div>
                                <ul className="feature-list">
                                 <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_3_1}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_3_2}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_3_3}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_3_4}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_3_5}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_3_6}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_3_7}
                                    </li>
                                </ul>
                            </Panel>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Panel
                                className="pricing-panel"
                                bsStyle="danger"
                                header={'Enterprise'}
                                footer={
                                    <Link href="#" to="contact" spy={true} smooth={true} duration={500}><Button bsStyle="primary" bsSize="large" block>Contact</Button></Link>
                                }
                            >
                                <div className="price">{ strings.price_4}</div>
                                <ul className="feature-list">
                                  <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_4_1}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_4_2}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_4_3}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_4_4}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_4_5}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_4_6}
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> { strings.feature_4_7}
                                    </li>
                                </ul>
                            </Panel>
                        </Col>
                    </Grid>
                </section>
                <section id="team" className="team">
                    <div className="section-heading">
                        <h1>{ strings.team_h}</h1>
                        <p>
                           { strings.team_t}
                        </p>
                    </div>
                    <Grid>
                        <Col xs={12} sm={6} md={3} mdOffset={3}>
                            <div className="team-member">
                                <div className="name">
                                    Emmanuel Prat
                                </div>
                                <div className="subtitle">
                                    CEO & CTO
                                </div>
                                <div className="avatar">
                                    <Image src={emmanuelUrl} responsive />
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <div className="team-member">
                                <div className="name">
                                    Bruno Génuit
                                </div>
                                <div className="subtitle">
                                    COO
                                </div>
                                <div className="avatar">
                                    <Image src={brunoUrl} responsive />
                                </div>
                            </div>
                        </Col>
                    </Grid>
                </section>

                <section id="screenshots" className="screenshots">
                    <div className="section-heading">
                        <h1>{ strings.screenshots_h}</h1>
                        <p>
                            { strings.screenshots_t}
                        </p>
                    </div>

                    <Grid className="screenshots-grid">
                        <Col xs={12} sm={6} md={4} className="screenshot">
                            <a href="https://www.messenger.com/t/257424221305928" title="Messenger" className="messenger"></a>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="screenshot">
                            <a href="https://slack.com/signin?redir=%2Foauth%2Freflow%3Fclient_id%3D60397725745.69597352256%26redirect_uri%3Dhttps%253A%252F%252Fslack.botframework.com%252FHome%252Fauth%26state%3Ddeepiks%26scope%3Dbot" title="Slack" className="slack"></a>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="screenshot">
                            <a href="https://webchat.botframework.com/embed/deepiks?s=B3lvwUz4p0Q.cwA.-YA.toIk9HIRPR2aBTvrdCb5YYX9xcoHd18ibusSV29lyeg" title="Web" className="web"></a>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="screenshot">
                            <a href="https://telegram.me/deepiks_painting_bot" title="Telegram" className="telegram"></a>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="screenshot">
                            <a href="https://join.skype.com/bot/e105d635-f622-4dfa-a35a-6844809b62ce" title="Skype"className="skype"></a>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="screenshot">
                            <a href="mailto:deepiks_painting@sparkbot.io" title="Spark" className="spark"></a>
                        </Col>
                    </Grid>

                </section>

                <section id="updates" className="updates">
                    <div className="section-heading">
                        <h1>{ strings.timeline_h}</h1>
                        <p>
                            { strings.timeline_t}
                        </p>
                    </div>

                    <div className="timeline-centered">
                        <article className="timeline-entry">

                            <div className="timeline-entry-inner">
                                <time className="timeline-time" dateTime="2014-01-10T03:45"><span>{ strings.timeline_5_d}</span> <span></span></time>

                                <div className="timeline-icon bg-success" />

                                <div className="timeline-label">
                                    <h2>{ strings.timeline_5_h}</h2>
                                    <p>{ strings.timeline_5_t}</p>
                                </div>
                            </div>

                        </article>
                        <article className="timeline-entry left-aligned">

                            <div className="timeline-entry-inner">
                                <time className="timeline-time" dateTime="2014-01-10T03:45"><span>{ strings.timeline_4_d}</span> <span></span></time>

                                <div className="timeline-icon bg-secondary">
                                </div>

                                <div className="timeline-label">
                                    <h2>{ strings.timeline_4_h}</h2>
                                    <p>{ strings.timeline_4_t}</p>
                                 </div>
                            </div>

                        </article>


                        <article className="timeline-entry">

                            <div className="timeline-entry-inner">
                                <time className="timeline-time" dateTime="2014-01-09T13:22"><span>{ strings.timeline_3_d}</span> <span></span></time>

                                <div className="timeline-icon bg-info">
                                </div>

                                <div className="timeline-label">
                                    <h2>{ strings.timeline_3_h}</h2>
                                    <p>{ strings.timeline_3_t}</p>
                                    <img src={drahiBuilding} alt="map" className="img-responsive" />
                                </div>
                            </div>

                        </article>

                        <article className="timeline-entry left-aligned">

                            <div className="timeline-entry-inner">
                                <time className="timeline-time" dateTime="2014-01-10T03:45"><span>{ strings.timeline_2_d}</span> <span></span></time>

                                <div className="timeline-icon bg-warning">
                                </div>

                                <div className="timeline-label">
                                    <h2>{ strings.timeline_2_h}</h2>
                                    <p>{ strings.timeline_2_t}</p>

                                </div>
                            </div>

                        </article>


                        <article className="timeline-entry begin">

                            <div className="timeline-entry-inner">

                                <div className="timeline-icon" style={{
                                        transform: 'rotate(-90deg)'
                                    }}>
                                </div>

                            </div>

                        </article>
                    </div>
                </section>

                <section id="quotes" className="quotes">
                    <div className="quotation-mark">“</div>
                    <Carousel
                        activeIndex={this.state.quotesIndex}
                        direction={this.state.quotesDirection}
                        onSelect={this.quotesOnSelect}
                        className="carousel" controls={false} slide={false}>
                        <Carousel.Item className="carousel-item">
                            <p><i>Artificial Intelligence (AI)-powered bots will become the next interface, shaping our interactions with the applications and devices we rely on.</i> Satya Nadella, CEO, Microsoft.</p>
                            <img src={nadellaUrl} className="avatar" />
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                            <p><i>No one wants to have to install a new app for every business or service that they want to interact with. We think that you should just be able to message a business in the same way that you message a friend.</i> Mark Zuckerberg, CEO, Facebook</p>
                            <img src={zuckerbergUrl} className="avatar" />
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                            <p>							<i>Chatbots will be one of the primary ways to interface with a lot of digital services.</i> 	Larry Ellison, Executive Chairman and CTO, Oracle Corporation. </p>

                            <img src={ellisonUrl} className="avatar" />
                        </Carousel.Item>
                    </Carousel>
                </section>

                <section id="contact" className="contact">
                    <div className="section-heading">
                        <h1>{ strings.contact_h}</h1>
                        <p>{ strings.contact_t}</p>
                    </div>
                    <HomeContactForm i18n={i18n} />
                </section>

                <footer>

                    <div className="bottom-footer">
                        Copyright © 2015 - Deepiks
                    </div>

                </footer>

                <Lightbox
                    currentImage={this.state.lightboxCurrentIndex}
                    images={screenshots.map(x => ({ src: x }))}
                    isOpen={this.state.isLightboxOpen}
                    onClickImage={this.lightboxHandleClickImage}
                    onClickNext={this.lightboxGotoNext}
                    onClickPrev={this.lightboxGotoPrevious}
                    onClickThumbnail={this.lightboxGotoImage}
                    onClose={this.closeLightbox}
                    showThumbnails
                />
            </div>
        );
    },
});

Home = connect(
    state => ({
        currentUser: state.currentUser,
    })
)(Home)

export default Home;
