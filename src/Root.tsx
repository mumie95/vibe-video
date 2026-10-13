import React from 'react';
import {Composition} from 'remotion';
import {ProbabilityFilm} from './ProbabilityFilm';
import {ButterflyEffect} from './ButterflyEffect';
export const Root: React.FC = () => <>
  <Composition id="ProbabilityHasShape" component={ProbabilityFilm} durationInFrames={900} fps={30} width={1920} height={1080}/>
  <Composition id="ButterflyEffect" component={ButterflyEffect} durationInFrames={2700} fps={30} width={1920} height={1080}/>
</>;
