import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon,
         Grid, Col, Row, Panel, Button, Image, Clearfix,
         Carousel, FormGroup, ControlLabel, FormControl,
         InputGroup, Dropdown } from 'react-bootstrap';
import * as actions from '../../actions/actions.js';

import Scroll from 'react-scroll';
import Lightbox from 'react-images';
const Link = Scroll.Link;


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
            isMenuOpen: false,
            isMenuHovered: false,
            isLightboxOpen: false,
            lightboxCurrentIndex: 0,
        };
        this.menuHoverTimeout = null;
        this.menuToggleTimeout = null;
    },

    onSignUpOrVerifyClick(eventKey) {
        console.log('onSignUpOrVerifyClick eventKey: ', eventKey);
        if (eventKey === 'signup') {
            this.props.openSignup();
        } else if (eventKey === 'verify') {
            this.props.openVerifyRegistration();
        }
    },

    onSignInClick() {
        console.log('sign in');
        this.props.openSignin();
    },

    quotesOnSelect(selectedIndex, e) {
        console.log('quote selected=' + selectedIndex + ', direction=' + e.direction);
        this.setState({
            quotesIndex: selectedIndex,
            quotesDirection: e.direction,
        });
    },

    onMenuToggle() {
        this.setState({ isMenuOpen: !this.state.isMenuOpen });
    },

    onMenuToggleEnter() {
        console.log('onMenuToggleEnter');
        clearTimeout(this.menuToggleTimeout)
        this.setState({ isMenuHovered: true });
    },

    onMenuToggleLeave() {
        console.log('onMenuToggleLeave');
        this.menuToggleTimeout = setTimeout(() => {
            this.setState({
                isMenuHovered: false,
            });
        }, 1500);
    },

    onMenuEnter() {
        console.log('onMenuEnter');
        clearTimeout(this.menuHoverTimeout)
        this.setState({ isMenuOpen: true });
    },

    onMenuLeave() {
        console.log('onMenuLeave');
        this.menuHoverTimeout = setTimeout(() => {
            this.setState({
                isMenuOpen: false,
            });
        }, 1500);
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
        const { className, styles, styles: { home: ss },
                i18n, i18n: { strings } } = this.props;
        // return (
        //     <div className={ss.navbar}>
        //         <button className={ss.menuToggle}>
        //             <Glyphicon glyph="menu-hamburger" />
        //         </button>
        //     </div>
        //
        // )
        const { isMenuOpen, isMenuHovered } = this.state;
        const leftNavBarClass = isMenuOpen
            ? ss.isOpen : isMenuHovered
            ? ss.isHovered : '';
        const createNavItem = (to, icon, text) => (
            <li>
                <Link href="#" to={to} spy={true} smooth={true} duration={500}>
                    <Glyphicon glyph={icon} className={ss.icon} />
                    { text }
                </Link>
            </li>
        );

        const navItems = [
            createNavItem('pricing', 'download', 'Pricing'),
            createNavItem('team', 'user', 'Team'),
            createNavItem('services', 'ok', 'Features'),
            createNavItem('screenshots', 'picture', 'Screenshots'),
            createNavItem('updates', 'cog', 'Updates'),
            createNavItem('contact', 'envelope', 'Contact'),
        ];
        return (
            <div className={`${ss.root} ${className || ''}`}>
                <div className={ss.navbar}>
                    <div className={ss.leftSection}>
                        <div className={ss.menu}>
                            <Glyphicon
                                glyph="menu-hamburger"
                                className={ss.menuToggle}
                                onClick={this.onMenuToggle}
                                onMouseEnter={this.onMenuToggleEnter}
                                onMouseLeave={this.onMenuToggleLeave}
                            />
                            <nav
                                className={`${ss.leftNavbar} ${leftNavBarClass}`}
                                onMouseEnter={this.onMenuEnter}
                                onMouseLeave={this.onMenuLeave}
                            >
                                <div className={ss.scroller}>
                                    <ul>
                                        { navItems }
                                    </ul>
                                </div>
                            </nav>

                        </div>
                        <a href="/" className={ss.logo} />
                    </div>
                    <div className={ss.middleSection}>

                    </div>
                    <div className={ss.rightSection}>
                        <Dropdown
                            className={ss.signInDropdown}
                            onSelect={this.onSignUpOrVerifyClick}
                            pullRight
                        >
                            <Button onClick={this.onSignInClick}>
                                Sign in
                            </Button>
                            <Dropdown.Toggle />
                            <Dropdown.Menu>
                                <MenuItem eventKey="signup">Sign up</MenuItem>
                                <MenuItem eventKey="verify">Verify registration</MenuItem>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                <section className={ss.intro}>
                    <div className={ss.introMessage}>
                        Insert Animation Here
                    </div>
                </section>

                <section id="pricing" className={ss.pricing}>
                    <div className={ss.sectionHeading}>
                        <h1>Our Deals</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>


                    <Grid>

                        <Col xs={12} sm={6} md={3}>
                            <Panel
                                className={ss.pricingPanel}
                                bsStyle="success"
                                header={'Lite version'}
                                footer={
                                    <Button bsStyle="primary" bsSize="large" block>Download <span>now!</span></Button>
                                }
                            >
                                <div className={ss.price}>
                                    <strong>FREE</strong>
                                </div>
                                <ul className={ss.featureList}>
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
                                className={ss.pricingPanel}
                                bsStyle="success"
                                header={'Personal Project'}
                                footer={
                                    <Button bsStyle="primary" bsSize="large" block>Purchase <span>via paypal</span></Button>
                                }
                            >
                                <div className={ss.price}>
                                    $99<span className={ss.subscript}>/mo</span>
                                </div>
                                <ul className={ss.featureList}>
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
                                className={ss.pricingPanel}
                                bsStyle="primary"
                                header={[
                                    <img src={ribbonUrl} className={ss.ribbon} />,
                                    'Developer Bundle'
                                ]}
                                footer={
                                    <Button bsStyle="primary" bsSize="large" block>Purchase <span>via paypal</span></Button>
                                }
                            >
                                <div className={ss.price}>
                                    $350<span className={ss.subscript}>/mo</span>
                                </div>
                                <ul className={ss.featureList}>
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
                                className={ss.pricingPanel}
                                bsStyle="danger"
                                header={'Premium Package'}
                                footer={
                                    <Button bsStyle="primary" bsSize="large" block>Purchase <span>via paypal</span></Button>
                                }
                            >
                                <div className={ss.price}>
                                    $999<span className={ss.subscript}>/mo</span>
                                </div>
                                <ul className={ss.featureList}>
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
                <section id="team" className={ss.team}>
                    <div className={ss.sectionHeading}>
                        <h1>Deepiks Team</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>
                    <Grid>
                        <Col xs={12} sm={6} md={3}>
                            <div className={ss.teamMember}>
                                <div className={ss.name}>
                                    Emmanuel
                                </div>
                                <div className={ss.subtitle}>
                                    CEO
                                </div>
                                <div className={ss.avatar}>
                                    <Image src={avatar1Url} responsive />
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <div className={ss.teamMember}>
                                <div className={ss.name}>
                                    Sean
                                </div>
                                <div className={ss.subtitle}>
                                    Engineer
                                </div>
                                <div className={ss.avatar}>
                                    <Image src={avatar2Url} responsive />
                                </div>
                            </div>
                        </Col>
                        <Clearfix visibleSmBlock />
                        <Col xs={12} sm={6} md={3}>
                            <div className={ss.teamMember}>
                                <div className={ss.name}>
                                    Lucy
                                </div>
                                <div className={ss.subtitle}>
                                    Engineer
                                </div>
                                <div className={ss.avatar}>
                                    <Image src={avatar3Url} responsive />
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <div className={ss.teamMember}>
                                <div className={ss.name}>
                                    Jane
                                </div>
                                <div className={ss.subtitle}>
                                    Marketing
                                </div>
                                <div className={ss.avatar}>
                                    <Image src={avatar4Url} responsive />
                                </div>
                            </div>
                        </Col>
                    </Grid>
                </section>
                <section id="services" className={ss.services}>
                    <div className={ss.sectionHeading}>
                        <h1>The Power of SmartAdmin</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>
                    <Grid>
                        <Col sm={3} md={3} className={ss.service}>
                            <div className={ss.serviceIcon}>
                                <Glyphicon glyph="text-background" />
                            </div>
                            <div className={ss.description}>
                                <h5>Localization</h5>
                                <p>
                                    Vestibulum tincidunt enim in pharetra malesuada. Duis semper magna metus electram accommodare.
                                </p>
                            </div>
                        </Col>
                        <Col sm={3} md={3} className={ss.service}>
                            <div className={ss.serviceIcon}>
                                <Glyphicon glyph="briefcase" />
                            </div>
                            <div className={ss.description}>
                                <h5>Compact</h5>
                                <p>
                                    Vestibulum tincidunt enim in pharetra malesuada. Duis semper magna metus electram accommodare.
                                </p>
                            </div>
                        </Col>
                        <Clearfix visibleSmBlock />
                        <Col sm={3} md={3} className={ss.service}>
                            <div className={ss.serviceIcon}>
                                <Glyphicon glyph="cog" />
                            </div>
                            <div className={ss.description}>
                                <h5>State of the Art</h5>
                                <p>
                                    Vestibulum tincidunt enim in pharetra malesuada. Duis semper magna metus electram accommodare.
                                </p>
                            </div>
                        </Col>
                        <Col sm={3} md={3} className={ss.service}>
                            <div className={ss.serviceIcon}>
                                <Glyphicon glyph="cloud" />
                            </div>
                            <div className={ss.description}>
                                <h5>Cloud System</h5>
                                <p>
                                    Vestibulum tincidunt enim in pharetra malesuada. Duis semper magna metus electram accommodare.
                                </p>
                            </div>
                        </Col>
                    </Grid>
                </section>

                <section id="screenshots" className={ss.screenshots}>
                    <div className={ss.sectionHeading}>
                        <h1>Screenshots</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>

                    <Grid className={ss.screenshotsGrid}>
                        {
                            screenshots.map((x, i) => (
                                <Col md={3}>
                                    <img src={x} onClick={() => this.screenshotClicked(i)} />
                                </Col>
                            ))
                        }
                    </Grid>

                </section>

                <section id="updates" className={ss.updates}>
                    <div className={ss.sectionHeading}>
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

                <section id="quotes" className={ss.quotes}>
                    <div className={ss.quotationMark}>“</div>
                    <Carousel
                        activeIndex={this.state.quotesIndex}
                        direction={this.state.quotesDirection}
                        onSelect={this.quotesOnSelect}
                        className={ss.carousel} controls={false} slide={false}>
                        <Carousel.Item className={ss.carouselItem}>
                            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                            <img src={avatarUrl} className={ss.avatar} />
                        </Carousel.Item>
                        <Carousel.Item className={ss.carouselItem}>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            <img src={avatarUrl} className={ss.avatar} />
                        </Carousel.Item>
                        <Carousel.Item className={ss.carouselItem}>
                            <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                            <img src={avatarUrl} className={ss.avatar} />
                        </Carousel.Item>
                    </Carousel>
                </section>

                <section id="contact" className={ss.contact}>
                    <div className={ss.sectionHeading}>
                        <h1>Get in touch</h1>
                        <p>
                            Lorem ipsum dolor sit amet, no nisl mentitum recusabo per, vim at blandit qualisque dissentiunt. Diam efficiantur conclusionemque ut has
                        </p>
                    </div>
                    <form className={ss.contactForm}>
                        <Grid>
                            <Col md={8} mdOffset={2} className={ss.greyBox}>
                                <Row>
                                    <Col md={6}>
                                        <FormGroup controlId="formControlName">
                                            <ControlLabel>NAME</ControlLabel>
                                            <FormControl type="text" placeholder="Enter name" />
                                        </FormGroup>
                                        <FormGroup controlId="formControlEmail">
                                            <ControlLabel>EMAIL</ControlLabel>
                                            <InputGroup>
                                                <InputGroup.Addon>
                                                    <Glyphicon glyph="envelope" />
                                                </InputGroup.Addon>
                                                <FormControl type="email" placeholder="Enter email" />
                                            </InputGroup>
                                        </FormGroup>
                                        <FormGroup controlId="formControlsSelectMultiple">
                                            <ControlLabel>Subject</ControlLabel>
                                            <FormControl componentClass="select" >
                                                <option value="customer service">General customer service</option>
                                                <option value="suggestions">Suggestions</option>
                                                <option value="other">Other</option>
                                            </FormControl>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup controlId="formControlTextarea">
                                            <ControlLabel>Message</ControlLabel>
                                            <FormControl componentClass="textarea" placeholder="Message" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Col>
                        </Grid>
                    </form>
                </section>

                <section className={ss.purchase}>
                    <div className={ss.purchaseBg} />
                    <div className={ss.sectionHeading}>
                        <h1>We Always Try to Create a Difference</h1>
                        <p>
                            Thanks for your purchase!
                        </p>
                        <Button bsSize="large" className={ss.purchaseButton}>
                            PURCHASE
                        </Button>
                    </div>
                </section>
                <footer>
                    <div className={ss.footerContent}>
                        <h2>About us</h2>
                        <p>
                            Fusce gravida tortor felis, ac dictum risus sagittis id.
                        </p>
                        <p>
                            Donec volutpat, mi vel egestas eleifend, dolor arcu iaculis nunc. Fusce gravida tortor felis, ac dictum risus sagittis id. Morbi posuere justo eleifend libero ultricies ultrices.
                        </p>
                        <a href="#">LEARN MORE</a>
                    </div>
                    <div className={ss.bottomFooter}>
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
    state => ({ }),
    {
        openSignup: actions.openSignup,
        openSignin: actions.openSignin,
        openVerifyRegistration: actions.openVerifyRegistration,
    }
)(Home);


export default Home;
