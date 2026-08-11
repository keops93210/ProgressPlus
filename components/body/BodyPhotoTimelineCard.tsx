import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { BodyProgressPhoto } from "@/services/body-photo.service";

type Props = { photos: BodyProgressPhoto[] };

const ANGLES: Record<BodyProgressPhoto["angle"], string> = { front: "Face", side: "Profil", back: "Dos", other: "Autre" };

export function BodyPhotoTimelineCard({ photos }: Props) {
  const ordered = [...photos].sort((a, b) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()).slice(0, 6);
  return (
    <View style={styles.card}>
      <View style={styles.header}><View><Text style={styles.eyebrow}>TRANSFORMATION</Text><Text style={styles.title}>Photos de progression</Text></View><Text style={styles.count}>{photos.length}</Text></View>
      {ordered.length === 0 ? <Text style={styles.empty}>Ajoute ta première photo pour commencer ton avant / après.</Text> : ordered.map((photo) => <View key={photo.id} style={styles.row}><View style={styles.thumb}><Text style={styles.thumbText}>PHOTO</Text></View><View style={styles.info}><Text style={styles.angle}>{ANGLES[photo.angle]}</Text><Text style={styles.date}>{new Date(photo.captured_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</Text>{photo.note ? <Text style={styles.note} numberOfLines={1}>{photo.note}</Text> : null}</View></View>)}
    </View>
  );
}

const styles=StyleSheet.create({card:{backgroundColor:Colors.surface,borderRadius:20,borderWidth:1,borderColor:Colors.border,padding:16},header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},eyebrow:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:1.2},title:{color:Colors.text,fontSize:17,fontWeight:"900",marginTop:3},count:{color:Colors.primary,fontSize:20,fontWeight:"900"},empty:{color:Colors.textSecondary,fontSize:12,lineHeight:18,marginTop:14},row:{flexDirection:"row",alignItems:"center",paddingTop:12,marginTop:12,borderTopWidth:1,borderTopColor:Colors.border},thumb:{width:48,height:62,borderRadius:10,backgroundColor:Colors.background,borderWidth:1,borderColor:Colors.border,alignItems:"center",justifyContent:"center"},thumbText:{color:Colors.textMuted,fontSize:7,fontWeight:"900",letterSpacing:1},info:{flex:1,marginLeft:12},angle:{color:Colors.text,fontSize:13,fontWeight:"800"},date:{color:Colors.textSecondary,fontSize:11,marginTop:3},note:{color:Colors.textMuted,fontSize:10,marginTop:4}});
