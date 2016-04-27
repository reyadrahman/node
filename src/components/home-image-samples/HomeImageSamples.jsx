import React from 'react'

import styles from './home-image-samples.scss';

/*
const images = [
    'sample-image-1.jpg',
    'sample-image-2.jpg',
    'sample-image-3.jpg',
    'sample-image-4.jpg',
    'sample-image-5.jpg',
    'sample-image-6.jpg',
    'sample-image-7.jpg',
    'sample-image-8.jpg',
];
*/

let HomeImageSamples = React.createClass({
    render() {
        return (
            <div>
                <div className={styles.title}>
                    PREMIUM IMAGES & FOOTAGE LIBRES DE DROITS
                </div>
                <div className={styles.imageSamplesContainer}>
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
                    <div className={styles.sample1} />
                    <div className={styles.sample2} />
                    <div className={styles.sample3} />
                    <div className={styles.sample4} />
                    <div className={styles.sample5} />
                    <div className={styles.sample6} />
                    <div className={styles.sample7} />
                    <div className={styles.sample8} />
                </div>
            </div>
        );
    }
});

export default HomeImageSamples;
