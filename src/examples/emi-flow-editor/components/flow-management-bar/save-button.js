import * as React from 'react';
import Tooltip from 'react-tooltip-lite';
import { withAlert } from 'react-alert';
import debounce from 'debounce';

import GraphUtils from '../../../../utilities/graph-util';
import { getErrorMessage } from '../common';

class SaveButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { saving: false, autosaveEnabled: true };
    this.autosave = debounce(
      () => this.state.autosaveEnabled && this._saveFlow(),
      3000
    );
  }

  componentDidUpdate(prevProps) {
    const { flowName, jsonText } = this.props;

    if (flowName == prevProps.flowName && jsonText !== prevProps.jsonText) {
      this.autosave();
    }
  }

  _saveFlow = () => {
    const { alert, enabled, saveFlow, onFlowSaved } = this.props;

    if (!enabled) {
      return;
    }

    this.setState({ saving: true });

    return saveFlow()
      .then(() => {
        this.setState({ saving: false });
        onFlowSaved();
      })
      .catch(err => {
        alert.error(`Flow save failed: ${getErrorMessage(err)}`);
      })
      .finally(() => this.setState({ saving: false }));
  };

  saveClasses = () => {
    const { enabled } = this.props;
    const { saving } = this.state;

    return GraphUtils.classNames(
      ['managerButton']
        .concat(enabled && !saving ? ['enabled'] : [])
        .concat(saving ? ['executing'] : [])
    );
  };

  render() {
    const { saving } = this.state;

    return (
      <Tooltip content="Save" distance={5} padding="6px">
        <svg
          id="saveFlowBtn"
          className={this.saveClasses()}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 1000 1000"
          style={{
            enableBackground: 'new 0 0 1000 1000',
          }}
          onClick={() => this._saveFlow()}
        >
          <g>
            <path d="M888.6,990c-259,0-518.1,0-777.1,0c-1.8-0.6-3.5-1.5-5.3-1.8c-45-8.1-74.9-33.8-90.2-76.7c-2.6-7.4-4-15.3-5.9-22.9c0-259,0-518.1,0-777.1c0.6-1.8,1.5-3.5,1.8-5.4c9.2-49.4,38.6-80,86.8-93c4.3-1.2,8.6-2.1,12.8-3.1c222.7,0,445.3,0,668,0c27.8,6.1,49.6,22.7,69.5,41.7c32.9,31.5,65.2,63.7,96.8,96.6c19.9,20.6,37.8,43.1,44.3,72.3c0,222.7,0,445.3,0,668c-0.6,1.8-1.5,3.5-1.8,5.3c-9.2,49.4-38.5,80-86.8,93C897.2,988,892.8,989,888.6,990z M500.1,952.5c111.3,0,222.6,0,333.9,0c28.3,0,43.2-14.9,43.2-42.9c0-122.2,0-244.3,0-366.5c0-28.1-15-43.3-42.9-43.3c-223,0-445.9,0-668.8,0c-27.4,0-42.8,15.2-42.8,42.5c0,122.5,0,244.9,0,367.4c0,4.4,0.1,9,1.1,13.3c4.6,19.4,19.1,29.5,42.2,29.5C277.5,952.5,388.8,952.5,500.1,952.5z M480.9,387.3c79.4,0,158.8,0,238.2,0c30.5,0,45.2-14.6,45.2-45c0-83.2,0-166.4,0-249.7c0-30.6-14.4-45-45.1-45c-158.8,0-317.6,0-476.4,0C212.7,47.5,198,62.1,198,92c-0.1,83.5-0.1,167.1,0,250.6c0,29.9,14.9,44.7,44.7,44.7C322.1,387.3,401.5,387.3,480.9,387.3z" />
            {saving && (
              <animate
                attributeName="fill"
                values="gray;violetblue;aqua;gray"
                dur="0.5s"
                repeatCount="indefinite"
              />
            )}
            <path d="M576.4,86.1c37.3,0,73.6,0,110.7,0c0,87.5,0,174.5,0,262.1c-36.8,0-73.4,0-110.7,0C576.4,261.1,576.4,174,576.4,86.1z" />
          </g>
        </svg>
      </Tooltip>
    );
  }
}

export default withAlert()(SaveButton);
