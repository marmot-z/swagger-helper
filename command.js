/**
 * usgae：
 * 
 * listGroup                获取group列表
 * listApi [-g] [-n] [-i]   获取api列表
 *              -g          获取指定group下的api列表，无此参数获取自己创建的api列表
 *              -n          页大小  
 *              -i          页数
 * createApi -f -g          创建api
 *              -f          数据来源（默认使用swagger来源）
 *              -g          group id
 * updateApi -f -a -g       更新api
 *              -f          数据来源（默认使用swagger来源）
 *              -a          api id
 *              -g          group id
 * deleteApi -g -a          删除api
 *              -g          group id
 *              -a          api id
 */
const yargs = require('yargs/yargs');
const { Page } = require('./page');

class CommandLine {
    constructor(page, converter) {
        this.page = page;
        this.converter = converter;
    }

    handle(command) {
        yargs(command)
            .command('listGroup', 'list all group', (yargs) => {}, () => this.page.listGroup())
            .command('listApi', 'list all group', (yargs) => {
                yargs.option('g', {describe: 'group id'})
                    .option('i', {describe: '页码', default: 1, type: 'number'})
                    .option('n', {describe: '页大小', default: 10, type: 'number'})
                    .usage('Usage: listApi [-g] [-i] [-n]') 
                    .example('listApi -g xxx -i 1 -n 10') 
                    .help('h');
            }, (argv) => {
                argv.g ? this.page.listApi(g, argv.n, arg.i) : this.page.listOwnerApi(argv.n, argv.i); 
            })
            .command('createApi', 'create api doc', (yargs) => {
                yargs.option('g', {demand: true, describe: 'group id'})
                    .option('f', {demand: true, describe: '数据来源，使用swagger:/path格式获取对应path接口描述'})
                    .usage('Usage: createApi -g -f') 
                    .example('createApi -g xxx -f swagger:/test/temp') 
                    .help('h');
            }, (argv) => this.page.createApi(argv.g, this.convertFromSwagger(argv.f, argv.g)))
            .command('updateApi', 'update api doc', (yargs) => {
                yargs.option('g', {demand: true, describe: 'group id'})
                    .option('a', {demand: true, describe: 'api id'})
                    .option('f', {demand: true, describe: '数据来源，使用swagger:/path格式获取对应path接口描述'})
                    .usage('Usage: updateApi -g -a -f') 
                    .example('createApi -g xxx -a xxx -f swagger:/test/temp') 
                    .help('h');
            }, (argv) => this.page.updateApi(argv.g, argv.a, this.convertFromSwagger(argv.f, argv.g)))
            .command('deleteApi', 'delete api doc', (yargs) => {
                yargs.option('g', {demand: true, describe: 'group id'})
                    .option('a', {demand: true, describe: 'api id'})
                    .usage('Usage: deleteApi -g -a') 
                    .example('createApi -g xxx -a xxx') 
                    .help('h');
            }, (argv) => this.page.deleteApi(argv.g, argv.a))
            .argv;
    }

    convertFromSwagger(from, group) {
        if (!/swagger:.*/.test(from)) {
            throw new Error('不合法的格式，正确格式应为swagger:/xxx/path');
        }
    
        let path = /swagger:(.*)/.exec(from)[1];

        return this.converter.convert(path, group);
    }
}

module.exports.CommandLine = CommandLine;