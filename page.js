const request = require('request');

const operationHeaders = {
    'origin': 'https://f2e.dxy.net',
    'refer': 'https://f2e.dxy.net/mock/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'accept': 'application/json, text/plain, */*',
    'accept-Encoding': 'gzip, deflate, br',
    'accept-Language': 'zh-CN,zh;q=0.9'
};

class Page {
    constructor() {
        this.hasLogin = false;
    }

    login(name, password) {
        if (!name || !password) {
            console.error('邮箱或密码不能为空');
            return;
        }

        let options = {
            url: Page.loginUrl,
            method: 'POST',
            body: JSON.stringify({"email": name, "password": password}),
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            }
        };

        return new Promise((resolve, reject) => {
            request.post(options, (err, response, body) => {
                if (err || response.statusCode != 200) {
                    console.error('登录失败，邮箱或密码不正确');
                    reject(err);
                    return;
                }

                this.cookies = response.headers['set-cookie'].filter(cookie => cookie.startsWith('mockerUser'));
                this.favorites = JSON.parse(response.body).favorites;
                
                console.log('登录成功');
                resolve();
            });
        });
    }

    listGroup() {
        if (this.groups) {
            this.printGroupInfo();
            return;
        }

        return this.commonRequest(Page.listGroupUrl)
                .then(response => {
                    let val = JSON.parse(response.body);
                    this.groups = val.resources;
                    this.groupMap = {};
                    this.groups.forEach(group => this.groupMap[group._id] = group);

                    this.printGroupInfo();
                }) 
                .catch(err => {
                    console.error('展示group列表失败', err);
                });
    }

    listApi(groupId, pageSize = 10, pageIndex = 1) {
        if (!groupId) {
            console.error('group id不能为空');
            return;
        }

        let url = Page.listApiUrl.replace('%s', groupId);
        url = url.replace('%s', pageSize);
        url = url.replace('%s', pageIndex);

        this.commonRequest(url)
            .then(response => {
                if (response.statusCode == 200) {
                    let result = JSON.parse(response.body);
                    this.printApiInfo(result.resources, pageIndex, pageSize);
                } else {
                    console.error(`获取${pageIndex}页的api文档失败`);
                }
            })
            .catch(err => console.error(`获取${pageIndex}页的api文档失败`, err));
    }

    listOwnerApi(pageSize = 10, pageIndex = 1) {
        let url = Page.managerApiUrl.replace('%s', pageIndex);
        url.replace('%s', pageSize);

        this.commonRequest(url)
            .then(response => {
                if (response.statusCode == 200) {
                    let result = JSON.parse(response.body);
                    this.printApiInfo(result.results, pageIndex, pageSize, true);
                } else {
                    console.error(`获取${pageIndex}页自己创建的api文档失败`);
                }
            })
            .catch(err => console.error(`获取${pageIndex}页自己创建的api文档失败`, err));
    }

    createApi(groupId, params) {
        if (!groupId) {
            console.error('group id不能为空');
            return;
        }
        if (!params) {
            console.error('接口创建参数不能为空');
            return;
        }

        let url = Page.createApiUrl.replace('%s', groupId);
        
        this.commonRequest(url, 'post', params, operationHeaders)
                .then(response => {
                    if (response.statusCode != 200) {
                        console.error(`新增 ${params.name} API文档失败，响应结果：
                                      \n 编码：${response.statusCode}
                                      \n 内容：${response.body}`);
                    } else {
                        console.info(`新增 ${params.name} API文档成功`)
                    }
                })
                .catch(err => {
                    console.error(`新增 ${params.name} API文档失败`, err);
                });
    }

    updateApi(groupId, apiId, params) {
        if (!groupId) {
            console.error('group id不能为空');
            return;
        }
        if (!apiId) {
            console.error('api id不能为空');
            return;
        }
        if (!params) {
            console.error('接口更新参数不能为空');
            return;
        }

        let url = Page.updateApiUrl.replace('%s', groupId);
        url = url.replace('%s', apiId);
        
        this.commonRequest(url, 'put', params, operationHeaders)
            .then(response => {
                if (response.statusCode != 200) {
                    console.error(`更新 ${params.name} API文档失败，响应结果：
                                \n 编码：${response.statusCode}
                                \n 内容：${response.body}`);
                } else {
                    console.info(`更新 ${params.name} API文档成功`)
                }
            })
            .catch(err => {
                console.error(`更新 ${params.name} API文档失败`, err);
            });
    }

    deleteApi(groupId, apiId) {
        if (!groupId) {
            console.error('group id不能为空');
            return;
        }
        if (!apiId) {
            console.error('api id不能为空');
            return;
        }

        let url = Page.deleteApiUrl.replace('%s', groupId);
        url = url.replace('%s', apiId);

        this.commonRequest(url, 'delete', null, operationHeaders)
            .then(response => {
                if (response.statusCode == 204) {
                    console.log(`删除 ${groupId}/${apiId} API文档成功`);
                } else {
                    console.error(`删除 ${groupId}/${apiId} API文档失败，响应结果：
                                \n 编码：${response.statusCode}`);
                }
            })
            .catch(err => {
                console.error(`删除 ${groupId}/${apiId} API文档失败`, err);
            });
    }

    commonRequest(url, method = 'get', body, headers) {
        let options = {
            url: url,
            method: method,
            headers: {
                'cookie': this.cookies.join(';')
            }
        };

        if (body) {
            options.body = body instanceof String ? body : JSON.stringify(body);
            options.headers['content-type'] = 'application/json;charset=UTF-8';
        }

        if (headers) {
            Object.assign(options.headers, headers);
        }

        return new Promise((resolve, reject) => {
            request[method](options, (err, response) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(response);
            });
        });
    }

    printGroupInfo() {
        console.log(`------ 共有 ${this.favorites.length} 条关注分组 ------`);
        this.favorites.forEach((favorite, i) => {
            let group = this.groupMap[favorite];
            if (group) console.log(`${i + 1}. ${group._id}  ${group.name}`);
        });

        console.log(`\n------ 共有 ${this.groups.length} 条分组 ------`);
        this.groups.splice(0, 20).forEach((group, i) => {
            console.log(`${i + 1}. ${group._id}  ${group.name}`);
        });
        console.log(`More--------------`);
    }

    printApiInfo(apiInfoList, pageIndex, pageSize, owner = false) {
        console.log(`${owner ? '自己创建的': ''}api列表 (第${pageIndex}页/第${(pageIndex - 1) * pageSize}-${pageIndex * pageSize}条)`);
        apiInfoList.forEach((apiInfo, i) => {
            console.log(`${i + 1}. ${apiInfo._id} ${apiInfo.name}`);
        })
    }
}

/** 登录路径 */
Page.loginUrl = 'https://f2e.dxy.net/mock-api/auth/user/login';
/** 分组展示路径 */
Page.listGroupUrl = 'https://f2e.dxy.net/mock-api/server/group/all';
/** api列表展示 */
Page.listApiUrl = 'https://f2e.dxy.net/mock-api/server/api/%s?q=&limit=%s&page=%s';
/** api接口管理展示页面 */
Page.managerApiUrl = 'https://f2e.dxy.net/mock-api/server/api/manage?page=%s&limit=%s6&q=';
/** api创建接口 （%s : groupId） */
Page.createApiUrl = 'https://f2e.dxy.net/mock-api/server/api/%s';
/** api删除接口 （%s：groupId，%s：apiId） */
Page.deleteApiUrl = 'https://f2e.dxy.net/mock-api/server/api/%s/%s';
/** api更新接口 （%s：groupId，%s：apiId） */
Page.updateApiUrl = 'https://f2e.dxy.net/mock-api/server/api/%s/%s';

module.exports.Page = Page;