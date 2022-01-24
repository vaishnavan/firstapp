import React, { useState, useEffect } from 'react'
import { Box, Select as GrommetSelect, Text, TextInput } from 'grommet'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import _cloneDeep from 'lodash/cloneDeep'
import _set from 'lodash/set'
import { useFormikContext } from 'formik'

const TextInputStyled = styled(TextInput)`
  cursor: ${props => (props.defaultCursor ? 'default' : 'pointer')};
`
const getValueLabel = (
  placeholder,
  value,
  options,
  displayValueAsSelection
) => {
  const isMultiSelect = Array.isArray(value)
  let labels

  if (displayValueAsSelection) {
    labels = value
  } else if (isMultiSelect) {
    labels = value.map(currentValue =>
      options.reduce((acc, option) => {
        return currentValue === option.value ? option.label : acc
      }, '')
    )
  } else {
    const [selectedOption] = options.filter(option => option.value === value)
    labels = selectedOption ? selectedOption.label : ''
  }

  const displayText = isMultiSelect ? labels.join(', ').trim() : labels

  return (
    <TextInputStyled
      tabIndex='-1'
      type='text'
      placeholder={placeholder}
      plain
      readOnly
      title={displayText}
      value={displayText}
    />
  )
}

/ eslint-disable-next-line /
const renderOption = valueAsOptionTitle => ({ label, value }, index, options, { selected }) => {
  const title = valueAsOptionTitle ? value : label
  return (
    <Box background={selected ? 'brand' : null} pad='small' title={title}>
      <Text truncate>{label}</Text>
    </Box>
  )
}

const Select = ({
  fieldJson: {
    displayValueAsSelection,
    multiple,
    options,
    placeholder,
    search,
    valueAsOptionTitle
  },
  setFieldValue,
  ...props
}) => {
  const [selectOption, setSelectOption] = useState(options)
  const { touched, setTouched } = useFormikContext()

  useEffect(() => {
    setSelectOption(options)
  }, [options])

  const handleChange = ({ value }) => {
    if (props.onValueChange) {
      props.onValueChange(value)
    }
    setFieldValue(props.name, value)
    setTimeout(() => {
      const touchedFields = _set(_cloneDeep(touched), props.name, true)
      setTouched(touchedFields, false)
    })
  }
  const handleClose = search ? () => setSelectOption(options) : null
  const handleSearch = search
    ? searchText => {
        const regexp = new RegExp(searchText, 'i')
        setSelectOption(
          options.filter(
            o =>
              o.label.match(regexp) ||
              (typeof o.value === 'string' && o.value.match(regexp))
          )
        )
      }
    : null

  const valueLabel = getValueLabel(
    placeholder,
    props.value,
    options,
    displayValueAsSelection
  )

  return (
    <GrommetSelect
      disabledKey='disabled'
      labelKey='label'
      valueKey={{ key: 'value', reduce: true }}
      multiple={multiple}
      {...props}
      options={selectOption}
      placeholder={placeholder}
      valueLabel={valueLabel}
      onChange={handleChange}
      onSearch={handleSearch}
      onClose={handleClose}
    >
      {renderOption(valueAsOptionTitle)}
    </GrommetSelect>
  )
}

Select.propTypes = {
  onChange: PropTypes.func,
  fieldJson: PropTypes.object,
  name: PropTypes.string,
  setFieldValue: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
    PropTypes.array
  ]),
  onValueChange: PropTypes.func
}

export default Select
