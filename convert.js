const methods = ["get", "post", "put", "delete"];

class ApiMockerConverter {
    convert(path, pathInfo, group) {
        if (typeof pathInfo === 'undefined') {
            return {};
        }

        let obj = {
            "prodUrl": path,
            "devUrl": path,
            "url": path,
            "group": group,
            "desc": "",
            "creator": null,
            "manager": null,
            "follower": [],
        };

        let matchMethod = this.getFirstMatchMethodInfo(pathInfo);
        if (matchMethod === unll) {
            return params;
        }

        let methodInfo = pathInfo[matchMethod];
        let name = `【${methodInfo.tags.join(' & ')}】 + ${methodInfo.summary}`;
        let params = packageParams(methodInfo.parameters);
        let responses = packageResponses(methodInfo.responses);

        Object.assign(obj, {
            name: name,
            options: {
                "proxy": {
                    "mode": 0
                },
                response: responses,
                "headers": {
                    "example": null,
                    "params": []
                },
                "method": matchMethod,
                "delay": 0,
                "examples": {
                    "query": null,
                    "body": null,
                    "path": null
                },
                params: params
            }
        });

        return obj;
    }

    getFirstMatchMethodInfo(obj) {
        if (typeof obj === 'undefined') {
            return null;
        }

        let matchMethod = methods.find(method => {
            return typeof obj[method] !== 'undefined' ||
                typeof obj[method.toUpperCase()] !== 'undefined';
        });
        
        return typeof matchMethod === 'undefined' ? null : matchMethod;
    }

    packageParams(obj) {
        let fields = obj.map(param => {
            return {
                key: param.name,
                type: getStandardType(param.type),
                required: param.required,
                example: param.x-example,
                comment: param.description
            };
        });

        return {
            query: fields,
            body: fields,
            path: []
        };
    }

    getStandardType(javaType) {
        if ('integer' === javaType) {
            return 'number';
        }

        return javaType;
    }

    packageResponses(obj) {
        
    }
}

module.exports.ApiMockerConverter = ApiMockerConverter;