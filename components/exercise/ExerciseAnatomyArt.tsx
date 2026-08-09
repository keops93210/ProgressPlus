import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Line,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

import Colors from "@/constants/colors";

interface Props {
  name: string;
  primaryMuscle?: string | null;
  secondaryMuscles?: string[] | null;
  equipment?: string | null;
  dark?: boolean;
}

const BODY = "#D9D7E1";
const BODY_LIGHT = "#F1EFF5";
const OUTLINE = "#8D879A";
const JOINT = "#AAA5B5";
const PRIMARY = Colors.primary;
const SECONDARY = "#F39A2F";
const TERTIARY = "#70B84A";
const EQUIPMENT = "#292631";

function normalize(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const aliases: Record<string, RegExp> = {
  chest: /pec|chest|pector/,
  shoulder: /epaule|shoulder|delto/,
  biceps: /biceps/,
  triceps: /triceps/,
  quads: /quad|quadr|cuisse/,
  glutes: /fess|glute/,
  hamstrings: /ischio|hamstring/,
  calves: /mollet|calf/,
  back: /dos|dors|back|lat/,
  abs: /abdo|abs|core/,
  forearms: /avant.?bras|forearm/,
};

function groupOf(value: string) {
  const v = normalize(value);
  return Object.keys(aliases).find((group) => aliases[group].test(v)) ?? null;
}

export default function ExerciseAnatomyArt({
  name,
  primaryMuscle,
  secondaryMuscles,
  equipment,
  dark = false,
}: Props) {
  const n = normalize(name);
  const eq = normalize(equipment);
  const primaryGroup = groupOf(primaryMuscle);
  const secondaryGroups = new Set(
    (secondaryMuscles ?? [])
      .map((item) => groupOf(item))
      .filter(Boolean) as string[],
  );

  const isBench = /developpe couche|bench press|chest press|pec deck|ecarte|fly/.test(n);
  const isPull = /tirage|pulldown|rowing|\brow\b|traction|pull.?up|chin.?up/.test(n);
  const isSquat = /squat|presse.*cuiss|leg press|fente|lunge/.test(n);
  const isHinge = /souleve|deadlift|hip thrust|romanian|\brdl\b/.test(n);
  const isShoulder = /elevation laterale|lateral raise|developpe militaire|shoulder press|arnold/.test(n);
  const isCurl = /curl/.test(n);
  const isTriceps = /triceps|pushdown|extension.*bras/.test(n);
  const usesDumbbells = /haltere|dumbbell/.test(eq + " " + n);
  const usesCable = /poulie|cable/.test(eq + " " + n);
  const usesMachine = /machine/.test(eq + " " + n);
  const usesBar = !usesDumbbells && !usesCable && !usesMachine;

  const colorFor = (group: string) => {
    if (group === primaryGroup) return PRIMARY;
    if (secondaryGroups.has(group)) return SECONDARY;
    return BODY_LIGHT;
  };

  const bg = dark ? "#17151D" : "#F8F7FB";
  const bodyStroke = dark ? "#777181" : OUTLINE;
  const equipmentColor = dark ? "#E8E5EF" : EQUIPMENT;

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <Svg width="100%" height="100%" viewBox="0 0 420 330">
        <Defs>
          <LinearGradient id="bodyShade" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={BODY_LIGHT} />
            <Stop offset="0.55" stopColor={BODY} />
            <Stop offset="1" stopColor="#C5C1CE" />
          </LinearGradient>
          <LinearGradient id="muscleShade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={PRIMARY} />
            <Stop offset="1" stopColor="#7A35E6" />
          </LinearGradient>
        </Defs>

        {/* Soft technical grid */}
        <G opacity={dark ? 0.08 : 0.06}>
          <Line x1="30" y1="48" x2="390" y2="48" stroke={PRIMARY} />
          <Line x1="30" y1="165" x2="390" y2="165" stroke={PRIMARY} />
          <Line x1="30" y1="282" x2="390" y2="282" stroke={PRIMARY} />
          <Line x1="70" y1="20" x2="70" y2="310" stroke={PRIMARY} />
          <Line x1="350" y1="20" x2="350" y2="310" stroke={PRIMARY} />
        </G>

        {isBench ? (
          <G>
            {/* Bench */}
            <Path d="M76 246 H344" stroke={equipmentColor} strokeWidth="9" strokeLinecap="round" />
            <Rect x="128" y="226" width="144" height="20" rx="10" fill="#514C5C" />
            <Path d="M145 246 V289 M258 246 V289" stroke="#6C6675" strokeWidth="8" strokeLinecap="round" />
            <Path d="M130 286 H160 M244 286 H274" stroke={equipmentColor} strokeWidth="7" strokeLinecap="round" />

            {/* Head */}
            <Circle cx="171" cy="105" r="22" fill="url(#bodyShade)" stroke={bodyStroke} strokeWidth="2.5" />
            <Path d="M154 99 Q170 83 187 99" fill="none" stroke="#716B7B" strokeWidth="3" />

            {/* Torso */}
            <Path d="M151 122 C166 112 197 113 214 128 L229 184 C211 202 166 202 146 184 Z" fill="url(#bodyShade)" stroke={bodyStroke} strokeWidth="2.5" />
            <Path d="M153 133 Q169 120 184 133 L181 165 Q168 174 154 164 Z" fill={colorFor("chest")} opacity="0.98" />
            <Path d="M184 133 Q199 120 213 136 L216 164 Q201 174 187 165 Z" fill={colorFor("chest")} opacity="0.98" />
            <Path d="M184 128 V183" stroke="#9B96A4" strokeWidth="2" opacity="0.65" />
            <Path d="M160 177 Q184 188 211 177" fill="none" stroke="#AAA5B2" strokeWidth="2" />

            {/* Shoulders + arms */}
            <Ellipse cx="150" cy="131" rx="18" ry="15" fill={colorFor("shoulder")} stroke={bodyStroke} strokeWidth="2" />
            <Ellipse cx="216" cy="134" rx="18" ry="15" fill={colorFor("shoulder")} stroke={bodyStroke} strokeWidth="2" />
            <Path d="M145 137 L117 161 L96 135" fill="none" stroke="url(#bodyShade)" strokeWidth="18" strokeLinecap="round" />
            <Path d="M221 139 L249 165 L273 138" fill="none" stroke="url(#bodyShade)" strokeWidth="18" strokeLinecap="round" />
            <Circle cx="117" cy="161" r="10" fill={colorFor("triceps")} stroke={bodyStroke} strokeWidth="2" />
            <Circle cx="249" cy="165" r="10" fill={colorFor("triceps")} stroke={bodyStroke} strokeWidth="2" />
            <Circle cx="96" cy="135" r="7" fill={BODY} stroke={bodyStroke} strokeWidth="2" />
            <Circle cx="273" cy="138" r="7" fill={BODY} stroke={bodyStroke} strokeWidth="2" />

            {/* Legs */}
            <Path d="M158 190 L153 229 L141 254" fill="none" stroke="url(#bodyShade)" strokeWidth="25" strokeLinecap="round" />
            <Path d="M208 190 L220 229 L234 254" fill="none" stroke="url(#bodyShade)" strokeWidth="25" strokeLinecap="round" />
            <Ellipse cx="154" cy="215" rx="12" ry="20" fill={colorFor("quads")} opacity="0.95" />
            <Ellipse cx="217" cy="216" rx="12" ry="20" fill={colorFor("quads")} opacity="0.95" />

            {/* Barbell / dumbbells */}
            {usesDumbbells ? (
              <G>
                <Line x1="82" y1="119" x2="109" y2="129" stroke={equipmentColor} strokeWidth="7" />
                <Line x1="258" y1="130" x2="287" y2="119" stroke={equipmentColor} strokeWidth="7" />
                <Circle cx="77" cy="117" r="11" fill={equipmentColor} /><Circle cx="91" cy="122" r="8" fill={equipmentColor} />
                <Circle cx="292" cy="116" r="11" fill={equipmentColor} /><Circle cx="278" cy="122" r="8" fill={equipmentColor} />
              </G>
            ) : (
              <G>
                <Line x1="73" y1="128" x2="296" y2="128" stroke={equipmentColor} strokeWidth="7" />
                <Line x1="88" y1="113" x2="88" y2="143" stroke={equipmentColor} strokeWidth="7" />
                <Line x1="281" y1="113" x2="281" y2="143" stroke={equipmentColor} strokeWidth="7" />
                <Circle cx="70" cy="128" r="14" fill={equipmentColor} /><Circle cx="299" cy="128" r="14" fill={equipmentColor} />
              </G>
            )}
          </G>
        ) : isPull ? (
          <G>
            {/* Cable tower */}
            <Rect x="52" y="40" width="7" height="242" rx="3.5" fill="#66606F" />
            <Rect x="361" y="40" width="7" height="242" rx="3.5" fill="#66606F" />
            <Line x1="55" y1="42" x2="365" y2="42" stroke={equipmentColor} strokeWidth="8" />
            <Line x1="83" y1="82" x2="337" y2="82" stroke="#807A89" strokeWidth="3" />
            <Circle cx="210" cy="80" r="8" fill="#4B4655" />

            {/* Back-facing body */}
            <Circle cx="210" cy="101" r="21" fill="url(#bodyShade)" stroke={bodyStroke} strokeWidth="2.5" />
            <Path d="M182 124 C194 114 226 114 239 126 L249 193 C230 205 190 205 171 193 Z" fill="url(#bodyShade)" stroke={bodyStroke} strokeWidth="2.5" />
            <Path d="M184 134 Q210 117 236 134 L228 185 Q210 198 191 185 Z" fill={colorFor("back")} />
            <Path d="M210 124 V191" stroke="#777181" strokeWidth="2" opacity="0.7" />
            <Path d="M191 143 Q210 154 229 143 M190 160 Q210 170 230 160" fill="none" stroke="#8B8594" strokeWidth="2" opacity="0.7" />
            <Ellipse cx="181" cy="132" rx="16" ry="14" fill={colorFor("shoulder")} />
            <Ellipse cx="239" cy="132" rx="16" ry="14" fill={colorFor("shoulder")} />
            <Path d="M177 138 L144 168 L119 128" fill="none" stroke="url(#bodyShade)" strokeWidth="18" strokeLinecap="round" />
            <Path d="M243 138 L276 168 L301 128" fill="none" stroke="url(#bodyShade)" strokeWidth="18" strokeLinecap="round" />
            <Circle cx="144" cy="168" r="10" fill={colorFor("biceps")} />
            <Circle cx="276" cy="168" r="10" fill={colorFor("biceps")} />
            <Line x1="119" y1="128" x2="301" y2="128" stroke={equipmentColor} strokeWidth="7" />
            <Line x1="210" y1="82" x2="210" y2="128" stroke="#4E4858" strokeWidth="3" />
            <Path d="M202 128 L210 139 L218 128" fill="none" stroke="#4E4858" strokeWidth="3" />
            <Path d="M187 194 L180 240 M233 194 L240 240" stroke="url(#bodyShade)" strokeWidth="25" strokeLinecap="round" />
          </G>
        ) : (
          <G>
            {/* Neutral standing anatomy plate */}
            <Circle cx="210" cy="45" r="22" fill="url(#bodyShade)" stroke={bodyStroke} strokeWidth="2.5" />
            <Path d="M194 38 Q210 24 226 38" fill="none" stroke="#716B7B" strokeWidth="3" />
            <Path d="M178 72 C191 59 229 59 242 72 L250 155 C233 172 187 172 170 155 Z" fill="url(#bodyShade)" stroke={bodyStroke} strokeWidth="2.5" />
            <Path d="M174 83 Q191 68 207 84 L204 122 Q190 133 176 121 Z" fill={colorFor("chest")} />
            <Path d="M211 84 Q227 68 244 84 L247 122 Q231 133 216 122 Z" fill={colorFor("chest")} />
            <Path d="M210 74 V158" stroke="#9B96A4" strokeWidth="2" opacity="0.65" />
            <Ellipse cx="173" cy="78" rx="18" ry="16" fill={colorFor("shoulder")} stroke={bodyStroke} strokeWidth="2" />
            <Ellipse cx="247" cy="78" rx="18" ry="16" fill={colorFor("shoulder")} stroke={bodyStroke} strokeWidth="2" />
            <Path d="M166 89 L136 132 L127 177" fill="none" stroke="url(#bodyShade)" strokeWidth="20" strokeLinecap="round" />
            <Path d="M254 89 L284 132 L293 177" fill="none" stroke="url(#bodyShade)" strokeWidth="20" strokeLinecap="round" />
            <Circle cx="136" cy="132" r="10" fill={colorFor("biceps")} />
            <Circle cx="284" cy="132" r="10" fill={colorFor("biceps")} />
            <Ellipse cx="193" cy="140" rx="13" ry="28" fill={colorFor("abs")} opacity="0.78" />
            <Ellipse cx="227" cy="140" rx="13" ry="28" fill={colorFor("abs")} opacity="0.78" />
            <Path d="M187 163 L177 220 L166 281" fill="none" stroke="url(#bodyShade)" strokeWidth="29" strokeLinecap="round" />
            <Path d="M233 163 L243 220 L254 281" fill="none" stroke="url(#bodyShade)" strokeWidth="29" strokeLinecap="round" />
            <Ellipse cx="181" cy="207" rx="14" ry="25" fill={colorFor("quads")} />
            <Ellipse cx="239" cy="207" rx="14" ry="25" fill={colorFor("quads")} />
            <Ellipse cx="170" cy="267" rx="10" ry="19" fill={colorFor("calves")} />
            <Ellipse cx="250" cy="267" rx="10" ry="19" fill={colorFor("calves")} />

            {isShoulder && (
              <G>
                <Line x1="135" y1="87" x2="90" y2="50" stroke={equipmentColor} strokeWidth="7" />
                <Line x1="285" y1="87" x2="330" y2="50" stroke={equipmentColor} strokeWidth="7" />
                <Circle cx="86" cy="47" r="13" fill={equipmentColor} />
                <Circle cx="334" cy="47" r="13" fill={equipmentColor} />
              </G>
            )}
            {isCurl && (
              <G>
                <Line x1="129" y1="175" x2="108" y2="139" stroke={equipmentColor} strokeWidth="7" />
                <Line x1="291" y1="175" x2="312" y2="139" stroke={equipmentColor} strokeWidth="7" />
                <Circle cx="105" cy="136" r="11" fill={equipmentColor} />
                <Circle cx="315" cy="136" r="11" fill={equipmentColor} />
              </G>
            )}
            {isTriceps && (
              <G>
                <Line x1="136" y1="132" x2="110" y2="205" stroke={equipmentColor} strokeWidth="6" />
                <Line x1="284" y1="132" x2="310" y2="205" stroke={equipmentColor} strokeWidth="6" />
              </G>
            )}
            {isSquat && (
              <G>
                <Line x1="111" y1="67" x2="309" y2="67" stroke={equipmentColor} strokeWidth="7" />
                <Circle cx="103" cy="67" r="13" fill={equipmentColor} />
                <Circle cx="317" cy="67" r="13" fill={equipmentColor} />
              </G>
            )}
            {isHinge && (
              <G>
                <Line x1="108" y1="229" x2="312" y2="229" stroke={equipmentColor} strokeWidth="7" />
                <Circle cx="99" cy="229" r="13" fill={equipmentColor} />
                <Circle cx="321" cy="229" r="13" fill={equipmentColor} />
              </G>
            )}
            {usesCable && (
              <G>
                <Line x1="93" y1="47" x2="327" y2="47" stroke={equipmentColor} strokeWidth="5" />
                <Line x1="210" y1="47" x2="210" y2="92" stroke="#5B5564" strokeWidth="3" />
              </G>
            )}
          </G>
        )}

        {/* Muscle legend */}
        <G opacity={0.98}>
          <Rect x="282" y="288" width="120" height="27" rx="13.5" fill={dark ? "#292532" : "#EEEAF7"} />
          <Circle cx="299" cy="301.5" r="5" fill={PRIMARY} />
          <Circle cx="321" cy="301.5" r="5" fill={SECONDARY} />
          <Circle cx="343" cy="301.5" r="5" fill={TERTIARY} />
          <Line x1="356" y1="301.5" x2="390" y2="301.5" stroke={dark ? "#625B6C" : "#C8C2D3"} strokeWidth="2" />
        </G>

        {/* Exercise mode marker */}
        <G opacity={0.9}>
          <Circle cx="35" cy="30" r="8" fill={PRIMARY} />
          <Circle cx="35" cy="30" r="13" fill="none" stroke={PRIMARY} strokeWidth="1.5" opacity="0.45" />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
