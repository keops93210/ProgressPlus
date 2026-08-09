import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import Colors from "@/constants/colors";

interface Props {
  name: string;
  primaryMuscle?: string | null;
  secondaryMuscles?: string[] | null;
  equipment?: string | null;
  dark?: boolean;
}

const NEUTRAL = "#D8D5E0";
const OUTLINE = "#9D98AA";
const PRIMARY = "#F04438";
const SECONDARY = "#F6A623";
const TERTIARY = "#75B84C";

function text(value?: string | null) {
  return (value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function ExerciseAnatomyArt({ name, primaryMuscle, secondaryMuscles, dark = false }: Props) {
  const n = text(name);
  const muscle = text(primaryMuscle);
  const secondary = (secondaryMuscles ?? []).map(text).join(" ");

  const isBench = /developpe couche|bench press|chest press|pec deck|ecarte|fly/.test(n);
  const isSquat = /squat|presse.*cuiss|leg press|fente|lunge/.test(n);
  const isHinge = /souleve|deadlift|hip thrust|romanian|rdl/.test(n);
  const isPull = /tirage|pulldown|rowing|row|traction|pull up|chin up/.test(n);
  const isShoulder = /elevation laterale|lateral raise|developpe militaire|shoulder press|arnold/.test(n);
  const isCurl = /curl/.test(n);
  const isTriceps = /triceps|pushdown|extension.*bras/.test(n);

  const highlight = (area: string) => {
    const a = text(area);
    if (a.includes("pec") || a.includes("chest") || muscle.includes("pec") || muscle.includes("chest")) return PRIMARY;
    if (a.includes("shoulder") || a.includes("delto") || muscle.includes("epaule") || muscle.includes("shoulder")) return PRIMARY;
    if (a.includes("biceps") || muscle.includes("biceps")) return PRIMARY;
    if (a.includes("triceps") || muscle.includes("triceps")) return PRIMARY;
    if (a.includes("quad") || a.includes("leg") || muscle.includes("quadr") || muscle.includes("cuisse")) return PRIMARY;
    if (a.includes("glute") || a.includes("fess") || muscle.includes("fess")) return PRIMARY;
    if (a.includes("hamstring") || a.includes("ischio") || muscle.includes("ischio")) return PRIMARY;
    if (a.includes("calf") || a.includes("mollet") || muscle.includes("mollet")) return PRIMARY;
    if (a.includes("back") || a.includes("lat") || a.includes("dors") || muscle.includes("dos") || muscle.includes("dors")) return PRIMARY;
    if (secondary.includes(a)) return SECONDARY;
    return NEUTRAL;
  };

  const bg = dark ? "#17151D" : "#FAFAFC";
  const benchMode = isBench || isPull;

  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      <Svg width="100%" height="100%" viewBox="0 0 320 240">
        {benchMode ? (
          <G>
            <Rect x="58" y="190" width="205" height="7" rx="3.5" fill="#36323F" />
            <Rect x="98" y="196" width="8" height="29" rx="4" fill="#595363" />
            <Rect x="220" y="196" width="8" height="29" rx="4" fill="#595363" />
            <Rect x="111" y="177" width="91" height="14" rx="7" fill="#4B4655" />
            <Circle cx="122" cy="108" r="17" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="2" />
            <Path d="M138 112 C155 101 183 100 204 113 L214 146 C199 158 163 158 143 145 Z" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="2" />
            <Ellipse cx="163" cy="124" rx="18" ry="12" fill={highlight("pectoraux")} opacity="0.95" />
            <Ellipse cx="190" cy="124" rx="18" ry="12" fill={highlight("pectoraux")} opacity="0.95" />
            <Circle cx="141" cy="112" r="8" fill={highlight("deltoide")} />
            <Circle cx="203" cy="113" r="8" fill={highlight("deltoide")} />
            <Path d="M146 145 L118 174 L98 181" fill="none" stroke={NEUTRAL} strokeWidth="17" strokeLinecap="round" />
            <Path d="M203 145 L230 174 L250 181" fill="none" stroke={NEUTRAL} strokeWidth="17" strokeLinecap="round" />
            <Circle cx="119" cy="174" r="7" fill={highlight("triceps")} />
            <Circle cx="230" cy="174" r="7" fill={highlight("triceps")} />
            <Path d="M151 151 L143 183 L129 211" fill="none" stroke={NEUTRAL} strokeWidth="19" strokeLinecap="round" />
            <Path d="M196 151 L205 183 L221 211" fill="none" stroke={NEUTRAL} strokeWidth="19" strokeLinecap="round" />
            <Line x1="93" y1="181" x2="257" y2="181" stroke="#24212B" strokeWidth="5" />
            <Circle cx="78" cy="181" r="11" fill="#24212B" />
            <Circle cx="272" cy="181" r="11" fill="#24212B" />
            <Rect x="83" y="178" width="20" height="6" rx="3" fill="#7A7486" />
            <Rect x="247" y="178" width="20" height="6" rx="3" fill="#7A7486" />
          </G>
        ) : (
          <G>
            <Circle cx="160" cy="33" r="18" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="2" />
            <Rect x="153" y="49" width="14" height="17" rx="7" fill={NEUTRAL} />
            <Path d="M126 66 C139 57 181 57 194 66 L205 123 C191 139 129 139 115 123 Z" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="2" />
            <Ellipse cx="143" cy="88" rx="17" ry="22" fill={highlight("pectoraux")} />
            <Ellipse cx="177" cy="88" rx="17" ry="22" fill={highlight("pectoraux")} />
            <Ellipse cx="160" cy="112" rx="10" ry="19" fill={highlight("abdos")} opacity="0.75" />
            <Circle cx="123" cy="69" r="10" fill={highlight("deltoide")} />
            <Circle cx="197" cy="69" r="10" fill={highlight("deltoide")} />
            <Path d="M122 72 L96 111 L89 144" fill="none" stroke={NEUTRAL} strokeWidth="19" strokeLinecap="round" />
            <Path d="M198 72 L224 111 L231 144" fill="none" stroke={NEUTRAL} strokeWidth="19" strokeLinecap="round" />
            <Circle cx="96" cy="111" r="8" fill={highlight("biceps")} />
            <Circle cx="224" cy="111" r="8" fill={highlight("biceps")} />
            <Path d="M140 128 L132 176 L124 220" fill="none" stroke={NEUTRAL} strokeWidth="25" strokeLinecap="round" />
            <Path d="M180 128 L188 176 L196 220" fill="none" stroke={NEUTRAL} strokeWidth="25" strokeLinecap="round" />
            <Ellipse cx="136" cy="163" rx="11" ry="22" fill={highlight("quadriceps")} />
            <Ellipse cx="184" cy="163" rx="11" ry="22" fill={highlight("quadriceps")} />
            <Ellipse cx="127" cy="207" rx="9" ry="17" fill={highlight("mollets")} />
            <Ellipse cx="193" cy="207" rx="9" ry="17" fill={highlight("mollets")} />

            {isShoulder && <G><Line x1="87" y1="75" x2="48" y2="42" stroke="#2F2B36" strokeWidth="6" /><Line x1="233" y1="75" x2="272" y2="42" stroke="#2F2B36" strokeWidth="6" /><Circle cx="45" cy="40" r="12" fill="#2F2B36" /><Circle cx="275" cy="40" r="12" fill="#2F2B36" /></G>}
            {isCurl && <G><Line x1="91" y1="142" x2="74" y2="111" stroke="#2F2B36" strokeWidth="6" /><Line x1="229" y1="142" x2="246" y2="111" stroke="#2F2B36" strokeWidth="6" /><Circle cx="72" cy="108" r="10" fill="#2F2B36" /><Circle cx="248" cy="108" r="10" fill="#2F2B36" /></G>}
            {isTriceps && <G><Line x1="94" y1="111" x2="71" y2="153" stroke="#2F2B36" strokeWidth="6" /><Line x1="226" y1="111" x2="249" y2="153" stroke="#2F2B36" strokeWidth="6" /></G>}
            {isSquat && <G><Line x1="89" y1="54" x2="231" y2="54" stroke="#2F2B36" strokeWidth="6" /><Circle cx="82" cy="54" r="11" fill="#2F2B36" /><Circle cx="238" cy="54" r="11" fill="#2F2B36" /></G>}
            {isHinge && <G><Line x1="96" y1="145" x2="232" y2="145" stroke="#2F2B36" strokeWidth="6" /><Circle cx="87" cy="145" r="11" fill="#2F2B36" /><Circle cx="241" cy="145" r="11" fill="#2F2B36" /></G>}
          </G>
        )}

        <G opacity="0.95">
          <Rect x="235" y="205" width="70" height="24" rx="12" fill={dark ? "#292532" : "#EEE9F7"} />
          <Circle cx="249" cy="217" r="5" fill={PRIMARY} />
          <Circle cx="265" cy="217" r="5" fill={SECONDARY} />
          <Circle cx="281" cy="217" r="5" fill={TERTIARY} />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
});
