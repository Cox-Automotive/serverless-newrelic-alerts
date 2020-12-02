mkdir serverless-newrelic-alerts
cp ../../../package.json serverless-newrelic-alerts/
cp ../../../package-lock.json serverless-newrelic-alerts/
cp -R ../../../dist serverless-newrelic-alerts/

npm install

serverless package
