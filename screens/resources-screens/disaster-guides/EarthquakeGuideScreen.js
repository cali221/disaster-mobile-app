import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

export function EarthquakeGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'earthquakeGuide.before.heading', 
                  texts: ['earthquakeGuide.before.buildingStructureAndLoc',
                          'earthquakeGuide.before.identifySpots', 
                          'earthquakeGuide.before.evacuationPlan', 
                          'earthquakeGuide.before.practiceSafetySteps',
                          'earthquakeGuide.before.secureFurnitureToWall',
                          'earthquakeGuide.before.prepareLogistics']}],
        during: [{heading: 'earthquakeGuide.during.indoorsHeading', 
                  texts: ['earthquakeGuide.during.protectHead', 
                          'earthquakeGuide.during.drop', 
                          'earthquakeGuide.during.cover', 
                          'earthquakeGuide.during.holdon']},
                 {heading: 'earthquakeGuide.during.inACarHeading',
                  texts: ['earthquakeGuide.during.pullOver', 
                          'earthquakeGuide.during.stayInCar',
                          'earthquakeGuide.during.followInstructionsInACar']},
                 {heading: 'earthquakeGuide.during.outdoorsHeading', 
                  texts: ['earthquakeGuide.during.moveAwayFromThingsWhenOutside']},
                 {heading: 'earthquakeGuide.during.inBedHeading', 
                  texts: ['earthquakeGuide.during.lieFaceDownIfInBed']}],
        after: []
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};