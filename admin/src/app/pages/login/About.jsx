import React from 'react';

const About = (props) =>
    <div className={props.className || ''}>
        <h1 className="txt-color-red login-header-big">SmartAdmin</h1>

        <div className="hero">

            <div className="pull-left login-desc-box-l">
                <h4 className="paragraph-header">It's Okay to be Smart. Experience the simplicity of SmartAdmin,
                    everywhere you go!</h4>

                <div className="login-app-icons">
                    <a href="#/dashboard" className="btn btn-danger btn-sm">Frontend Template</a>
                    <span> </span>
                    <a href="#/smartadmin/different-versions.html" className="btn btn-danger btn-sm">Find out more</a>
                </div>
            </div>

            <img src="styles/img/demo/iphoneview.png" className="pull-right display-image" alt=""
                 style={{width:'210px'}}/>

        </div>

        <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                <h5 className="about-heading">About SmartAdmin - Are you up to date?</h5>

                <p>
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                    totam rem aperiam, eaque ipsa.
                </p>
            </div>
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                <h5 className="about-heading">Not just your average template!</h5>

                <p>
                    Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est
                    eligendi voluptatem accusantium!
                </p>
            </div>
        </div>

    </div>;

export default About;
