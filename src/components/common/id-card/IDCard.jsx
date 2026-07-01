import React from 'react';
import IDCardFront from './IDCardFront';
import IDCardBack from './IDCardBack';

/**
 * Reusable ID Card Component
 * @param {Object} props
 * @param {'student' | 'staff'} [props.variant='student'] - The type of card to render
 * @param {Object} props.data - The normalized data for the card
 */
const IDCard = ({ variant = 'student', data = {} }) => {
  return (
    <div className="inline-block">
      <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center">
        <IDCardFront variant={variant} data={data} />
        <IDCardBack variant={variant} data={data} />
      </div>
    </div>
  );
};

export default IDCard;
