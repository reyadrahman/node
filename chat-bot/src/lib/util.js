import request_ from 'request';


export function callbackToPromise(f, context) {
    return function() {
        return new Promise((resolve, reject) => {
            f.apply(context, Array.prototype.slice.apply(arguments).concat(
                (err, res) => err ? reject(err) : resolve(res)))
        });
    };
}

export const request = callbackToPromise(request_);