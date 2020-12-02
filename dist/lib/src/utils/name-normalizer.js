"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNormalizedNrqlConditionName = exports.getNormalizedInfrastructureConditionName = exports.getNormalizedFilterItemName = exports.getNormalizedPolicyName = void 0;
function getNormalizedPolicyName(functionName, policyName) {
    return "" + functionName + policyName.split(' ').join('') + "Policy";
}
exports.getNormalizedPolicyName = getNormalizedPolicyName;
exports.getNormalizedFilterItemName = function (functionName, filterItemName) {
    if (filterItemName === void 0) { filterItemName = ''; }
    return "" + functionName + filterItemName.split(' ').join('') + "FilterItem";
};
exports.getNormalizedInfrastructureConditionName = function (functionName, conditionName) {
    return "" + functionName + conditionName.split(' ').join('') + "InfrastructureCondition";
};
exports.getNormalizedNrqlConditionName = function (functionName, conditionName) {
    return "" + functionName + conditionName.split(' ').join('') + "NrqlCondition";
};
//# sourceMappingURL=name-normalizer.js.map