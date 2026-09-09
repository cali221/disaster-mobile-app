import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

// TODO: add attribution/mention source for guide content(?)
// planned to be based on buku saku panduan bencana BNPB
export function VolcanicEruptionGuideScreen() {
    // summarized knowledge from buku saku panduan bencana BNPB
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'volcanoGuide.before.statusLevel', 
                  texts: ['volcanoGuide.before.normal',
                          'volcanoGuide.before.waspada', 
                          'volcanoGuide.before.siaga',
                          'volcanoGuide.before.awas']},
                 {heading: 'volcanoGuide.before.krb', 
                  texts: ['volcanoGuide.before.krbI', 
                          'volcanoGuide.before.krbII',
                          'volcanoGuide.before.krbIII']},
                {heading: 'volcanoGuide.before.whatToDoBeforeEruption', 
                 texts: ['volcanoGuide.before.prepareMaskAndGoggles', 
                         'volcanoGuide.before.knowEvacRoute',
                         'volcanoGuide.before.prepareLogistics',
                         'volcanoGuide.before.stayInformed',
                         'volcanoGuide.before.altPlan']}],
        // summarized knowledge from buku saku panduan bencana BNPB
        during: [{heading: 'volcanoGuide.during.whatToWear', 
                  texts: ['volcanoGuide.during.protectiveGoggles', 
                          'volcanoGuide.during.mask',
                          'volcanoGuide.during.coveringClothes']},
                 {heading: 'volcanoGuide.during.whatToNotWear', 
                  texts: ['volcanoGuide.during.contactLenses']},
                 {heading: 'volcanoGuide.during.whatToAvoid', 
                  texts: ['volcanoGuide.during.areasRecommendedToBeEmptied', 
                          'volcanoGuide.during.valley',
                          'volcanoGuide.during.watershed',
                          'volcanoGuide.during.openAreas']}],
        after: [{heading: 'volcanoGuide.after.whatToDoAfterEruption', 
                 texts: ['volcanoGuide.after.avoidAsh', 
                         'volcanoGuide.after.clearRoof',
                         'volcanoGuide.after.dontDriveOnAsh',
                         'volcanoGuide.after.bewareWatershed']}]
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};