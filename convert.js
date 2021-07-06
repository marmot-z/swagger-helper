const methods = ["get", "post", "put", "delete"];

class Converter {
    constructor(document) {
        this.document = document;
    }

    convert(path, group) {
        return this.convertPath(path, this.document.paths[path], group)
    }

    convertPath(path, pathInfo, group) {
        if (typeof pathInfo === 'undefined') {
            return {};
        }

        let obj = {
            "prodUrl": path,
            "devUrl": path,
            "url": path,
            "group": group,
            "desc": null,
            "creator": null,
            "manager": null,
            "follower": [],
        };

        let matchMethod = this.getFirstMatchMethodInfo(pathInfo);
        if (matchMethod === null) {
            return params;
        }

        let methodInfo = pathInfo[matchMethod];
        let name = `【${methodInfo.tags.join(' & ')}】${methodInfo.summary}`;
        let params = this.packageParams(methodInfo.parameters);
        let paramsExample = this.packageParamsExample(methodInfo.parameters);
        let responses = this.packageResponses(methodInfo.responses);

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
                "responseIndex": 0,
                "examples": paramsExample,
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
                example: param["x-example"] ? param["x-example"] : '',
                comment: param.description
            };
        });

        return {
            query: fields,
            body: fields,
            path: []
        };
    }

    packageParamsExample(obj) {
        let example = {};
        obj.forEach(param => example[param.name] = param["x-example"] ? param["x-example"] : '');

        return {
            query: example,
            body: example,
            path: null
        };
    }

    packageResponses(obj) {
        return Object.keys(obj).map(key => {
            return {
                status: parseInt(key),
                statusText: obj[key].description,
                example: this.packageResponseExample(obj[key].schema),
                params: this.packageResponseParams(obj[key].schema)
            }
        });
    }

    packageResponseParams(obj) {
        if (typeof obj === 'undefined') {
            return [];
        }

        let ds = {};
        fill(obj, ds, this.document);

        return ds.params;
    }

    packageResponseExample(obj) {
        if (typeof obj === 'undefined') {
            return {};
        }

        let params = this.packageResponseParams(obj);
        let example = {};

        for (let param of params) {
            extract(param, example);
        }

        return example;
    }
}

function fill(obj, ds = {}, doc) {
    if (typeof obj === 'undefined') {
        return;
    }

    if (isReferenceObj(obj)) {
        key = getReferenceName(obj);
        obj =  getReferenceObj(obj, doc);
    }

    Object.assign(ds, {
        type: getStandardType(obj.type),
        required: false,
        comment: obj.description ? obj.description : '',
        example: obj.example ? obj.example : ''
    });

    if ('items' in obj) {
        ds.items = {};
        fill(obj.items, ds.items, doc);
        ds.params = ds.items.params;
    }

    if ('properties' in obj) {
        ds.params = [];

        for (let key in obj.properties) {
            let param = {key: key};
            ds.params.push(param);
            fill(obj.properties[key], param, doc);
        }
    }
}

function extract(obj, example) {
    if (typeof obj === 'undefined') {
        return;
    }

    example[obj.key] =  obj.type === 'array' ? [] :
                    obj.type === 'object' ? {} : 
                    obj.example ? obj.example :
                    obj.type === 'number' ? 0 : 
                    obj.type === 'string' ? '' : '';

    if (typeof obj.items !== 'undefined') {
        if ('params' in obj.items) {
            let o = {};
            example[obj.key][0] = o;
    
            for (let param of obj.items.params) {
                extract(param, o);
            }
        } else {
            obj.example ? 
                obj.example.split(',').forEach(v => example[obj.key].push(v)) :
                example[obj.key].push(obj.example);
        }
    }

    if (typeof obj.params !== 'undefined') {
        let o;
        if (obj.type === 'array') {
            o = {};
            example[obj.key][0] = o;
        } else {
            o = example[obj.key];
        }

        for (let param of obj.params) {
            extract(param, o);
        }
    }
}

function getStandardType(javaType) {
    if ('integer' == javaType) {
        return 'number';
    }

    return javaType;
}

function isReferenceObj(obj) {
    return '$ref' in obj && /#\/definitions\/.*/.test(obj['$ref']);
}

function getReferenceName(obj) {
    return /#\/definitions\/(.*)/.exec(obj['$ref'])[1];
}

function getReferenceObj(obj, document) {
    return document.definitions[getReferenceName(obj)];
}

module.exports.Converter = Converter;