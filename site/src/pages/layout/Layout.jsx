import React from 'react'

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
