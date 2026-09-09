import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

// TODO: add attribution/mention source for guide content(?)
// these are based on various sources (buku saku bencana BNPB, international drop cover hold on guidance and educational youtube video from BMKG)
export function EarthquakeGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'earthquakeGuide.before.heading', 
                  subheading: 'this is my subheading',
                  texts: ['earthquakeGuide.before.buildingStructureAndLoc',
                          'earthquakeGuide.before.identifySpots', 
                          'earthquakeGuide.before.evacuationPlan', 
                          'earthquakeGuide.before.practiceSafetySteps',
                          'earthquakeGuide.before.secureFurnitureToWall',
                          'earthquakeGuide.before.prepareLogistics']}],
        during: [{heading: 'earthquakeGuide.during.indoorsHeading', 
                  subheading: 'this is my subheading',
                  texts: ['earthquakeGuide.during.protectHead', 
                          'earthquakeGuide.during.drop', 
                          'earthquakeGuide.during.cover', 
                          'earthquakeGuide.during.holdon']},
                 {heading: 'earthquakeGuide.during.inACarHeading',
                  subheading: 'this is my subheading',
                  texts: ['earthquakeGuide.during.pullOver', 
                          'earthquakeGuide.during.stayInCar',
                          'earthquakeGuide.during.followInstructionsInACar']},
                 {heading: 'earthquakeGuide.during.outdoorsHeading', 
                  subheading: 'this is my subheading',
                  texts: ['earthquakeGuide.during.moveAwayFromThingsWhenOutside']},
                 {heading: 'earthquakeGuide.during.inBedHeading', 
                  subheading: 'this is my subheading',
                  texts: ['earthquakeGuide.during.lieFaceDownIfInBed']}],
        after: [{heading: 'earthquakeGuide.after.whatToDoAfterwards', 
                 subheading: 'this is my subheading',
                 texts: ['earthquakeGuide.after.bewareOfAftershocks',
                         'earthquakeGuide.after.getOutIfIndoors', 
                         'earthquakeGuide.after.dontApproachDamagedBuilding',
                         'earthquakeGuide.after.checkSurroundings',
                         'earthquakeGuide.after.turnOffElectricityIfWiringDamaged',
                         'earthquakeGuide.after.ifGasSmellsOpenWindowAndGetOut',
                         'earthquakeGuide.after.followInfo']}]
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};