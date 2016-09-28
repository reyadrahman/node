import * as actions from '../../app-state/actions.js';
import Header from '../header/Header.jsx';
import HomeMenu from './HomeMenu.jsx';
import HomeContactForm from './HomeContactForm.jsx';

import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon,
         Grid, Col, Row, Panel, Button, Image, Clearfix,
         Carousel, FormGroup, ControlLabel, FormControl,
         InputGroup, Dropdown } from 'react-bootstrap';
import Lightbox from 'react-images';



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

const mapUrl = require('../../resources/map.png');

const backgroundPoster =  require('../../resources/background-video-poster.jpg');

const timelinePhoto =  require('../../resources/drahi-building.jpg');

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

const channels = [
    require('../../resources/channels/deepiks-painting-spark.png'),
    require('../../resources/channels/deepiks-painting-messenger.png'),
    require('../../resources/channels/deepiks-painting-slack.png'),
    require('../../resources/channels/deepiks-painting-telegram.png'),
    require('../../resources/channels/deepiks-painting-skype.png'),
    require('../../resources/channels/deepiks-painting-web.png'),
];


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
        console.log('quote selected=' + selectedIndex + ', direction=' + e.direction);
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
        console.log('close lightbox');
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
        console.log('Home render');
        const { className, i18n, i18n: { strings: { home: strings } } } = this.props;

        return (
            <div className="home-comp">
                <Header
                    className={`home-comp ${className || ''}`}
                    i18n={i18n}
                    leftItemsBeforeLogo={[
                        <HomeMenu i18n={i18n} />
                    ]}
                />
                <section className="intro">
                    <div className="intro-message">
                       { strings.baseline }
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
                                    <Button bsStyle="primary" bsSize="large" block>Test</Button>
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
                                    <Button bsStyle="primary" bsSize="large" block>Contact</Button>
                                }
                            >
                                <div className="price">
                                    $99<span className="subscript">/mo</span>
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
                                    <Button bsStyle="primary" bsSize="large" block>Contact</Button>
                                }
                            >
                                <div className="price">
                                    $350<span className="subscript">/mo</span>
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
                                    <Button bsStyle="primary" bsSize="large" block>Contact</Button>
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
                        {
                            channels.map((x, i) => (
                                <Col xs={12} sm={6} md={4}>
                                    <img src={x} onClick={() => this.screenshotClicked(i)} />
                                </Col>
                            ))
                        }
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
                                    <img src={mapUrl} alt="map" className="img-responsive" />
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
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
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

export default Home;
