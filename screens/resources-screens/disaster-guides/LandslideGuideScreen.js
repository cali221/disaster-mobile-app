import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

// TODO: add attribution/mention source for guide content(?)
// planned to be based on buku saku panduan bencana BNPB
export function LandslideGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'landslideGuide.before.whatToDoBeforeLandslide', 
                  texts: ['landslideGuide.before.reduceSurfaceSlopeAndGroundWaterSteepness', 
                          'landslideGuide.before.buildRetainingStructures',
                          'landslideGuide.before.dontBuildInDisasterProneArea',
                          'landslideGuide.before.terracingWithProperDrainageSystem',
                          'landslideGuide.before.properReforestation',
                          'landslideGuide.before.strongBuildingFoundation',
                          'landslideGuide.before.soilCompacting',
                          'landslideGuide.before.recognizeLandslideProneAreas',
                          'landslideGuide.before.buildRetainingWalls',
                          'landslideGuide.before.sealCracksOnSlope',
                          'landslideGuide.before.pileFoundationAvoidLiquefaction',
                          'landslideGuide.before.flexibleUtilitiesInGround',
                          'landslideGuide.before.relocateRecommendedInSomeCases',
                          'landslideGuide.before.plantAppropriatePlansInAridAreas',
                          'landslideGuide.before.dontBuildSomethingPermanentOnRiskyArea',
                          'landslideGuide.before.strongGutter',
                          'landslideGuide.before.beAlertWhenHighRainfall',
                          'landslideGuide.before.dontDeforestCarelessly']}],
        during: [],
        after: []
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};