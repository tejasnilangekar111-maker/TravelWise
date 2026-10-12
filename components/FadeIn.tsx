import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { motion } from '../constants/theme';

const useNativeDriver = Platform.OS !== 'web';

interface Props {
  children: ReactNode;
  /** Position in a list; each item starts a little after the previous one. */
  index?: number;
  style?: StyleProp<ViewStyle>;
}

/** Gently fades and lifts content into place when it mounts. */
export function FadeIn({ children, index = 0, style }: Props) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: motion.enter,
      delay: index * motion.stagger,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, index]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
