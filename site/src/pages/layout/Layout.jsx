import React from 'react'

//require('../../../components/layout/less/layout.less');

let Layout = React.createClass({
    render: function(){
        return (
            <div>
                <div>Layout</div>
                {this.props.children}
            </div>
        )
    }
});

export default Layout
