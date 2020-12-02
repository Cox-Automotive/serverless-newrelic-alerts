import {execSync} from 'child_process';

describe('Serverless package', () => {
  it('Should generate CloudFormation code', async () => {
    try {
      const stdout = execSync('./sls-package.sh', {cwd: './test/system/app-under-test'});
      console.log(stdout.toString())
    } catch (error) {
      console.log('stdout: ', error.stdout?.toString());
      console.log('stderr: ', error.stderr?.toString());
    }
    const cfTemplate = require('./app-under-test/.serverless/cloudformation-template-update-stack.json');
    const expectedCfTemplate = require('./app-under-test/extected-cloudformation-template-update-stack.json');
    expect(cfTemplate.Resources).toEqual(expect.objectContaining(expectedCfTemplate.Resources));
  })
})
