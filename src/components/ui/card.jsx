import React from 'react';

export const Card = ({ children, onClick }) => (
  <div className="card" onClick={onClick}>
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <div className="card-header">
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="card-content">
    {children}
  </div>
);
