import { router } from "expo-router";
import { ArrowLeft, ChevronRight, Dumbbell, Maximize2, Star } from "lucide-react-native";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const anatomyImage = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Pectoralis-major.png";

const muscleParts = [
  { title: "Grand pectoral — faisceau claviculaire", text: "Partie supérieure du grand pectoral. Elle est particulièrement sollicitée lorsque le bras pousse vers l’avant et vers le haut.", color: "#9B5CFF" },
  { title: "Grand pectoral — faisceau sternal", text: "Portion centrale et volumineuse du grand pectoral, très impliquée dans les mouvements de poussée horizontale.", color: "#4D7CFE" },
  { title: "Grand pectoral — faisceau costal", text: "Fibres inférieures du grand pectoral. Elles participent notamment aux mouvements de poussée avec une trajectoire descendante.", color: "#20B8C8" },
  { title: "Petit pectoral", text: "Muscle profond situé sous le grand pectoral. Il participe notamment à la stabilisation et aux mouvements de l’omoplate.", color: "#FF7043" },
];

const exercises = [
  ["Développé couché barre", "Ensemble du grand pectoral"],
  ["Développé incliné haltères", "Accent supérieur"],
  ["Développé décliné", "Accent inférieur"],
  ["Écartés haltères", "Adduction horizontale"],
];

