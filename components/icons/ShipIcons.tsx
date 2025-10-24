
import React from 'react';

interface IconProps {
  className?: string;
}

// Longer and wider, represents an aircraft carrier.
export const CarrierIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M 5,5 L 95,5 L 90,15 L 10,15 Z" />
    <rect x="30" y="2" width="40" height="3" />
  </svg>
);

// Long and sturdy looking.
export const BattleshipIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 80 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M 5,5 L 75,5 L 70,15 L 10,15 Z" />
    <rect x="25" y="1" width="10" height="4" />
    <rect x="45" y="1" width="10" height="4" />
  </svg>
);

// Medium length, sleek.
export const CruiserIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M 5,7 L 55,7 L 50,13 L 10,13 Z" />
    <rect x="25" y="3" width="10" height="4" />
  </svg>
);

// Submarine shape, with a conning tower.
export const SubmarineIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M 10,10 C 10,5 20,5 30,5 C 40,5 50,5 50,10 C 50,15 40,15 30,15 C 20,15 10,15 10,10 Z" />
    <rect x="28" y="2" width="4" height="8" rx="2" />
  </svg>
);

// Small and fast looking.
export const DestroyerIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M 5,8 L 35,8 L 30,12 L 10,12 Z" />
  </svg>
);
