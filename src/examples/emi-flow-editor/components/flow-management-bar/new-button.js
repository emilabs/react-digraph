import * as React from 'react';
import Tooltip from 'react-tooltip-lite';

import { confirmExecute } from '../common';

class NewButton extends React.Component {
  newFlow = () => {
    const { newFlow, onNewFlow, unsavedChangesConfirmParams } = this.props;

    confirmExecute({
      f: () => {
        newFlow();
        onNewFlow();
      },
      ...unsavedChangesConfirmParams,
    });
  };

  render() {
    return (
      <Tooltip content="New" distance={5} padding="6px">
        <svg
          className="managerButton enabled"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          onClick={this.newFlow}
        >
          <path d="m262.96875 8.785156v119.746094h119.746094zm0 0" />
          <path d="m211 376.5c0-91.257812 74.242188-165.5 165.5-165.5 5.058594 0 10.058594.242188 15 .6875v-53.152344h-143.53125c-8.285156 0-15-6.71875-15-15v-143.535156h-217.96875c-8.285156 0-15 6.714844-15 15v482c0 8.285156 6.714844 15 15 15h266.585938c-42.652344-29.96875-70.585938-79.527344-70.585938-135.5zm0 0" />
          <path d="m416.667969 361.5h-25.167969v-25.167969c0-8.28125-6.714844-15-15-15s-15 6.71875-15 15v25.167969h-25.164062c-8.285157 0-15 6.714844-15 15s6.714843 15 15 15h25.164062v25.167969c0 8.28125 6.714844 15 15 15s15-6.71875 15-15v-25.167969h25.167969c8.285156 0 15-6.714844 15-15s-6.714844-15-15-15zm0 0" />
          <path d="m376.5 241c-74.714844 0-135.5 60.785156-135.5 135.5s60.785156 135.5 135.5 135.5 135.5-60.785156 135.5-135.5-60.785156-135.5-135.5-135.5zm0 241c-58.171875 0-105.5-47.328125-105.5-105.5s47.328125-105.5 105.5-105.5 105.5 47.328125 105.5 105.5-47.328125 105.5-105.5 105.5zm0 0" />
        </svg>
      </Tooltip>
    );
  }
}

export default NewButton;