export default function MuscleLibraryScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}><ArrowLeft color="#FFFFFF" size={22} /></Pressable>
          <View style={styles.headerTitle}><Text style={styles.title}>Pectoraux</Text><Text style={styles.subtitle}>Anatomie & fonctions</Text></View>
          <Pressable style={styles.headerButton}><Star color="#9B5CFF" size={21} /></Pressable>
        </View>
        <View style={styles.tabs}><View style={styles.activeTab}><Text style={styles.activeTabText}>Vue antérieure</Text></View><View style={styles.tab}><Text style={styles.tabText}>Vue latérale</Text></View></View>
        <View style={styles.imageCard}>
          <View style={styles.imageTop}><Text style={styles.imageTitle}>Grand pectoral</Text><Pressable style={styles.fullscreen}><Maximize2 color="#FFFFFF" size={16} /><Text style={styles.fullscreenText}>Plein écran</Text></Pressable></View>
          <Image source={{ uri: anatomyImage }} style={styles.anatomyImage} resizeMode="contain" />
          <Text style={styles.imageCaption}>Illustration anatomique — grand pectoral</Text>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoColumn}><Text style={styles.infoTitle}>RÔLE PRINCIPAL</Text><Text style={styles.infoText}>Les pectoraux participent principalement aux mouvements de poussée, à l’adduction horizontale du bras et à la rotation interne de l’épaule.</Text></View>
          <View style={styles.divider} />
          <View style={styles.infoColumn}><Text style={styles.infoTitle}>FONCTIONS</Text><Text style={styles.bullet}>✓ Adduction horizontale</Text><Text style={styles.bullet}>✓ Flexion du bras</Text><Text style={styles.bullet}>✓ Rotation interne</Text><Text style={styles.bullet}>✓ Stabilisation de l’épaule</Text></View>
        </View>
        <Text style={styles.sectionTitle}>Les muscles</Text><Text style={styles.sectionSubtitle}>Comprends précisément ce que tu travailles.</Text>
        <View style={styles.partsCard}>{muscleParts.map((part, index) => <View key={part.title} style={[styles.partRow, index === muscleParts.length - 1 && styles.lastRow]}><View style={[styles.partDot, { backgroundColor: part.color }]} /><View style={styles.partContent}><Text style={styles.partTitle}>{part.title}</Text><Text style={styles.partText}>{part.text}</Text></View><ChevronRight color="#7D8491" size={20} /></View>)}</View>
        <Text style={styles.sectionTitle}>Exercices associés</Text><Text style={styles.sectionSubtitle}>Retrouve directement les exercices qui sollicitent cette zone.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exerciseList}>{exercises.map(([name, accent]) => <Pressable key={name} style={styles.exerciseCard}><View style={styles.exerciseImage}><Dumbbell color="#9B5CFF" size={28} /></View><Text style={styles.exerciseName}>{name}</Text><Text style={styles.exerciseAccent}>{accent}</Text></Pressable>)}</ScrollView>
        <View style={styles.tipCard}><Text style={styles.tipTitle}>CONSEIL PRO</Text><Text style={styles.tipText}>Pour un développement complet, varie les angles de poussée et contrôle la phase descendante plutôt que de chercher uniquement à augmenter la charge.</Text></View>
        <Text style={styles.license}>Illustration anatomique : Gray's Anatomy, domaine public, via Wikimedia Commons.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({container:{flex:1,backgroundColor:"#070A10"},content:{paddingHorizontal:16,paddingTop:52,paddingBottom:40},header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:18},headerButton:{width:42,height:42,borderRadius:21,backgroundColor:"#11151D",alignItems:"center",justifyContent:"center"},headerTitle:{alignItems:"center"},title:{color:"#FFFFFF",fontSize:27,fontWeight:"900"},subtitle:{color:"#9B5CFF",fontSize:13,fontWeight:"700",marginTop:3},tabs:{height:48,flexDirection:"row",borderBottomWidth:1,borderBottomColor:"#222733",marginBottom:12},activeTab:{flex:1,alignItems:"center",justifyContent:"center",borderBottomWidth:2,borderBottomColor:"#9B5CFF"},tab:{flex:1,alignItems:"center",justifyContent:"center"},activeTabText:{color:"#B98BFF",fontSize:14,fontWeight:"800"},tabText:{color:"#7C8390",fontSize:14,fontWeight:"600"},imageCard:{backgroundColor:"#0E131B",borderRadius:22,borderWidth:1,borderColor:"#202632",overflow:"hidden"},imageTop:{position:"absolute",zIndex:2,left:14,right:14,top:14,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},imageTitle:{color:"#FFFFFF",fontSize:17,fontWeight:"800"},fullscreen:{flexDirection:"row",gap:6,alignItems:"center",backgroundColor:"#111722",borderRadius:10,paddingHorizontal:10,paddingVertical:8},fullscreenText:{color:"#FFFFFF",fontSize:11,fontWeight:"700"},anatomyImage:{width:"100%",height:285,marginTop:22,backgroundColor:"#0B0F16"},imageCaption:{color:"#737B89",fontSize:10,padding:10,textAlign:"center"},infoCard:{marginTop:14,backgroundColor:"#10151E",borderRadius:20,borderWidth:1,borderColor:"#202632",padding:16,flexDirection:"row",gap:16},infoColumn:{flex:1},divider:{width:1,backgroundColor:"#252B36"},infoTitle:{color:"#A875FF",fontSize:11,fontWeight:"900",letterSpacing:1},infoText:{color:"#D5D9E0",fontSize:13,lineHeight:19,marginTop:8},bullet:{color:"#D5D9E0",fontSize:12,lineHeight:22},sectionTitle:{color:"#FFFFFF",fontSize:21,fontWeight:"900",marginTop:24},sectionSubtitle:{color:"#7F8795",fontSize:13,marginTop:4},partsCard:{marginTop:12,backgroundColor:"#10151E",borderRadius:20,borderWidth:1,borderColor:"#202632",overflow:"hidden"},partRow:{minHeight:92,padding:14,flexDirection:"row",alignItems:"center",borderBottomWidth:1,borderBottomColor:"#202632"},lastRow:{borderBottomWidth:0},partDot:{width:10,height:10,borderRadius:5,marginRight:12},partContent:{flex:1},partTitle:{color:"#FFFFFF",fontSize:14,fontWeight:"800"},partText:{color:"#89919E",fontSize:12,lineHeight:17,marginTop:5},exerciseList:{gap:10,paddingTop:12},exerciseCard:{width:158,backgroundColor:"#10151E",borderRadius:18,borderWidth:1,borderColor:"#202632",overflow:"hidden",paddingBottom:13},exerciseImage:{height:100,backgroundColor:"#151B25",alignItems:"center",justifyContent:"center"},exerciseName:{color:"#FFFFFF",fontSize:13,fontWeight:"800",paddingHorizontal:11,paddingTop:10},exerciseAccent:{color:"#8B93A1",fontSize:11,paddingHorizontal:11,paddingTop:4},tipCard:{marginTop:22,borderRadius:18,backgroundColor:"#17132A",borderWidth:1,borderColor:"#49317A",padding:16},tipTitle:{color:"#B889FF",fontSize:12,fontWeight:"900",letterSpacing:1},tipText:{color:"#D8D0E8",fontSize:13,lineHeight:19,marginTop:7},license:{color:"#565E6B",fontSize:9,lineHeight:13,marginTop:18}});