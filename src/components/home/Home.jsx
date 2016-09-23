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


const ribbonUrl = require('../../public/ribbon.png');
const avatarUrl = require('../../public/avatar.jpg');
const avatar1Url = require('../../public/avatars/1.jpg');
const avatar2Url = require('../../public/avatars/2.jpg');
const avatar3Url = require('../../public/avatars/3.jpg');
const avatar4Url = require('../../public/avatars/4.jpg');
const mapUrl = require('../../public/map.png');
const screenshots = [
    require('../../public/screenshots/1.jpg'),
    require('../../public/screenshots/2.jpg'),
    require('../../public/screenshots/3.jpg'),
    require('../../public/screenshots/4.jpg'),
    require('../../public/screenshots/5.jpg'),
    require('../../public/screenshots/6.jpg'),
    require('../../public/screenshots/7.jpg'),
    require('../../public/screenshots/8.jpg'),
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
                    extraItemsLeft={[
                        <HomeMenu i18n={i18n} />
                    ]}
                />
                <section className="intro">
                    <div className="intro-message">
                       Hi. We are a universal bot platform powered by AI.
                    </div>
                </section>

                <section id="pricing" className="pricing">
                    <div className="section-heading">
                        <h1>Our Deals</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>


                    <Grid>

                        <Col xs={12} sm={6} md={3}>
                            <Panel
                                className="pricing-panel"
                                bsStyle="success"
                                header={'Lite version'}
                                footer={
                                    <Button bsStyle="primary" bsSize="large" block>Download <span>now!</span></Button>
                                }
                            >
                                <div className="price">
                                    <strong>FREE</strong>
                                </div>
                                <ul className="feature-list">
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> 2 years access <strong> to all storage locations</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> <strong>Unlimited</strong> storage
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> Limited <strong> download quota</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> <strong>Smart File Storage</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> All time <strong> updates</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="remove" className="text-danger" /> <strong>Unlimited</strong> access to all files
                                    </li>
                                    <li>
                                        <Glyphicon glyph="remove" className="text-danger" /> <strong>Allowed</strong> to be exclusing per sale
                                    </li>
                                </ul>
                            </Panel>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Panel
                                className="pricing-panel"
                                bsStyle="success"
                                header={'Personal Project'}
                                footer={
                                    <Button bsStyle="primary" bsSize="large" block>Purchase <span>via paypal</span></Button>
                                }
                            >
                                <div className="price">
                                    $99<span className="subscript">/mo</span>
                                </div>
                                <ul className="feature-list">
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> 2 years access <strong> to all storage locations</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> <strong>Unlimited</strong> storage
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> Limited <strong> download quota</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> <strong>Smart File Storage</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> All time <strong> updates</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="remove" className="text-danger" /> <strong>Unlimited</strong> access to all files
                                    </li>
                                    <li>
                                        <Glyphicon glyph="remove" className="text-danger" /> <strong>Allowed</strong> to be exclusing per sale
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
                                    <img src={ribbonUrl} className="ribbon" />,
                                    'Developer Bundle'
                                ]}
                                footer={
                                    <Button bsStyle="primary" bsSize="large" block>Purchase <span>via paypal</span></Button>
                                }
                            >
                                <div className="price">
                                    $350<span className="subscript">/mo</span>
                                </div>
                                <ul className="feature-list">
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> 2 years access <strong> to all storage locations</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> <strong>Unlimited</strong> storage
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> Limited <strong> download quota</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> <strong>Smart File Storage</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> All time <strong> updates</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="remove" className="text-danger" /> <strong>Unlimited</strong> access to all files
                                    </li>
                                    <li>
                                        <Glyphicon glyph="remove" className="text-danger" /> <strong>Allowed</strong> to be exclusing per sale
                                    </li>
                                </ul>
                            </Panel>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Panel
                                className="pricing-panel"
                                bsStyle="danger"
                                header={'Premium Package'}
                                footer={
                                    <Button bsStyle="primary" bsSize="large" block>Purchase <span>via paypal</span></Button>
                                }
                            >
                                <div className="price">
                                    $999<span className="subscript">/mo</span>
                                </div>
                                <ul className="feature-list">
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> 2 years access <strong> to all storage locations</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> <strong>Unlimited</strong> storage
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> Limited <strong> download quota</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> <strong>Smart File Storage</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> All time <strong> updates</strong>
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> <strong>Unlimited</strong> access to all files
                                    </li>
                                    <li>
                                        <Glyphicon glyph="ok" className="text-success" /> <strong>Allowed</strong> to be exclusing per sale
                                    </li>
                                </ul>
                            </Panel>
                        </Col>
                    </Grid>
                </section>
                <section id="team" className="team">
                    <div className="section-heading">
                        <h1>Deepiks Team</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>
                    <Grid>
                        <Col xs={12} sm={6} md={3}>
                            <div className="team-member">
                                <div className="name">
                                    Emmanuel
                                </div>
                                <div className="subtitle">
                                    CEO
                                </div>
                                <div className="avatar">
                                    <Image src={avatar1Url} responsive />
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <div className="team-member">
                                <div className="name">
                                    Sean
                                </div>
                                <div className="subtitle">
                                    Engineer
                                </div>
                                <div className="avatar">
                                    <Image src={avatar2Url} responsive />
                                </div>
                            </div>
                        </Col>
                        <Clearfix visibleSmBlock />
                        <Col xs={12} sm={6} md={3}>
                            <div className="team-member">
                                <div className="name">
                                    Lucy
                                </div>
                                <div className="subtitle">
                                    Engineer
                                </div>
                                <div className="avatar">
                                    <Image src={avatar3Url} responsive />
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <div className="team-member">
                                <div className="name">
                                    Jane
                                </div>
                                <div className="subtitle">
                                    Marketing
                                </div>
                                <div className="avatar">
                                    <Image src={avatar4Url} responsive />
                                </div>
                            </div>
                        </Col>
                    </Grid>
                </section>
                <section id="services" className="services">
                    <div className="section-heading">
                        <h1>The Power of SmartAdmin</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>
                    <Grid>
                        <Col sm={3} md={3} className="service">
                            <div className="service-icon">
                                <Glyphicon glyph="text-background" />
                            </div>
                            <div className="description">
                                <h5>Localization</h5>
                                <p>
                                    Vestibulum tincidunt enim in pharetra malesuada. Duis semper magna metus electram accommodare.
                                </p>
                            </div>
                        </Col>
                        <Col sm={3} md={3} className="service">
                            <div className="service-icon">
                                <Glyphicon glyph="briefcase" />
                            </div>
                            <div className="description">
                                <h5>Compact</h5>
                                <p>
                                    Vestibulum tincidunt enim in pharetra malesuada. Duis semper magna metus electram accommodare.
                                </p>
                            </div>
                        </Col>
                        <Clearfix visibleSmBlock />
                        <Col sm={3} md={3} className="service">
                            <div className="service-icon">
                                <Glyphicon glyph="cog" />
                            </div>
                            <div className="description">
                                <h5>State of the Art</h5>
                                <p>
                                    Vestibulum tincidunt enim in pharetra malesuada. Duis semper magna metus electram accommodare.
                                </p>
                            </div>
                        </Col>
                        <Col sm={3} md={3} className="service">
                            <div className="service-icon">
                                <Glyphicon glyph="cloud" />
                            </div>
                            <div className="description">
                                <h5>Cloud System</h5>
                                <p>
                                    Vestibulum tincidunt enim in pharetra malesuada. Duis semper magna metus electram accommodare.
                                </p>
                            </div>
                        </Col>
                    </Grid>
                </section>

                <section id="screenshots" className="screenshots">
                    <div className="section-heading">
                        <h1>Screenshots</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>

                    <Grid className="screenshots-grid">
                        {
                            screenshots.map((x, i) => (
                                <Col md={3}>
                                    <img src={x} onClick={() => this.screenshotClicked(i)} />
                                </Col>
                            ))
                        }
                    </Grid>

                </section>

                <section id="updates" className="updates">
                    <div className="section-heading">
                        <h1>Updates</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>

                    <div className="timeline-centered">
                        <article className="timeline-entry">

                            <div className="timeline-entry-inner">
                                <time className="timeline-time" dateTime="2014-01-10T03:45"><span>03:45 AM</span> <span>Today</span></time>

                                <div className="timeline-icon bg-success" />

                                <div className="timeline-label">
                                    <h2><a href="#">SmartAdmin:</a> <span>Patch was released today</span></h2>
                                    <p>Tolerably earnestly middleton extremely distrusts she boy now not. Add and offered prepare how cordial two promise. Greatly who affixed suppose but enquire compact prepare all put. Added forth chief trees but rooms think may.</p>
                                </div>
                            </div>

                        </article>
                        <article className="timeline-entry left-aligned">

                            <div className="timeline-entry-inner">
                                <time className="timeline-time" dateTime="2014-01-10T03:45"><span>03:45 AM</span> <span>4 weeks ago</span></time>

                                <div className="timeline-icon bg-secondary">
                                </div>

                                <div className="timeline-label">
                                    <h2><a href="#">SmartAdmin goes public!</a></h2>
                                    <p>Yahoo buys a share in <strong>SmartAdmin</strong></p>
                                </div>
                            </div>

                        </article>


                        <article className="timeline-entry">

                            <div className="timeline-entry-inner">
                                <time className="timeline-time" dateTime="2014-01-09T13:22"><span>03:45 AM</span> <span>3 months ago</span></time>

                                <div className="timeline-icon bg-info">
                                </div>

                                <div className="timeline-label">
                                    <h2><a href="#">SmartAdmin Convention</a> <span>checked in at</span> <a href="#">Laborator</a></h2>

                                    <blockquote>Place was booked till 3 am</blockquote>

                                    <img src={mapUrl} alt="map" className="img-responsive" />
                                </div>
                            </div>

                        </article>

                        <article className="timeline-entry left-aligned">

                            <div className="timeline-entry-inner">
                                <time className="timeline-time" dateTime="2014-01-10T03:45"><span>03:45 AM</span> <span>8 months ago</span></time>

                                <div className="timeline-icon bg-warning">
                                </div>

                                <div className="timeline-label">
                                    <h2><a href="#">We have lift off!</a></h2>

                                    <blockquote>SmartAdmin Launched with grace and beauty</blockquote>

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
                            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                            <img src={avatarUrl} className="avatar" />
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            <img src={avatarUrl} className="avatar" />
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                            <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                            <img src={avatarUrl} className="avatar" />
                        </Carousel.Item>
                    </Carousel>
                </section>

                <section id="contact" className="contact">
                    <div className="section-heading">
                        <h1>Get in touch</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>
                    <HomeContactForm i18n={i18n} />
                </section>

                <section className="purchase">
                    <div className="purchase-bg" />
                    <div className="section-heading">
                        <h1>We Always Try to Create a Difference</h1>
                        <p>
                            Thanks for your purchase!
                        </p>
                        <Button bsSize="large" className="purchase-button">
                            PURCHASE
                        </Button>
                    </div>
                </section>
                <footer>
                    <div className="footer-content">
                        <h2>About us</h2>
                        <p>
                            Fusce gravida tortor felis, ac dictum risus sagittis id.
                        </p>
                        <p>
                            Donec volutpat, mi vel egestas eleifend, dolor arcu iaculis nunc. Fusce gravida tortor felis, ac dictum risus sagittis id. Morbi posuere justo eleifend libero ultricies ultrices.
                        </p>
                        <a href="#">LEARN MORE</a>
                    </div>
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
