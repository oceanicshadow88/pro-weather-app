import React from 'react';
import './NotFoundPage.css';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found">
      <div className="cont_principal cont_error_active">
        <div className="cont_error">
          <h1>Oops</h1>
          <p>The Page you&apos;re looking for isn&apos;t here.</p>
          <Link to="/">
            <button type="button" className="button--default">
              Return
            </button>
          </Link>
        </div>
        <div className="cont_aura_1" />
        <div className="cont_aura_2" />
      </div>
    </div>
  );
};

export default NotFoundPage;
