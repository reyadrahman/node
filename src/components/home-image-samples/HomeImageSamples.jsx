import React from 'react';

let HomeImageSamples = React.createClass({
    render() {
        const { styles, styles: { homeImageSamples: ss }, i18n: { strings } } = this.props;
        return (
            <div>
                <div className={ss.title}>
                    {strings.home.imageSamplesTitle}
                </div>
                <div className={ss.imageSamplesContainer}>
                    { /*
                        images.map(image => {
                            let style = {
                                backgroundImage: `url(./${image})`
                            };
                            return (
                                <div key={image} style={style} />
                            );
                        })
                   */ }
                    <div className={ss.sample1} />
                    <div className={ss.sample2} />
                    <div className={ss.sample3} />
                    <div className={ss.sample4} />
                    <div className={ss.sample5} />
                    <div className={ss.sample6} />
                    <div className={ss.sample7} />
                    <div className={ss.sample8} />
                </div>
            </div>
        );
    },
});

export default HomeImageSamples;
