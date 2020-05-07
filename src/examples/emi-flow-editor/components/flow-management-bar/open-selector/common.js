import * as React from 'react';
import Select from 'react-select';

import { getSimpleItem, LoadingWrapper } from '../../common';
import { ENVS } from '../../../common';

export const EnvSelector = ({ env, onSelect }) => (
  <Select
    className="selectShortContainer"
    value={getSimpleItem(env)}
    onChange={item => onSelect(item.value)}
    options={ENVS.map(env => getSimpleItem(env))}
    isSearchable={false}
  />
);

export const FolderSelector = ({ loading, folders, onSelect }) => (
  <LoadingWrapper isLoading={loading} width="300px" height="40px">
    <Select
      className="selectShortContainer"
      value=""
      onChange={item => onSelect(item.value)}
      options={folders}
      isSearchable={true}
    />
  </LoadingWrapper>
);
