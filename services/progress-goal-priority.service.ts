export type GoalPriority={id:string;progress:number;importance:number;staleDays:number};
export function getAdaptiveGoalPriority(goals:GoalPriority[]){if(!goals.length)return null;return [...goals].sort((a,b)=>{const urgency=(x:GoalPriority)=>Math.max(0,1-x.progress)*0.55+Math.min(1,x.staleDays/30)*0.2+x.importance*0.25;return urgency(b)-urgency(a);})[0];}
