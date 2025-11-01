import React, { useEffect } from 'react';
import './Modal.css';

import Backdrop from '../Backdrop/Backdrop';

const Modal = ({ show, modalClosed, children, class: className }) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  return (
    <>
      <Backdrop show={show} click={modalClosed} />
      <div
        className={`Modal ${className || ''}`}
        style={{
          transform: show ? 'translateY(0)' : 'translateY(-200vh)',
          opacity: show ? '1' : 0,
        }}
      >
        {children}
      </div>
    </>
  );
};

// Use React.memo to optimize re-renders (equivalent to shouldComponentUpdate)
export default React.memo(Modal, (prevProps, nextProps) => {
  return prevProps.show === nextProps.show && prevProps.children === nextProps.children;
});
