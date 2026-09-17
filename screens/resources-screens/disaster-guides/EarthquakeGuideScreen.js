import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

// TODO: add attribution/mention source for guide content(?)
// these are based on various sources (buku saku bencana BNPB, international drop cover hold on guidance and educational youtube video from BMKG)
export function EarthquakeGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        // https://www.bmkg.go.id/gempabumi/mitigasi/antisipasi-gempabumi
        before: [{heading: 'earthquakeGuide.before.heading', 
                  subheading: 'earthquakeGuide.before.sourceSubheading',
                  sourceLinks: [{'name': 'earthquakeGuide.before.sourceLinkTitle', 
                                 'link': 'https://www.bmkg.go.id/gempabumi/mitigasi/antisipasi-gempabumi'}],
                  citations: [{index: 1, part1: `Badan Meteorologi, Klimatologi, dan Geofisika, “Antisipasi Gempa Bumi,” bmkg.go.id. Accessed: Sep. 17, 2026. [Online]. Available: https://www.bmkg.go.id/gempabumi/mitigasi/antisipasi-gempabumi`}],
                  texts: ['earthquakeGuide.before.knowEarthquakeDef', 
                          'earthquakeGuide.before.houseStructureAndLoc',
                          'earthquakeGuide.before.familiarizeSelfWithWorkplace',
                          'earthquakeGuide.before.prepareYourHouseAndWorkplace',
                          'earthquakeGuide.before.putHeavyItemsAtTheBottom',
                          'earthquakeGuide.before.everyPlaceHasRequiredItems']}],
        
        during: [{heading: 'earthquakeGuide.during.indoorsHeading', 
                  subheading: 'earthquakeGuide.during.indoorsSourceSubheading',
                  sourceLinks: [{'name': 'earthquakeGuide.during.bmkgVidSourceLinkTitle', 
                                 'link': 'https://www.youtube.com/watch?v=DeafytS3Rjw'},
                                {'name': 'earthquakeGuide.during.shakeOutArticleLinkTitle', 
                                 'link': 'https://www.shakeout.org/dropcoverholdon/'}],
                  citations: [{index: 1, part1: `Info BMKG, `, italicTxt: `Video Animasi Mitigasi Gempabumi (BMKG), `, part2: `(Jan. 14, 2019). Accessed: Sep. 17, 2026. [Online Video]. Available: https://www.youtube.com/watch?v=DeafytS3Rjw`},
                              {index: 2, part1: `“Drop, Cover, and Hold On!,” shakeout.org. Accessed: Sep. 17, 2026. [Online]. Available: https://www.shakeout.org/dropcoverholdon/`}],
                  texts: ['earthquakeGuide.during.protectHead', 
                          'earthquakeGuide.during.drop', 
                          'earthquakeGuide.during.cover', 
                          'earthquakeGuide.during.holdon',
                          'earthquakeGuide.during.stayAwayFromGlass',
                          'earthquakeGuide.during.turnOffElectricalAppliances']},
                 
                  {heading: 'earthquakeGuide.during.inACarHeading',
                   subheading: 'earthquakeGuide.during.inCarSourceSubheading',
                   sourceLinks: [{'name': 'earthquakeGuide.during.bmkgVidSourceLinkTitle', 
                                   'link': 'https://www.youtube.com/watch?v=DeafytS3Rjw'},
                                 {'name': 'earthquakeGuide.during.karangasemLinkTitle', 
                                  'link': 'https://inspektorat.karangasemkab.go.id/prosedur-evakuasi-saat-terjadi-gempa-bumi/'}],
                   citations: [{index: 1, part1: `“Prosedur Evakuasi Saat Terjadi Gempa Bumi,” inspektorat.karangasemkab.go.id. Accessed: Sep. 17, 2026. [Online]. Available: https://inspektorat.karangasemkab.go.id/prosedur-evakuasi-saat-terjadi-gempa-bumi/`},
                               {index: 2, part1: `Info BMKG, `, italicTxt: `Video Animasi Mitigasi Gempabumi (BMKG), `, part2: `(Jan. 14, 2019). Accessed: Sep. 17, 2026. [Online Video]. Available: https://www.youtube.com/watch?v=DeafytS3Rjw`}],
                   texts: ['earthquakeGuide.during.pullOver', 
                           'earthquakeGuide.during.pullHandbrake',
                           'earthquakeGuide.during.stayInCar']},

                 {heading: 'earthquakeGuide.during.outdoorsHeading', 
                  subheading: 'earthquakeGuide.during.outdoorsSourceSubheading',
                  sourceLinks: [{'name': 'earthquakeGuide.during.bmkgArticleSourceLinkTitle', 
                                 'link': 'https://www.bmkg.go.id/gempabumi/mitigasi/antisipasi-gempabumi'}],
                  citations: [{index: 1, part1: `Badan Meteorologi, Klimatologi, dan Geofisika, “Antisipasi Gempa Bumi,” bmkg.go.id. Accessed: Sep. 17, 2026. [Online]. Available: https://www.bmkg.go.id/gempabumi/mitigasi/antisipasi-gempabumi`}],
                  texts: ['earthquakeGuide.during.moveAwayFromThingsWhenOutside']},

                 {heading: 'earthquakeGuide.during.inBedHeading', 
                  subheading: 'earthquakeGuide.during.inBedSourceSubheading',
                  sourceLinks: [{'name': 'earthquakeGuide.during.readyGovLinkTitle', 
                                 'link': 'https://www.ready.gov/earthquakes'}],
                  citations: [{index: 1, part1: 'Ready.gov, “Earthquakes,” ready.gov. Accessed: Sep. 17, 2026. [Online]. Available: https://www.ready.gov/earthquakes'}],
                  texts: ['earthquakeGuide.during.lieFaceDownIfInBed']}],
       
        after: [{heading: 'earthquakeGuide.after.whatToDoAfterwards', 
                 subheading: 'earthquakeGuide.after.sourceSubheading',
                 sourceLinks: [{'name': 'earthquakeGuide.after.sourceLinkTitle', 
                                 'link': 'https://www.bmkg.go.id/gempabumi/mitigasi/antisipasi-gempabumi'}],
                 citations: [{index: 1, part1: `Badan Meteorologi, Klimatologi, dan Geofisika, “Antisipasi Gempa Bumi,” bmkg.go.id. Accessed: Sep. 17, 2026. [Online]. Available: https://www.bmkg.go.id/gempabumi/mitigasi/antisipasi-gempabumi`}], 
                 texts: ['earthquakeGuide.after.getOut', 
                         'earthquakeGuide.after.firstAidHelp',
                         'earthquakeGuide.after.checkForHazards',
                         'earthquakeGuide.after.stayAway',
                         'earthquakeGuide.after.stayUpdated',
                         'earthquakeGuide.after.questionnaire']}]
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};