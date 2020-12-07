rm -rf serverless-newrelic-alerts
mkdir serverless-newrelic-alerts
cp ../../package.json serverless-newrelic-alerts/
cp ../../package-lock.json serverless-newrelic-alerts/
cp -R ../../dist serverless-newrelic-alerts/

npm install

node_modules/serverless/bin/serverless.js package
