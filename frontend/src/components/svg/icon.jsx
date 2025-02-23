import React from 'react'

const Icon = (props) => (
	<svg aria-hidden="true" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
  <rect width="200" height="200" rx="20" fill="#4A90E2" />
  <circle cx="100" cy="80" r="40" fill="white" />
  <path 
    d="M50 160c0-30 40-40 50-40s50 10 50 40" 
    stroke="white" 
    strokeWidth="10" 
    strokeLinecap="round"
  />
  <text 
    x="50%" 
    y="180" 
    fontSize="20" 
    fill="white" 
    fontFamily="Arial" 
    textAnchor="middle" 
    fontWeight="bold"
  >
    ChatHive
  </text>
</svg>
);

export default Icon;