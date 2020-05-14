import * as React from 'react';
import Tooltip from 'react-tooltip-lite';
import { withAlert } from 'react-alert';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

import GraphUtils from '../../../../utilities/graph-util';
import { PROD } from '../../common';
import { getErrorMessage, loadingAlert } from '../common';
import FlowDiff from '../flow-diff';

class ShipButton extends React.Component {
  shipClasses = () => {
    const { enabled } = this.props;
    const classes = ['managerButton svg-inline--fa fa-rocket fa-w-16'];

    return GraphUtils.classNames(classes.concat(enabled ? ['enabled'] : []));
  };

  _shipFlow = () => {
    const { alert, shipFlow } = this.props;

    return shipFlow()
      .then(() => {
        alert.success('Flow successfully shipped!');
      })
      .catch(err => {
        alert.error(`Flow shipping failed: ${getErrorMessage(err)}`);
      });
  };

  confirmAndShip = (lastFlow, newFlow) =>
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="react-confirm-alert-body" style={{ width: '1000px' }}>
          <h1>Ship this flow to prod?</h1>
          <p>If a flow with the same name exists, it will be overriden</p>
          <p>Review your changes first:</p>
          <FlowDiff str1={lastFlow} str2={newFlow} />
          <p>Are you sure?</p>
          <div className="react-confirm-alert-button-group">
            <button
              onClick={() => {
                onClose();
                const closeAlert = loadingAlert('Shipping');

                this._shipFlow().finally(closeAlert);
              }}
            >
              Yes, Ship it!
            </button>
            <button onClick={onClose}>No</button>
          </div>
        </div>
      ),
    });

  safeShip = () => {
    const { alert, flowName, jsonText, getFlow, enabled } = this.props;

    if (!enabled) {
      return;
    }

    const closeAlert = loadingAlert('Preparing for shipping');

    getFlow(PROD, flowName)
      .then(lastFlow =>
        closeAlert().then(() => this.confirmAndShip(lastFlow, jsonText))
      )
      .catch(err =>
        closeAlert().then(() => {
          if (err.statusCode == 404) {
            this.confirmAndShip('', jsonText);
          } else {
            alert.error(`Flow ship failed: ${getErrorMessage(err)}`);
          }
        })
      );
  };

  render() {
    const { enabled } = this.props;

    return (
      <Tooltip content="Ship to prod" distance={5} padding="6px">
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="rocket"
          className={this.shipClasses()}
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          onClick={this.safeShip}
        >
          <path d="M505.12019,19.09375c-1.18945-5.53125-6.65819-11-12.207-12.1875C460.716,0,435.507,0,410.40747,0,307.17523,0,245.26909,55.20312,199.05238,128H94.83772c-16.34763.01562-35.55658,11.875-42.88664,26.48438L2.51562,253.29688A28.4,28.4,0,0,0,0,264a24.00867,24.00867,0,0,0,24.00582,24H127.81618l-22.47457,22.46875c-11.36521,11.36133-12.99607,32.25781,0,45.25L156.24582,406.625c11.15623,11.1875,32.15619,13.15625,45.27726,0l22.47457-22.46875V488a24.00867,24.00867,0,0,0,24.00581,24,28.55934,28.55934,0,0,0,10.707-2.51562l98.72834-49.39063c14.62888-7.29687,26.50776-26.5,26.50776-42.85937V312.79688c72.59753-46.3125,128.03493-108.40626,128.03493-211.09376C512.07526,76.5,512.07526,51.29688,505.12019,19.09375ZM384.04033,168A40,40,0,1,1,424.05,128,40.02322,40.02322,0,0,1,384.04033,168Z">
            {enabled && (
              <animate
                attributeName="fill"
                values="black;cornflowerblue;greenyellow;cornflowerblue;black"
                dur="5s"
                repeatCount="indefinite"
              />
            )}
          </path>
        </svg>
      </Tooltip>
    );
  }
}

export default withAlert()(ShipButton);
