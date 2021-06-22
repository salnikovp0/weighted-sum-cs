import React from "react";
import { Chart } from 'react-charts';

import ResizableBox from './ResizableBox';
import './App.css';

const rawData = [
  {time: 40, type: 'Move', value: 65},
  {time: 40, type: 'Misses', value: 105},
  {time: 100, type: 'Misses', value: 50},
  {time: 120, type: 'Move', value: 105},
  {time: 140, type: 'Move', value: 90},
  {time: 160, type: 'Headshot', value: true},
  {time: 280, type: 'Move', value: 400},
  {time: 280, type: 'Misses', value: 55},
  {time: 600, type: 'Misses', value: 110},
  {time: 900, type: 'Misses', value: 88},
  {time: 1260, type: 'Body', value: true},
  {time: 10080, type: 'Move', value: 44},
  {time: 10500, type: 'Misses', value: 222},
  {time: 10600, type: 'Misses', value: 99},
  {time: 10700, type: 'Move', value: 300},
  {time: 12600, type: 'Body', value: true},
  {time: 16780, type: 'Misses', value: 50},
  {time: 21000, type: 'Body', value: true},
  {time: 27000, type: 'Misses', value: 8},
  {time: 27060, type: 'Misses', value: 510},
  {time: 27160, type: 'Move', value: 140},
  {time: 27480, type: 'Move', value: 200},
  {time: 27900, type: 'Misses', value: 99},
  {time: 27980, type: 'Body', value: true},
  {time: 28500, type: 'Headshot', value: true},
  {time: 29000, type: 'Bomb', value: true},
]

function calculateGrade({time, type, value}) {
  let score;

  switch (type) {
    case 'Move':
      if (value <= 105) {
        score = 100;
      } else if (value > 105 && value <= 250) {
        score = 70;
      } else {
        score = 0;
      }
      break;
    case 'Bomb':
      if (time <= 40000) {
        score = 100;
      } else {
        score = 0;
      }
      break;
    case 'Misses':
      if (value <= 60) {
        score = 100;
      } else if (value > 60 && value <= 400) {
        score = 70;
      } else {
        score = 0;
      }
      break;
    case 'Headshot':
      if (value) {
        score = 100;
      } else {
        score = 0;
      }
      break;
    case 'Body':
      if (value) {
        score = 80;
      } else {
        score = 0;
      }
      break;
    default:
      break;
  }

  return {
    primary: time,
    secondary: score + ''
  }

}

function getData(type) {
  return rawData
      .filter(row => type === row.type)
      .map(calculateGrade)
}

function App() {
  const speedData = React.useMemo(
    () => [
      {
        label: 'Move',
        data: getData('Move'),
      },
      {
        label: 'Bomb',
        data: getData('Bomb'),
      }
    ]
    ,
    []
  )

  const accuracyData = React.useMemo(
    () => [
      {
        label: 'Misses',
        data: getData('Misses'),
      },
      {
        label: 'Headshot',
        data: getData('Headshot')
      },
      {
        label: 'Body',
        data:  getData('Body')
      }
    ]
    ,
    []
  )

  const weightedSum = (skill) => {
    if (skill === 'speed') {
        const move = getData('Move').map(o => parseInt(o.secondary));
        const bomb = getData('Bomb').map(o => parseInt(o.secondary));

        const moveWeight = move.length / (move.length + bomb.length);
        const bombWeight = 1 - moveWeight;

        const moveAvg = move.reduce((total, curr) => total += curr * moveWeight, 0) / move.length;
        const bombAvg = bomb.reduce((total, curr) => total += curr * bombWeight, 0) / bomb.length;

        return moveAvg + bombAvg;
    } else {
      const misses = getData('Misses').map(o => parseInt(o.secondary));
      const headshot = getData('Headshot').map(o => parseInt(o.secondary));
      const body = getData('Body').map(o => parseInt(o.secondary));

      const missesWeight = misses.length / (misses.length + headshot.length + body.length);
      const headshotWeight = headshot.length / (misses.length + headshot.length + body.length);
      const bodyWeight = 1 - missesWeight - headshotWeight;

      const missesAvg = misses.reduce((total, curr) => total += curr * missesWeight, 0) / misses.length;
      const headshotAvg = headshot.reduce((total, curr) => total += curr * headshotWeight, 0) / headshot.length;
      const bodyAvg = body.reduce((total, curr) => total += curr * bodyWeight, 0) / body.length;

      return missesAvg + headshotAvg + bodyAvg; 
    }
  }

  const series = React.useMemo(
    () => ({
      showPoints: true,
    }),
    []
  );

  const axes = React.useMemo(
    () => [
      { primary: true, type: 'linear', position: 'bottom' },
      { type: 'linear', position: 'left' },
    ],
    []
  )

  return (
    <>
      <h2>Speed</h2>
      <br />
      <br />
      <ResizableBox>
        <Chart data={speedData} series={series} axes={axes} tooltip />
      </ResizableBox>
      accumulation = {weightedSum('speed')}

      <h2>Accuracy</h2>
      <br />
      <br />
      <ResizableBox>
        <Chart data={accuracyData} series={series} axes={axes} tooltip />
      </ResizableBox>
      accumulation = {weightedSum('accuracy')}
    </>
  );
}

export default App;