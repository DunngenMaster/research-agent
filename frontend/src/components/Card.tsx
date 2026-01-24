import React from 'react';
import './Card.css';

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="card">{children}</div>
);

export default Card;
