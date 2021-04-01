import {
  getNormalizedFilterItemName,
  getNormalizedNrqlConditionName
} from '../../src/utils/name-normalizer'

describe('Generated Names for resourses', () => {
  it('NQRL Name Normalizer', () => {
    const NQRLFunctionName = 'NQRLFunctionName'
    const nqrlName = getNormalizedNrqlConditionName(NQRLFunctionName, 'Name')
    expect(nqrlName).toBe(`${NQRLFunctionName}NameNrqlCondition`)
  })

  it('Filter Item Name Normalizer', () => {
    const FilterFunctionName = 'FilterFunctionName'
    const filterName = getNormalizedFilterItemName(FilterFunctionName)
    expect(filterName).toBe(`${FilterFunctionName}FilterItem`)
  })
})
