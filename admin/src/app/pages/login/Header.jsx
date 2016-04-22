import React from 'react';

const Header = (props) =>
    <header id="header" className="animated fadeInDown">
        <div id="logo-group">
            <span id="logo"> <img src="styles/img/logo.png" alt="SmartAdmin"/> </span>
        </div>
        {props.children}
    </header>;

export default Header;
