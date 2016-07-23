/* @flow */


import { request } from '../lib/util.js';
import URL from 'url';

const { FAKE_SIMILAR_IMAGES } = process.env;

export default async function findSimilarImages(url: string) {
    if (Number(FAKE_SIMILAR_IMAGES) === 1) {
        return {
            fake: true,
            successful: true,
            results: [
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-17177.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-02999.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-10367.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-12985.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-07015.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-24742.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-02553.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-21616.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-00137.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-01399.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-12978.jpg',
                'https://s3.amazonaws.com/deepiks-web/thumbnails/caia/412-19303.jpg'
            ]
        };
    }

    let r;
    try {
        r = await request({
            url: URL.parse(`http://52.205.71.12:9000/s3files?img=${url}`)
        });
    } catch (err) {
        console.error(err);
    }
    if (!r || r.statusCode !== 200) {
        return {
            fake: false,
            results: [],
            successful: false,
        }
    }

    return {
        fake: false,
        successful: true,
        results: JSON.parse(r.body).results,
    };
}
