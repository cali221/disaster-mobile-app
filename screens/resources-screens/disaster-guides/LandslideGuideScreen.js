import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

export function LandslideGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'landslideGuide.before.whatToDoBeforeLandslide', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 
                                 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
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
                          'landslideGuide.before.strongGutter',
                          'landslideGuide.before.beAlertWhenHighRainfall',
                          'landslideGuide.before.dontDeforestCarelessly']}],

        during: [{heading: 'landslideGuide.during.whatToDoDuringLandslide', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                  texts: ['landslideGuide.during.getAway', 
                          'landslideGuide.during.evacuateIfSiren']}],
                          
        after: [{heading: 'landslideGuide.after.whatToDoAfterLandslide', 
                 subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                 sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                 citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                 texts: ['landslideGuide.after.avoidLandslideArea', 
                         'landslideGuide.after.anticipateAnotherIfRain']}]
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};