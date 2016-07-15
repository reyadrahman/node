module.exports = function dotenv(content) {
    try {
        if (!content) {
            var fs = require('fs');
            content = fs.readFileSync('.env', { encoding: 'utf8' });
        }

        var parsedObj = parse(content)

        Object.keys(parsedObj).forEach(function (key) {
            process.env[key] = process.env[key] || parsedObj[key]
        })

        return parsedObj
    } catch (e) {
        //console.error(e)
        return {};
    }
}

function parse(content) {
    var obj = {}

    // convert Buffers before splitting into lines and processing
    content.toString().split('\n').forEach(function (line) {
        // matching "KEY' and 'VAL' in 'KEY=VAL'
        var keyValueArr = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/)
        // matched?
        if (keyValueArr != null) {
            var key = keyValueArr[1]

            // default undefined or missing values to empty string
            var value = keyValueArr[2] ? keyValueArr[2] : ''

            // expand newlines in quoted values
            var len = value ? value.length : 0
            if (len > 0 && value.charAt(0) === '\"' && value.charAt(len - 1) === '\"') {
                value = value.replace(/\\n/gm, '\n')
            }

            // remove any surrounding quotes and extra spaces
            value = value.replace(/(^['"]|['"]$)/g, '').trim()

            obj[key] = value
        }
    })

    return obj
}
