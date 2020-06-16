import * as React from 'react';
import Select from 'react-select';
import { Input, getSimpleItem, selectTheme } from './common';

const MAX_CHARS = 100;
const FROM_INTENT = 'from_intent';
const FROM_ENTITY = 'from_entity';
const FROM_TEXT = 'from_text';
const ACTIONS = [FROM_INTENT, FROM_ENTITY, FROM_TEXT];

const changeAction = (value, newAction, onChange) => {
  value.action = newAction;

  if (newAction !== FROM_ENTITY) {
    value.entity = null;
    value.value = value.value || '';
  }

  if (newAction !== FROM_INTENT) {
    value.value = null;
    value.intent = null;
  }

  onChange(value);
};

const changeIntent = (value, newIntent, onChange) => {
  value.intent = newIntent;
  onChange(value);
};

const changeEntity = (value, newEntity, onChange) => {
  value.entity = newEntity;
  onChange(value);
};

const ActionItem = function({
  decorateHandle,
  removable,
  onChange,
  onRemove,
  value,
  getEntities,
  getIntents,
}) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);

  return (
    <div className="filterItem">
      <div className="d-flex flex-column">
        <label>
          Context Var:
          <Input
            value={value.context_var}
            onChange={text => {
              if (text.length > MAX_CHARS) {
                return;
              }

              value.context_var = text;
              onChange(value);
            }}
          />
        </label>
        <div className="d-flex flex-row">
          <Select
            className="selectMidContainer"
            theme={selectTheme}
            value={getSimpleItem(value.action)}
            onChange={item => changeAction(value, item.value, onChange)}
            options={ACTIONS.map(a => getSimpleItem(a))}
            isSearchable={false}
          />
          {value.action === FROM_ENTITY && (
            <Select
              className="selectContainer"
              theme={selectTheme}
              value={getSimpleItem(value.entity)}
              onChange={item => changeEntity(value, item.value, onChange)}
              options={getEntities().map(i => getSimpleItem(i))}
              isSearchable={false}
            />
          )}
        </div>
        {value.action !== FROM_ENTITY && (
          <label>
            Intent:
            <Select
              className="selectContainer"
              theme={selectTheme}
              value={getSimpleItem(value.intent)}
              onChange={item => changeIntent(value, item.value, onChange)}
              options={getIntents().map(i => getSimpleItem(i))}
              isSearchable={false}
            />
          </label>
        )}
        {value.action == FROM_INTENT && (
          <label>
            Value:
            <Input
              value={value.value}
              onChange={text => {
                value.value = text;
                onChange(value);
              }}
            />
          </label>
        )}
      </div>
      {decorateHandle(
        <span
          style={{
            cursor: 'move',
            margin: '5px',
          }}
        >
          ↕
        </span>
      )}
      <span
        onClick={removable ? onRemove : x => x}
        style={{
          cursor: removable ? 'pointer' : 'not-allowed',
          color: removable ? 'white' : 'gray',
          margin: '5px',
        }}
      >
        X
      </span>
    </div>
  );
};

const isValid = value => {
  if (!value.context_var) {
    return false;
  }

  if (value.action === FROM_INTENT) {
    return value.intent && value.value;
  } else if (value.action === FROM_ENTITY) {
    return value.entity;
  } else {
    return value.action === FROM_TEXT;
  }
};

const StagingActionItem = function({
  value,
  onAdd,
  canAdd,
  add,
  onChange,
  getEntities,
  getIntents,
}) {
  // clone, or bad stuff happens.
  value = Object.assign({}, value);
  canAdd = isValid(value);

  return (
    <div className="stagingFilters stagingItem">
      <label>
        Context var:
        <Input
          value={value.context_var}
          onChange={text => {
            if (text.length > MAX_CHARS) {
              return;
            }

            value.context_var = text;
            onChange(value);
          }}
        />
      </label>
      <label>
        Action:
        <Select
          className="selectMidContainer"
          theme={selectTheme}
          value={getSimpleItem(value.action)}
          onChange={item => changeAction(value, item.value, onChange)}
          options={ACTIONS.map(a => getSimpleItem(a))}
          isSearchable={false}
        />
      </label>
      {value.action !== FROM_ENTITY && (
        <label>
          Intent:
          <Select
            className="selectContainer"
            theme={selectTheme}
            value={getSimpleItem(value.intent)}
            onChange={item => changeIntent(value, item.value, onChange)}
            options={getIntents().map(i => getSimpleItem(i))}
            isSearchable={false}
          />
        </label>
      )}
      {value.action === FROM_ENTITY && (
        <label>
          Entity:
          <Select
            className="selectContainer"
            theme={selectTheme}
            value={getSimpleItem(value.entity)}
            onChange={item => changeEntity(value, item.value, onChange)}
            options={getEntities().map(i => getSimpleItem(i))}
            isSearchable={false}
          />
        </label>
      )}
      {value.action == FROM_INTENT && (
        <label>
          Value:
          <Input
            value={value.value}
            onChange={text => {
              value.value = text;
              onChange(value);
            }}
          />
        </label>
      )}
      <span
        onClick={canAdd ? onAdd : undefined}
        style={{
          cursor: canAdd ? 'pointer' : 'not-allowed',
          margin: '5px',
          backgroundColor: canAdd ? 'ivory' : 'grey',
          color: 'black',
          padding: '2px',
          border: '1px solid grey',
          borderRadius: '5px',
          maxWidth: 'fit-content',
        }}
      >
        Add
      </span>
    </div>
  );
};

const ActionItemHOC = options => props => ActionItem({ ...props, ...options });

const StagingActionItemHOC = options => props =>
  StagingActionItem({ ...props, ...options });

export { ActionItemHOC, StagingActionItemHOC };
