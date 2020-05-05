import * as React from 'react';
import Select from 'react-select';
import { withAlert } from 'react-alert';
import Tooltip from 'react-tooltip-lite';
import OutsideClickHandler from 'react-outside-click-handler';

import GraphUtils from '../../../../utilities/graph-util';
import { formatDate, getErrorMessage, LoadingWrapper } from '../common';

class VersionSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      versions: [],
      s3Loading: false,
    };
  }

  openVersion = ({ versionId, lastModified, first }) => {
    const { onOpenCurrentVersion, onOpenPastVersion } = this.props;

    this.setState({ expanded: false });

    if (first) {
      onOpenCurrentVersion();
    } else {
      onOpenPastVersion(versionId, lastModified);
    }
  };

  _loadVersions = () => {
    const { alert, getVersions } = this.props;
    const { env } = this.props;

    this.setState({
      s3Loading: true,
    });
    getVersions(env)
      .then(versions => {
        this.setState({
          versions: versions.map((v, index) => ({
            value: v.VersionId,
            label: `${formatDate(v.LastModified)}${
              index === 0 ? '[last]' : ''
            }`,
            first: index === 0,
          })),
          s3Loading: false,
        });
      })
      .catch(err => {
        this.setState({
          expanded: false,
          s3Loading: false,
          versions: [],
        });
        alert.error(`Couldn't retrieve flows: ${getErrorMessage(err)}`);
      });
  };

  onClickVersionsIcon = () => {
    const { expanded } = this.state;

    if (!expanded) {
      this._loadVersions();
    }

    this.setState({ expanded: !expanded });
  };

  versionsClasses = () => {
    const { enabled } = this.props;
    const classes = ['managerButton svg-inline--fa fa-history fa-w-16'];

    return GraphUtils.classNames(classes.concat(enabled ? ['enabled'] : []));
  };

  render() {
    const { expanded, s3Loading, versions } = this.state;

    return (
      <OutsideClickHandler
        onOutsideClick={() => this.setState({ expanded: false })}
        display="contents"
      >
        <Tooltip
          content={expanded ? 'Hide Versions menu' : 'Show Versions'}
          distance={5}
          padding="6px"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="history"
            className={this.versionsClasses()}
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            onClick={() => this.onClickVersionsIcon()}
          >
            <path d="M504 255.531c.253 136.64-111.18 248.372-247.82 248.468-59.015.042-113.223-20.53-155.822-54.911-11.077-8.94-11.905-25.541-1.839-35.607l11.267-11.267c8.609-8.609 22.353-9.551 31.891-1.984C173.062 425.135 212.781 440 256 440c101.705 0 184-82.311 184-184 0-101.705-82.311-184-184-184-48.814 0-93.149 18.969-126.068 49.932l50.754 50.754c10.08 10.08 2.941 27.314-11.313 27.314H24c-8.837 0-16-7.163-16-16V38.627c0-14.254 17.234-21.393 27.314-11.314l49.372 49.372C129.209 34.136 189.552 8 256 8c136.81 0 247.747 110.78 248 247.531zm-180.912 78.784l9.823-12.63c8.138-10.463 6.253-25.542-4.21-33.679L288 256.349V152c0-13.255-10.745-24-24-24h-16c-13.255 0-24 10.745-24 24v135.651l65.409 50.874c10.463 8.137 25.541 6.253 33.679-4.21z"></path>
          </svg>
        </Tooltip>
        {expanded && (
          <label
            style={{
              display: 'flex',
              border: 'none',
              background:
                'linear-gradient(45deg, rgb(115, 164, 255), rgb(249, 88, 71))',
            }}
          >
            <LoadingWrapper isLoading={s3Loading} width="200px" height="40px">
              <Select
                className="selectContainer"
                value=""
                onChange={item =>
                  this.openVersion({
                    versionId: item.value,
                    lastModified: item.label,
                    first: item.first,
                  })
                }
                options={versions}
                isSearchable={true}
              />
            </LoadingWrapper>
          </label>
        )}
      </OutsideClickHandler>
    );
  }
}

export default withAlert()(VersionSelector);
