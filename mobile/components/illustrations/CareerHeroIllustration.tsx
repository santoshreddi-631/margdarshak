import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';
import { Colors } from '@/constants/theme';

export interface CareerHeroIllustrationProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const CareerHeroIllustration: React.FC<CareerHeroIllustrationProps> = ({
  size = 200,
  style,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
        {/* Soft Pastel Aura Rings */}
        <Circle cx="120" cy="120" r="110" fill="#EDE9FE" opacity={0.6} />
        <Circle cx="120" cy="120" r="85" fill="#E8FDE9" opacity={0.7} />

        {/* Rising Career Sun (Soft Lavender / Mint) */}
        <Circle cx="120" cy="75" r="28" fill="#EDE9FE" />
        <Circle cx="120" cy="75" r="18" fill={Colors.primary} />

        {/* Horizon Grid Lines */}
        <Path
          d="M20 155 Q 70 142 120 148 T 220 145"
          stroke="#D7DAE2"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M25 172 Q 80 158 120 164 T 215 160"
          stroke={Colors.mint}
          strokeWidth="2"
          opacity={0.8}
        />

        {/* Dynamic Career Pathway (Pastel Mint Accent) */}
        <Path
          d="M90 215 L112 148 L128 148 L150 215 Z"
          fill="#DCFCE7"
        />
        <Path
          d="M120 210 L120 150"
          stroke={Colors.mint}
          strokeWidth="3"
          strokeDasharray="4 4"
        />

        {/* Left Floating Card: Technical Trade / Wrench */}
        <G transform="translate(42, 88)">
          <Rect width="38" height="38" rx="12" fill="#FFFFFF" stroke="#ECEEF2" strokeWidth="1.5" />
          <Path
            d="M14 24 L24 14 M12 19 L19 12 M22 27 L27 22"
            stroke={Colors.primary}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>

        {/* Right Floating Card: Agriculture / Sprout */}
        <G transform="translate(160, 94)">
          <Rect width="38" height="38" rx="12" fill="#FFFFFF" stroke="#ECEEF2" strokeWidth="1.5" />
          <Path
            d="M19 28 V18 M19 18 C19 14 26 12 26 12 C26 12 26 17 22 19 M19 18 C19 14 12 12 12 12 C12 12 12 17 16 19"
            stroke={Colors.mint}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </G>

        {/* Top-Right Floating Star: Digital / Education */}
        <G transform="translate(175, 42)">
          <Circle cx="12" cy="12" r="12" fill="#FFFFFF" stroke="#ECEEF2" strokeWidth="1" />
          <Path
            d="M12 7 L13.5 10.5 L17 11 L14.5 13.5 L15 17 L12 15 L9 17 L9.5 13.5 L7 11 L10.5 10.5 Z"
            fill={Colors.primary}
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
