export const funnelGoals = ['onboarding_start', 'plan_received', 'plan_step_done'] as const;
export type FunnelGoal = typeof funnelGoals[number];
type FunnelEvent = {event:FunnelGoal};
type PixelPageView = {id:string;type:'pageView';url:string;referrer:string;start:number};
export type ConsentChoice='accepted'|'denied';
declare global {
 interface Window {
  beregAnalytics?: {readonly allowed:boolean;getChoice:()=>ConsentChoice|null;choose:(choice:ConsentChoice)=>{persisted:boolean;needsReload:boolean}};
 }
}

type AnalyticsWindow = {
 ym?: (...args:unknown[]) => void;
 dataLayer?: {push:(event:FunnelEvent) => unknown};
 _tmr?: {push:(event:PixelPageView) => unknown};
};

// Only event names enter the data layer: never answers, case IDs or documents.
// VK reads dataLayer when collection is enabled in the pixel's cabinet settings.
// Do not also send reachGoal to VK: use one channel for each funnel event.
export function sendFunnelGoal(goal:FunnelGoal) {
 if(typeof window==='undefined'||!window.beregAnalytics?.allowed||!funnelGoals.includes(goal))return;
 const browser=window as unknown as AnalyticsWindow;
 // A blocked counter must not interrupt another counter or saving the case.
 try {if(typeof browser.ym==='function')browser.ym(113661127,'reachGoal',goal)}catch{}
 try {(browser.dataLayer||(browser.dataLayer=[] as FunnelEvent[])).push({event:goal})}catch{}
}

// Consent initialization records the current page; this is only for later SPA transitions.
export function sendPageView(url:string,referrer:string,title:string) {
 if(typeof window==='undefined'||!window.beregAnalytics?.allowed)return;
 const browser=window as unknown as AnalyticsWindow;
 try {if(typeof browser.ym==='function')browser.ym(113661127,'hit',url,{title,referer:referrer})}catch{}
 try {(browser._tmr||(browser._tmr=[] as PixelPageView[])).push({id:'3805761',type:'pageView',url,referrer,start:Date.now()})}catch{}
}
