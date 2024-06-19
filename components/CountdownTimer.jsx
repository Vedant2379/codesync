'use client'
// components/CountdownTimer.js

import { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach(interval => {
    if (!timeLeft[interval]) {
      return;
    }

    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval]} <span>{interval}{' '}</span>
      </span>
    );
  });

  return (
    <div className='text-2xl mt-10'>
      {timerComponents.length ? (
        <>
          <p className='mb-2'>Time remaining:</p>
          <span>{timerComponents}</span>
        </>
      ) : (
        <>
          <span className='text-gray-900'>Contest over</span>
          {targetDate && <p className='text-gray-900 mt-2'>Ended at : {new Date(targetDate).toLocaleString()}</p>}
        </>
      )}
    </div>
  );
};

export default CountdownTimer;
