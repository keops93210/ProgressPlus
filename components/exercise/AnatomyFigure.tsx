import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

import Colors from "@/constants/colors";

type Muscle = "chest" | "back" | "shoulders" | "biceps" | "triceps" | "quads" | "hamstrings" | "glutes" | "calves" | "abs";

interface AnatomyFigureProps {
  primary?: Muscle;
  side?: "front" | "back";
}

const inactive = "#E9E5F2";
const secondary = "#C4B5FD";

function tone(active: boolean, secondaryTone = false) {
  if (active) return Colors.primary;
  return secondaryTone ? secondary : inactive;
}

export default function AnatomyFigure({ primary = "chest", side = "front" }: AnatomyFigureProps) {
  const front = side === "front";
  return (
    <Svg width="220" height="330" viewBox="0 0 220 330" accessibilityLabel="Illustration anatomique des muscles">
      <G>
        <Circle cx="110" cy="30" r="23" fill={inactive} />
        <Rect x="98" y="52" width="24" height="30" rx="11" fill={inactive} />
        <Path d="M98 66 C78 68 58 78 47 94 L61 108 L80 99 L89 131 L89 190 L98 190 L98 135 L110 119 L122 135 L122 190 L131 190 L131 131 L140 99 L159 108 L173 94 C162 78 142 68 122 66 Z" fill={inactive} />
        <Path d="M89 190 L98 190 L105 245 L91 245 Z" fill={inactive} />
        <Path d="M122 190 L131 190 L129 245 L115 245 Z" fill={inactive} />
        <Path d="M91 245 L105 245 L96 318 L78 318 Z" fill={inactive} />
        <Path d="M115 245 L129 245 L142 318 L124 318 Z" fill={inactive} />

        {front && (
          <>
            <Ellipse cx="91" cy="94" rx="25" ry="15" transform="rotate(-14 91 94)" fill={tone(primary === "chest")} />
            <Ellipse cx="129" cy="94" rx="25" ry="15" transform="rotate(14 129 94)" fill={tone(primary === "chest")} />
            <Ellipse cx="79" cy="82" rx="12" ry="16" transform="rotate(-18 79 82)" fill={tone(primary === "shoulders", true)} />
            <Ellipse cx="141" cy="82" rx="12" ry="16" transform="rotate(18 141 82)" fill={tone(primary === "shoulders", true)} />
            <Ellipse cx="72" cy="116" rx="10" ry="27" fill={tone(primary === "biceps")} />
            <Ellipse cx="148" cy="116" rx="10" ry="27" fill={tone(primary === "biceps")} />
            <Path d="M94 111 L106 119 L101 181 L91 181 Z" fill={tone(primary === "abs")} />
            <Path d="M126 111 L114 119 L119 181 L129 181 Z" fill={tone(primary === "abs")} />
            <Path d="M91 192 L105 192 L100 244 L88 244 Z" fill={tone(primary === "quads")} />
            <Path d="M129 192 L115 192 L120 244 L132 244 Z" fill={tone(primary === "quads")} />
            <Path d="M91 247 L103 247 L96 316 L80 316 Z" fill={tone(primary === "calves")} />
            <Path d="M129 247 L117 247 L124 316 L140 316 Z" fill={tone(primary === "calves")} />
          </>
        )}

        {!front && (
          <>
            <Path d="M91 76 Q110 66 129 76 L141 113 L125 135 L110 121 L95 135 L79 113 Z" fill={tone(primary === "back")} />
            <Path d="M79 82 L63 101 L76 112 L91 98 Z" fill={tone(primary === "shoulders", true)} />
            <Path d="M141 82 L157 101 L144 112 L129 98 Z" fill={tone(primary === "shoulders", true)} />
            <Ellipse cx="72" cy="120" rx="10" ry="27" fill={tone(primary === "triceps")} />
            <Ellipse cx="148" cy="120" rx="10" ry="27" fill={tone(primary === "triceps")} />
            <Path d="M92 132 L110 121 L128 132 L124 191 L110 205 L96 191 Z" fill={tone(primary === "back")} />
            <Path d="M91 192 L105 192 L101 245 L88 245 Z" fill={tone(primary === "hamstrings")} />
            <Path d="M129 192 L115 192 L119 245 L132 245 Z" fill={tone(primary === "hamstrings")} />
            <Ellipse cx="94" cy="263" rx="10" ry="35" fill={tone(primary === "calves")} />
            <Ellipse cx="126" cy="263" rx="10" ry="35" fill={tone(primary === "calves")} />
            <Ellipse cx="94" cy="189" rx="16" ry="12" fill={tone(primary === "glutes")} />
            <Ellipse cx="126" cy="189" rx="16" ry="12" fill={tone(primary === "glutes")} />
          </>
        )}
      </G>
    </Svg>
  );
}
