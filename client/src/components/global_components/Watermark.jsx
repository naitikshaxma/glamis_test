import React from 'react';
import './Watermark.css';
import Cookies from 'js-cookie';

const Watermark = () => {
    return (
        // repreate this 100 times
        <div className="watermark-container">
            <div className="watermark-text">{Cookies.get("fullName")}</div>
        </div>
        
    );
};

export default Watermark;
