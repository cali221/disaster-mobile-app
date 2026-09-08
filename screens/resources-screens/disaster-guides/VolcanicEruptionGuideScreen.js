import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

// TODO: add attribution/mention source for guide content(?)
// planned to be based on buku saku panduan bencana BNPB
export function VolcanicEruptionGuideScreen() {
    // summarized knowledge from book
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
        during: [],
        after: []
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};