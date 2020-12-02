'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function getNormalizedPolicyName(functionName, policyName) {
    return "" + functionName + policyName.split(' ').join('') + "Policy";
}
var getNormalizedFilterItemName = function (functionName, filterItemName) {
    if (filterItemName === void 0) { filterItemName = ''; }
    return "" + functionName + filterItemName.split(' ').join('') + "FilterItem";
};
var getNormalizedInfrastructureConditionName = function (functionName, conditionName) {
    return "" + functionName + conditionName.split(' ').join('') + "InfrastructureCondition";
};
var getNormalizedNrqlConditionName = function (functionName, conditionName) {
    return "" + functionName + conditionName.split(' ').join('') + "NrqlCondition";
};

var ServerlessPlugin = /** @class */ (function () {
    function ServerlessPlugin(serverless, options) {
        this.serverless = serverless;
        this.awsProvider = this.serverless.getProvider('aws');
        this.providerNaming = this.awsProvider.naming;
        this.options = options;
        this.hooks = {
            'package:compileEvents': this.compile.bind(this)
        };
    }
    ServerlessPlugin.prototype.getFunctions = function () {
        return this.serverless.service.getAllFunctions();
    };
    // TODO: could we access SSM to get the service token
    ServerlessPlugin.prototype.getPolicyCloudFormation = function (policy, policyServiceToken, normalizedFunctionName) {
        var _a;
        return _a = {},
            _a["" + getNormalizedPolicyName(normalizedFunctionName, policy.name)] = {
                Type: 'Custom::NewRelicPolicy',
                Properties: {
                    ServiceToken: policyServiceToken,
                    policy: __assign({}, policy)
                }
            },
            _a;
    };
    ServerlessPlugin.prototype.getFilterItemCloudFormation = function (filterItem, filterItemServiceToken, normalizedFunctionName) {
        var _a;
        return _a = {},
            _a["" + getNormalizedFilterItemName(normalizedFunctionName)] = {
                Type: 'Custom::NRFilterItem',
                Properties: {
                    ServiceToken: filterItemServiceToken,
                    data: __assign({}, filterItem)
                }
            },
            _a;
    };
    ServerlessPlugin.prototype.getInfrastructureConditionCloudFormation = function (infrastructureCondition, infrastructureConditionServiceToken, normalizedFunctionName) {
        var _a;
        var policy_id = infrastructureCondition.policy_id;
        delete infrastructureCondition.policy_id;
        return _a = {},
            _a["" + getNormalizedInfrastructureConditionName(normalizedFunctionName, infrastructureCondition.data.name)] = {
                Type: 'Custom::NewRelicInfrastructureCondition',
                Properties: __assign({ ServiceToken: infrastructureConditionServiceToken, policy_id: policy_id }, infrastructureCondition)
            },
            _a;
    };
    ServerlessPlugin.prototype.getNrqlConditionCloudFormation = function (nrqlCondition, nrqlConditionServiceToken, normalizedFunctionName) {
        var _a;
        var policy_id = nrqlCondition.policy_id;
        delete nrqlCondition.policy_id;
        return _a = {},
            _a["" + getNormalizedNrqlConditionName(normalizedFunctionName, nrqlCondition.name)] = {
                Type: 'Custom::NewRelicNrqlCondition',
                Properties: {
                    ServiceToken: nrqlConditionServiceToken,
                    policy_id: policy_id,
                    nrql_condition: __assign({}, nrqlCondition)
                }
            },
            _a;
    };
    ServerlessPlugin.prototype.compile = function () {
        var _this = this;
        var functions = this.getFunctions();
        if (!functions) {
            // TODO warn no config
            return;
        }
        functions.forEach(function (functionName) {
            var functionObj = _this.serverless.service.getFunction(functionName);
            var _a = functionObj.alerts, _b = _a === void 0 ? {} : _a, _c = _b.policies, policies = _c === void 0 ? [] : _c, _d = _b.filter_item, filter_item = _d === void 0 ? [] : _d, _e = _b.infrastructure_conditions, infrastructure_conditions = _e === void 0 ? [] : _e, _f = _b.nrql_conditions, nrql_conditions = _f === void 0 ? [] : _f, _g = _b.policy_service_token, policyServiceToken = _g === void 0 ? '' : _g, _h = _b.filter_item_service_token, filterItemServiceToken = _h === void 0 ? '' : _h, _j = _b.nrql_condition_service_token, nrqlConditionServiceToken = _j === void 0 ? '' : _j, _k = _b.infrastructure_condition_service_token, infrastructureConditionServiceToken = _k === void 0 ? '' : _k;
            var policyStatements = policies.reduce(function (statements, policy) {
                if (policy) {
                    var normalizedFunctionName = _this.providerNaming.getLambdaLogicalId(functionName);
                    var cf = _this.getPolicyCloudFormation(policy, policyServiceToken, normalizedFunctionName);
                    return __assign(__assign({}, statements), cf);
                }
            }, {});
            var filterItemStatements = filter_item.reduce(function (statements, filterItem) {
                if (filterItem) {
                    var normalizedFunctionName = _this.providerNaming.getLambdaLogicalId(functionName);
                    var cf = _this.getFilterItemCloudFormation(filterItem, filterItemServiceToken, normalizedFunctionName);
                    return __assign(__assign({}, statements), cf);
                }
            }, {});
            var infrastructureConditionStatements = infrastructure_conditions.reduce(function (statements, condition) {
                if (condition) {
                    var normalizedFunctionName = _this.providerNaming.getLambdaLogicalId(functionName);
                    var cf = _this.getInfrastructureConditionCloudFormation(condition, infrastructureConditionServiceToken, normalizedFunctionName);
                    return __assign(__assign({}, statements), cf);
                }
            }, {});
            var nrqlConditionStatements = nrql_conditions.reduce(function (statements, condition) {
                if (condition) {
                    var normalizedFunctionName = _this.providerNaming.getLambdaLogicalId(functionName);
                    var cf = _this.getNrqlConditionCloudFormation(condition, nrqlConditionServiceToken, normalizedFunctionName);
                    return __assign(__assign({}, statements), cf);
                }
            }, {});
            console.log('FilterItem: ', filterItemStatements);
            Object.assign(_this.serverless.service.provider.compiledCloudFormationTemplate.Resources, __assign(__assign(__assign(__assign({}, policyStatements), filterItemStatements), infrastructureConditionStatements), nrqlConditionStatements));
        });
    };
    return ServerlessPlugin;
}());
module.exports = ServerlessPlugin;
//# sourceMappingURL=serverless-newrelic-alerts.umd.js.map
