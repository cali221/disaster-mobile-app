import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

// TODO: add attribution/mention source for guide content(?)
export function TsunamiGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'tsunamiGuide.before.signsHeading', 
                  texts: ['tsunamiGuide.before.strongOrlongEarthquake', 
                          'tsunamiGuide.before.retreatingSeaWater',
                          'tsunamiGuide.before.roarFromOcean',
                          'tsunamiGuide.before.tsunamiWarningFromBMKG']}, 
                 {heading: 'tsunamiGuide.before.whatToDoBeforeATsunami', 
                  texts: ['tsunamiGuide.before.knowTsunamiSigns',
                          'tsunamiGuide.before.stayInformed', 
                          'tsunamiGuide.before.knowEvacuationRouteAndSafePlace',
                          'tsunamiGuide.before.knowRisk',
                          'tsunamiGuide.before.evacuateToHigherGroundAfterBigEarthquake',
                          'tsunamiGuide.before.getAwayFromShore']}],
        during: [{heading: 'tsunamiGuide.during.whatToDoIfYouReceiveTsunamiWarning', 
                  texts: ['tsunamiGuide.during.evacuateOnFoot', 
                          'tsunamiGuide.during.stayOnHigherGround',
                          'tsunamiGuide.during.ifEvacuatingUsingVehicle']}],
        after: [{heading: 'tsunamiGuide.after.whatToAvoidAfterTsunami', 
                 texts: ['tsunamiGuide.after.damagedOrFloodedArea', 
                         'tsunamiGuide.after.puddlesOrStagnantWater',
                         'tsunamiGuide.after.movingWater',
                         'tsunamiGuide.after.areaThatWasSubmerged',
                         'tsunamiGuide.after.ruinsUnderWater',
                         'tsunamiGuide.after.areasStillAffected',
                         'tsunamiGuide.after.buildingsSurroundedByWater']},
                 {heading: 'tsunamiGuide.after.whatToDoAfterTsunami', 
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