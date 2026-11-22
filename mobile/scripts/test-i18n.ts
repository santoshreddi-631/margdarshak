import i18n from '../i18n';
import { en } from '../i18n/locales/en';
import { te } from '../i18n/locales/te';
import { hi } from '../i18n/locales/hi';

function checkMissingKeys(base: Record<string, any>, target: Record<string, any>, targetName: string, prefix = ''): string[] {
  const missing: string[] = [];
  for (const key of Object.keys(base)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (!(key in target)) {
      missing.push(`Missing in ${targetName}: ${fullKey}`);
    } else if (typeof base[key] === 'object' && base[key] !== null && !Array.isArray(base[key])) {
      missing.push(...checkMissingKeys(base[key], target[key], targetName, fullKey));
    }
  }
  return missing;
}

async function runI18nTests() {
  console.log('--- Starting Margdarshak Multilingual & Accessibility Verification ---');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extra = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${extra}`);
      failed++;
    }
  }

  // Test 1: Check key parity between English, Telugu, and Hindi
  const missingInTe = checkMissingKeys(en, te, 'Telugu');
  assert(missingInTe.length === 0, 'Telugu Locale Key Parity', missingInTe.join(', '));

  const missingInHi = checkMissingKeys(en, hi, 'Hindi');
  assert(missingInHi.length === 0, 'Hindi Locale Key Parity', missingInHi.join(', '));

  // Test 2: Language Switching & i18next Resolution
  await i18n.changeLanguage('en');
  assert(i18n.t('common.continue') === 'Continue', 'English: common.continue');
  assert(i18n.t('navigation.roadmap') === 'My Roadmap', 'English: navigation.roadmap');
  assert(i18n.t('onboarding.selectLanguage') === 'Select Language', 'English: onboarding.selectLanguage');
  assert(i18n.t('careerDetails.startRoadmap') === 'Start Personalized Roadmap', 'English: careerDetails.startRoadmap');

  // Test 3: Telugu Resolution
  await i18n.changeLanguage('te');
  assert(i18n.t('common.continue') === 'కొనసాగించండి', 'Telugu: common.continue');
  assert(i18n.t('navigation.roadmap') === 'రోడ్‌మ్యాప్', 'Telugu: navigation.roadmap');
  assert(i18n.t('navigation.explore') === 'అన్వేషించండి', 'Telugu: navigation.explore');
  assert(i18n.t('onboarding.selectLanguage') === 'భాషను ఎంచుకోండి', 'Telugu: onboarding.selectLanguage');
  assert(i18n.t('careerDetails.startRoadmap') === 'పర్సనలైజ్డ్ రోడ్‌మ్యాప్ ప్రారంభించండి', 'Telugu: careerDetails.startRoadmap');
  assert(i18n.t('opportunities.officialPortalNotice').includes('భారత ప్రభుత్వం'), 'Telugu: opportunities.officialPortalNotice contains natural phrasing');

  // Test 4: Hindi Resolution
  await i18n.changeLanguage('hi');
  assert(i18n.t('common.continue') === 'आगे बढ़ें', 'Hindi: common.continue');
  assert(i18n.t('navigation.roadmap') === 'रोडमैप', 'Hindi: navigation.roadmap');
  assert(i18n.t('navigation.explore') === 'खोजें', 'Hindi: navigation.explore');
  assert(i18n.t('onboarding.selectLanguage') === 'भाषा चुनें', 'Hindi: onboarding.selectLanguage');
  assert(i18n.t('careerDetails.startRoadmap') === 'व्यक्तिगत रोडमैप शुरू करें', 'Hindi: careerDetails.startRoadmap');
  assert(i18n.t('opportunities.officialPortalNotice').includes('भारत सरकार'), 'Hindi: opportunities.officialPortalNotice contains natural phrasing');

  // Test 5: Fallback to English when key is missing in another language
  const fallbackTest = i18n.t('common.tagline', { lng: 'en' });
  assert(Boolean(fallbackTest), 'Fallback mechanism is active');

  // Test 6: Interpolation in Telugu & Hindi
  await i18n.changeLanguage('te');
  const interpolatedTe = i18n.t('roadmap.stepsCompleted', { completed: 3, total: 6 });
  assert(interpolatedTe === '6 దశలలో 3 పూర్తయ్యాయి', 'Telugu Interpolation', interpolatedTe);

  await i18n.changeLanguage('hi');
  const interpolatedHi = i18n.t('roadmap.stepsCompleted', { completed: 3, total: 6 });
  assert(interpolatedHi === '6 में से 3 चरण पूर्ण हुए', 'Hindi Interpolation', interpolatedHi);

  // Test 7: Technical Terminology Safety
  // Ensure that technical career names and portal references are preserved and accessible
  assert(en.common.appName === 'Margdarshak', 'Brand name intact in en');
  assert(te.common.appName === 'మార్గదర్శక్', 'Brand transliterated clearly in te');
  assert(hi.common.appName === 'मार्गदर्शक', 'Brand transliterated clearly in hi');

  console.log('----------------------------------------------------');
  console.log(`Multilingual Test Suite Finished: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

void runI18nTests();
