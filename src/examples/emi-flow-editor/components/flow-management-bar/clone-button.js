import * as React from 'react';
import Tooltip from 'react-tooltip-lite';
import { withAlert } from 'react-alert';

import GraphUtils from '../../../../utilities/graph-util';
import { confirmExecute, getErrorMessage, loadingAlert } from '../common';

class CloneButton extends React.Component {
  safeClone = () => {
    const {
      alert,
      cloneFlow,
      enabled,
      onFlowCloned,
      unsavedChangesConfirmParams,
    } = this.props;

    if (!enabled) {
      return;
    }

    confirmExecute({
      f: () => {
        const closeAlert = loadingAlert('Cloning');

        cloneFlow()
          .then(onFlowCloned)
          .catch(err =>
            alert.error(`Flow cloning failed: ${getErrorMessage(err)}`)
          )
          .finally(closeAlert);
      },
      ...unsavedChangesConfirmParams,
    });
  };

  cloneClasses = () => {
    const { enabled } = this.props;
    const classes = ['managerButton svg-inline--fa fa-copy fa-w-14'];

    return GraphUtils.classNames(classes.concat(enabled ? ['enabled'] : []));
  };

  render() {
    return (
      <Tooltip content="Clone" distance={5} padding="6px">
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="copy"
          className={this.cloneClasses()}
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          onClick={this.safeClone}
        >
          <path d="M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 0 0 358.059 0H352v96h96v-6.059a24 24 0 0 0-7.029-16.97z"></path>
        </svg>
      </Tooltip>
    );
  }
}

export default withAlert()(CloneButton);
