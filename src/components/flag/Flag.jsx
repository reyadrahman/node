import React, { PropTypes } from 'react';

export const Flag = ({
    className,
    countryCode,
    styles: { flag: ss },
}) => (
    <span className={`${ss.root} ${ss[countryCode]} ${className || ''}`} />
);

export default Flag;
