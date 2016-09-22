import React, { PropTypes } from 'react';

export const Flag = ({
    className,
    countryCode,
}) => (
    <span className={`flag-comp ${countryCode} ${className || ''}`} />
);

export default Flag;
