import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

// TODO: add attribution/mention source for guide content(?)
// mostly based on buku saku panduan bencana BNPB and English article(s) for some tusnami signs (?)
export function TsunamiGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'tsunamiGuide.before.signsHeading', 
                  subheading: 'this is my subheading',
                  texts: ['tsunamiGuide.before.strongOrlongEarthquake', 
                          'tsunamiGuide.before.retreatingSeaWater',
                          'tsunamiGuide.before.roarFromOcean',
                          'tsunamiGuide.before.tsunamiWarningFromBMKG']}, 
                 {heading: 'tsunamiGuide.before.whatToDoBeforeATsunami', 
                  subheading: 'this is my subheading',
                  texts: ['tsunamiGuide.before.knowTsunamiSigns',
                          'tsunamiGuide.before.stayInformed', 
                          'tsunamiGuide.before.knowEvacuationRouteAndSafePlace',
                          'tsunamiGuide.before.knowRisk',
                          'tsunamiGuide.before.evacuateToHigherGroundAfterBigEarthquake',
                          'tsunamiGuide.before.getAwayFromShore']}],
        during: [{heading: 'tsunamiGuide.during.whatToDoIfYouReceiveTsunamiWarning', 
                  subheading: 'this is my subheading',
                  texts: ['tsunamiGuide.during.evacuateOnFoot', 
                          'tsunamiGuide.during.stayOnHigherGround',
                          'tsunamiGuide.during.ifEvacuatingUsingVehicle']}],
        after: [{heading: 'tsunamiGuide.after.whatToAvoidAfterTsunami', 
                 subheading: 'this is my subheading',
                 texts: ['tsunamiGuide.after.damagedOrFloodedArea', 
                         'tsunamiGuide.after.puddlesOrStagnantWater',
                         'tsunamiGuide.after.movingWater',
                         'tsunamiGuide.after.areaThatWasSubmerged',
                         'tsunamiGuide.after.ruinsUnderWater',
                         'tsunamiGuide.after.areasStillAffected',
                         'tsunamiGuide.after.buildingsSurroundedByWater']},
                 {heading: 'tsunamiGuide.after.whatToDoAfterTsunami', 
                  subheading: 'this is my subheading',
                  texts: ['tsunamiGuide.after.ifInjuredGetHelp', 
                          'tsunamiGuide.after.goBackHomeIfSafe',
                          'tsunamiGuide.after.beCarefulWhenEnteringBuilding',
                          'tsunamiGuide.after.beCautiousAboutGasPipesAndElecticalInstallation',
                          'tsunamiGuide.after.washHands',
                          'tsunamiGuide.after.throwAwayContaminatedFood',
                          'tsunamiGuide.after.cleanInsectNests',
                          'tsunamiGuide.after.stayInformed',
                          'tsunamiGuide.after.participateInRepairs']}]
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};