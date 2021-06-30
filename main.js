const request = require('request');
const minmist = require("minimist");

function getSwaggerInfo(path) {
    let options = {
        url: 'http://localhost:8080/v2/api-docs'
    };
    
    return new Promise((resolve, reject) => {
        request.get(options, function(err, response,  body) {
            if (err) {
                reject(err);
            }

            let swaggerDocument = JSON.parse(response.body);

            if (typeof path === 'undefined') {
                resolve(swaggerDocument.paths);
            } else {
                let pathObj = swaggerDocument.paths[path];

                if (typeof pathObj === 'undefined') {
                    reject(new Error('没有 ' + path + ' 接口信息'));
                }

                resolve(pathObj);
            }
        });
    });
}

let argv = minmist(process.argv);
getSwaggerInfo(argv.p).then(console.log).catch(console.error);