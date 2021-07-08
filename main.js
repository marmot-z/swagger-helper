const request = require('request');
const inquirer = require('inquirer');
const readline = require('readline');
const {Page} = require('./page');
const {CommandLine} = require('./command');
const {Converter} = require('./convert');

const promptList = [{
    type: 'input',
    message: '请输入swagger文档地址:',
    name: 'swaggerPath',
    default: 'http://localhost:8080/v2/api-docs?group=Admin'
}, {
    type: 'input',
    message: '请输入邮箱:',
    name: 'email'
}, {
    type: 'password',
    message: '请输入密码:',
    name: 'password'
}];

console.log('请先登录Api Mocker：');
inquirer.prompt(promptList).then(async (answers) => {
    let swaggerDoc = await getSwaggerDocument(answers.swaggerPath);
    let converter = new Converter(swaggerDoc);
    let page = new Page();
    initPrompt(new CommandLine(page, converter));

    await page.login(answers.email, answers.password);
});

function initPrompt(commandline) {
    let rl = readline.createInterface(process.stdin, process.stdout);

    rl.setPrompt('swagger-helper > ');
    rl.on('line', (line) => commandline.handle(line));
    rl.on('close', () => process.exit(0)); 
}

function getSwaggerDocument(url) {
    return new Promise((resolve, reject) => {
        request(url, (err, response) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(JSON.parse(response.body));
        });
    });
}