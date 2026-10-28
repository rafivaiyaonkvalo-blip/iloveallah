const fs = require('fs');
let appText = fs.readFileSync('src/App.tsx', 'utf-8');

const saveRecordsEnd = appText.indexOf('  // Supabase Initial Load & Instant Multi-Device Realtime Sync');
const partialSecCode = `
  const savePartialSecurityToServer = (partialSec: any) => {
    const secPayload = {
      isPasswordEnabled,
      savedPassword,
      savedPin: PERMANENT_CALC_PIN,
      isUnlocked,
      tips: tipsList,
      customTips,
      favoriteTips: favoriteTipIds,
      tipsFrequency: tipPopupFrequency,
      zikrHistory,
      khushuHistory,
      ...partialSec,
    };
    saveSupabaseState(history, secPayload).then((ok) => {
      if (ok) {
        setSyncSuccess(true);
        setLastSyncTime(new Date());
      }
    }).catch(() => {});
  };

`;
appText = appText.slice(0, saveRecordsEnd) + partialSecCode + appText.slice(saveRecordsEnd);

appText = appText.replace(/      \/\/ 2\. Fallback to API route[\s\S]*?      if \(res\.ok\) \{\s*setSyncSuccess\(true\);\s*setLastSyncTime\(new Date\(\)\);\s*\}/, '');

appText = appText.replace(/try\s*\{\s*await fetch\('\/api\/security'[\s\S]*?body:\s*JSON\.stringify\((.*?)\),[\s\S]*?\}\)\;\s*\}\s*catch\s*\{\s*\/\/ offline(?: fallback)?\s*\}/g, 'savePartialSecurityToServer($1);');
appText = appText.replace(/try\s*\{\s*await fetch\('\/api\/security'[\s\S]*?body:\s*JSON\.stringify\((.*?)\),[\s\S]*?\}\)\;\s*\}\s*catch\s*\{\}/g, 'savePartialSecurityToServer($1);');
appText = appText.replace(/try\s*\{\s*await fetch\('\/api\/security'[\s\S]*?body:\s*JSON\.stringify\((.*?)\),[\s\S]*?\}\)\;\s*\}\s*catch\s*\{\s*\/\/ offline\s*\}/g, 'savePartialSecurityToServer($1);');


const pollingStart = appText.indexOf('  // Automated Centralized Sync on mount, window focus & background polling every 2s');
const pollingEnd = appText.indexOf('  const currentIntervalId = getActiveIntervalId(now, prayerTimes);');
if (pollingStart !== -1 && pollingEnd !== -1) {
  appText = appText.slice(0, pollingStart) + appText.slice(pollingEnd);
}

fs.writeFileSync('src/App.tsx', appText, 'utf-8');
console.log('Fixed APIs');
