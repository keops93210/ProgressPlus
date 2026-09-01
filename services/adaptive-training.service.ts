import { supabase } from "@/lib/supabase";

export type TrainingCycleAction = "PROGRESS" | "CONSOLIDATE" | "REDUCE" | "DELOAD";
export interface TrainingSessionSignal { completionPercent:number; averageRir:number|null; volumeChangePercent:number|null; recoveryScore:number|null; hardSets:number; failureSets:number; performanceTrend:"up"|"stable"|"down"|"unknown"; }
export interface TrainingCycleDecision { action:TrainingCycleAction; volumeMultiplier:number; loadMultiplier:number; targetRir:number; reason:string; signals:string[]; }

function clamp(value:number,min:number,max:number){return Math.min(max,Math.max(min,value));}

export function getTrainingCycleDecision(sessions:TrainingSessionSignal[]):TrainingCycleDecision{
 const recent=sessions.slice(0,4);
 if(!recent.length)return{action:"CONSOLIDATE",volumeMultiplier:1,loadMultiplier:1,targetRir:2.5,reason:"Pas assez de données : Progress+ établit une référence avant d'accélérer.",signals:["historique insuffisant"]};
 const recovery=recent.filter(s=>s.recoveryScore!=null).map(s=>s.recoveryScore as number);
 const averageRecovery=recovery.length?recovery.reduce((a,b)=>a+b,0)/recovery.length:null;
 const averageCompletion=recent.reduce((sum,s)=>sum+clamp(s.completionPercent,0,100),0)/recent.length;
 const rirValues=recent.filter(s=>s.averageRir!=null).map(s=>s.averageRir as number);
 const averageRir=rirValues.length?rirValues.reduce((a,b)=>a+b,0)/rirValues.length:null;
 const hardSets=recent.reduce((sum,s)=>sum+Math.max(0,s.hardSets),0);
 const failureSets=recent.reduce((sum,s)=>sum+Math.max(0,s.failureSets),0);
 const downSessions=recent.filter(s=>s.performanceTrend==="down").length;
 const upSessions=recent.filter(s=>s.performanceTrend==="up").length;
 const signals:string[]=[];
 if(averageRecovery!=null&&averageRecovery<=2)signals.push("récupération basse");
 if(averageRecovery!=null&&averageRecovery>=4.2)signals.push("récupération excellente");
 if(averageCompletion<90)signals.push("volume incomplet");
 if(averageRir!=null&&averageRir<=1)signals.push("intensité très élevée");
 if(hardSets>=8)signals.push("fatigue d'entraînement élevée");
 if(failureSets>=3)signals.push("échec répété");
 if(downSessions>=2)signals.push("performances en baisse");
 if(upSessions>=2)signals.push("performances en hausse");
 const deload=(averageRecovery!=null&&averageRecovery<=2&&(downSessions>=1||hardSets>=4))||(downSessions>=3&&(averageRir==null||averageRir<=2))||failureSets>=5;
 if(deload)return{action:"DELOAD",volumeMultiplier:.6,loadMultiplier:.85,targetRir:3,reason:"Plusieurs signaux de fatigue sont présents. Progress+ réduit temporairement le volume et la charge pour permettre une vraie récupération.",signals};
 if((averageRecovery!=null&&averageRecovery<=2.8)||averageCompletion<85||downSessions>=2)return{action:"REDUCE",volumeMultiplier:.8,loadMultiplier:.975,targetRir:2.5,reason:"La récupération ou la performance est en retrait. On réduit légèrement la demande sans interrompre la progression.",signals};
 if(upSessions>=2&&averageCompletion>=95&&(averageRir==null||averageRir>=1.5)&&(averageRecovery==null||averageRecovery>=3.5))return{action:"PROGRESS",volumeMultiplier:1.05,loadMultiplier:1.025,targetRir:2,reason:"Les dernières séances sont solides : Progress+ peut augmenter légèrement la charge ou le volume.",signals};
 return{action:"CONSOLIDATE",volumeMultiplier:1,loadMultiplier:1,targetRir:averageRecovery!=null&&averageRecovery<3.5?2.5:2,reason:"Les signaux sont suffisamment stables pour conserver le plan et confirmer la progression.",signals};
}

export function applyTrainingCycleDecision(params:{sets:number;weight:number;decision:TrainingCycleDecision}){
 const sets=Math.max(1,Math.round(params.sets*params.decision.volumeMultiplier));
 const weight=Math.max(0,Math.round(params.weight*params.decision.loadMultiplier/1.25)*1.25);
 return{sets,weight};
}

export async function getProgramTrainingDecision(userId:string,programId:string):Promise<TrainingCycleDecision>{
 const {data:sessions,error:sessionError}=await supabase.from("workout_sessions").select("id,total_volume,total_sets,recovery_score,finished_at").eq("user_id",userId).eq("program_id",programId).not("finished_at","is",null).order("finished_at",{ascending:false}).limit(5);
 if(sessionError)throw sessionError;
 if(!sessions?.length)return getTrainingCycleDecision([]);
 const ids=sessions.map(s=>s.id);
 const {data:sets,error:setsError}=await supabase.from("workout_sets").select("session_id,exercise_id,weight,reps,rir").in("session_id",ids).eq("completed",true);
 if(setsError)throw setsError;
 const bySession=new Map<string,any[]>();
 for(const set of sets??[]){const list=bySession.get(set.session_id)??[];list.push(set);bySession.set(set.session_id,list);}
 const signals:TrainingSessionSignal[]=sessions.slice(0,4).map((session,index)=>{
  const rows=bySession.get(session.id)??[]; const rir=rows.map(row=>Number(row.rir)).filter(Number.isFinite); const currentVolume=Number(session.total_volume??0); const previous=sessions[index+1]; const previousVolume=previous?Number(previous.total_volume??0):0;
  const volumeChangePercent=previousVolume>0?Math.round((currentVolume-previousVolume)/previousVolume*100):null;
  const previousRows=previous?bySession.get(previous.id)??[]:[]; const best=rows.length?Math.max(...rows.map(row=>Number(row.weight)*(1+Number(row.reps)/30))):0; const previousBest=previousRows.length?Math.max(...previousRows.map(row=>Number(row.weight)*(1+Number(row.reps)/30))):0;
  const performanceTrend=!previous?"unknown":best>previousBest*1.005?"up":best<previousBest*.995?"down":"stable";
  const planned=Math.max(Number(session.total_sets??0),rows.length); const completionPercent=planned>0?Math.min(100,Math.round(rows.length/planned*100)):100;
  return{completionPercent,averageRir:rir.length?Number((rir.reduce((a,b)=>a+b,0)/rir.length).toFixed(1)):null,volumeChangePercent,recoveryScore:session.recovery_score==null?null:Number(session.recovery_score),hardSets:rir.filter(v=>v<=1).length,failureSets:rir.filter(v=>v<=0).length,performanceTrend};
 });
 return getTrainingCycleDecision(signals);
}
