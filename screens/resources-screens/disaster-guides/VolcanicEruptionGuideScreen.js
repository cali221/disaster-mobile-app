import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

export function VolcanicEruptionGuideScreen() {
    // summarized knowledge from buku saku panduan bencana BNPB
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'volcanoGuide.before.statusLevel', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  texts: ['volcanoGuide.before.normal',
                          'volcanoGuide.before.waspada', 
                          'volcanoGuide.before.siaga',
                          'volcanoGuide.before.awas']},
                 {heading: 'volcanoGuide.before.krb', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  texts: ['volcanoGuide.before.krbI', 
                          'volcanoGuide.before.krbII',
                          'volcanoGuide.before.krbIII']},
                {heading: 'volcanoGuide.before.whatToDoBeforeEruption', 
                 subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                 sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                 texts: ['volcanoGuide.before.prepareMaskAndGoggles', 
                         'volcanoGuide.before.knowEvacRoute',
                         'volcanoGuide.before.prepareLogistics',
                         'volcanoGuide.before.stayInformed',
                         'volcanoGuide.before.altPlan']}],
        // summarized knowledge from buku saku panduan bencana BNPB
        during: [{heading: 'volcanoGuide.during.whatToWear', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  texts: ['volcanoGuide.during.protectiveGoggles', 
                          'volcanoGuide.during.mask',
                          'volcanoGuide.during.coveringClothes']},
                 {heading: 'volcanoGuide.during.whatToNotWear', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  texts: ['volcanoGuide.during.contactLenses']},
                 {heading: 'volcanoGuide.during.whatToAvoid', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  texts: ['volcanoGuide.during.areasRecommendedToBeEmptied', 
                          'volcanoGuide.during.valley',
                          'volcanoGuide.during.watershed',
                          'volcanoGuide.during.openAreas']}],
        after: [{heading: 'volcanoGuide.after.whatToDoAfterEruption', 
                 subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                 sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                 texts: ['volcanoGuide.after.avoidAsh', 
                         'volcanoGuide.after.clearRoof',
                         'volcanoGuide.after.dontDriveOnAsh',
                         'volcanoGuide.after.bewareWatershed']}]
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};