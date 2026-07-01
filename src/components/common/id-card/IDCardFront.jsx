import React from 'react';
import IDCardHeader from './IDCardHeader';
import IDCardBody from './IDCardBody';
import IDCardFooter from './IDCardFooter';

const IDCardFront = ({ variant = 'student', data = {} }) => {
  const title = variant === 'student' ? 'Student ID Card' : 'Staff ID Card';

  return (
    <div className="w-[300px] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden relative">
      <IDCardHeader 
        schoolName={data.schoolName} 
        schoolLogo={data.schoolLogo} 
        title={title} 
      />
      <div className="flex-1">
        <IDCardBody data={data} variant={variant} />
      </div>
      <IDCardFooter />
    </div>
  );
};

export default IDCardFront;
