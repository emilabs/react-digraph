import * as React from 'react';
import Tooltip from 'react-tooltip-lite';
import { withAlert } from 'react-alert';

import GraphUtils from '../../../../utilities/graph-util';
import { confirmExecute, getErrorMessage, loadingAlert } from '../common';

class DeleteButton extends React.Component {
  safeDelete = () => {
    const { alert, enabled, deleteFlow, onFlowDeleted } = this.props;

    if (!enabled) {
      return;
    }

    confirmExecute({
      f: () => {
        const closeAlert = loadingAlert('Deleting');

        deleteFlow()
          .then(() => onFlowDeleted())
          .catch(err =>
            alert.error(`Flow deletion failed: ${getErrorMessage(err)}`)
          )
          .finally(closeAlert);
      },
      title: 'Delete the flow?',
      message:
        'This flow will be deleted remotely from s3 and will be no longer available',
    });
  };

  deleteClasses = () => {
    const { enabled } = this.props;
    const classes = ['managerButton svg-inline--fa fa-trash fa-w-14'];

    return GraphUtils.classNames(classes.concat(enabled ? ['enabled'] : []));
  };

  render() {
    return (
      <Tooltip content="Delete" distance={5} padding="6px">
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="trash"
          className={this.deleteClasses()}
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          onClick={() => this.safeDelete()}
        >
          <path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path>
        </svg>
      </Tooltip>
    );
  }
}

export default withAlert()(DeleteButton);
