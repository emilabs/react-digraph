import * as React from 'react';
import Tooltip from 'react-tooltip-lite';

const Message = ({ source, message, extractedData }) => {
  if (extractedData) {
    return (
      <Tooltip
        content={JSON.stringify(extractedData, null, 2)}
        className={`messageContainer ${source}Message chatMessage `}
      >
        <label className={`${source}Message chatMessage`}>{message}</label>
      </Tooltip>
    );
  } else {
    return <label className={`${source}Message chatMessage`}>{message}</label>;
  }
};

export default Message;
