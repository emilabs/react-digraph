import * as React from 'react';
import Select from 'react-select';

import { getSimpleItem, Input, selectTheme } from '../common';

export const QuestionItem = function({
  decorateHandle,
  removable,
  onChange,
  onRemove,
  value,
  onIndexFocus,
}) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);
  const { index, answer, options } = value;
  const showOptions =
    options.length > 0 && (!answer || options.includes(answer));

  return (
    <div className="contextItem">
      <label>
        {index}
        {showOptions && (
          <Select
            className="selectMidContainer"
            theme={selectTheme}
            value={getSimpleItem(answer)}
            onChange={item => {
              value.answer = item.value;
              onChange(value);
            }}
            onFocus={() => onIndexFocus(index)}
            options={options.map(option => getSimpleItem(option))}
            isSearchable={false}
          />
        )}
        <Input
          value={value.answer}
          onChange={text => {
            value.answer = text;
            onChange(value);
          }}
          onFocus={() => onIndexFocus(index)}
        />
      </label>
    </div>
  );
};

export const QuestionItemHOC = onIndexFocus => props =>
  QuestionItem({ ...props, onIndexFocus });
