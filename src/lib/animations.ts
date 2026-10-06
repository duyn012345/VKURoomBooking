import {
    Easing,
    type WithSpringConfig,
} from 'react-native-reanimated';

export const SPRING: WithSpringConfig = {
  damping: 16,
  stiffness: 180,
  mass: 0.7,
};

export const FAST_SPRING: WithSpringConfig = {
  damping: 14,
  stiffness: 240,
  mass: 0.5,
};

export const SOFT_SPRING: WithSpringConfig = {
  damping: 20,
  stiffness: 120,
  mass: 0.8,
};

export const easeOut = Easing.out(Easing.cubic);

export const PRESS_SCALE = 0.97;