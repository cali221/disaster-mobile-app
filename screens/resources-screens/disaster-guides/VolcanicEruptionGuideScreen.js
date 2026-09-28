import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

export function VolcanicEruptionGuideScreen() {   
    // summarized knowledge from buku saku panduan bencana BNPB
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'volcanoGuide.before.statusLevel', 
                  subheading: 'volcanoGuide.before.statusSourceSubheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                  texts: ['volcanoGuide.before.normal',
                          'volcanoGuide.before.waspada', 
                          'volcanoGuide.before.siaga',
                          'volcanoGuide.before.awas']},

                 {heading: 'volcanoGuide.before.krb', 
                  subheading: 'volcanoGuide.before.krbSourceSubheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                  texts: ['volcanoGuide.before.krbI', 
                          'volcanoGuide.before.krbII',
                          'volcanoGuide.before.krbIII']},

                {heading: 'volcanoGuide.before.whatToDoBeforeEruption', 
                 subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                 sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                 citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                 texts: ['volcanoGuide.before.prepareMaskAndGoggles', 
                         'volcanoGuide.before.knowEvacRoute',
                         'volcanoGuide.before.prepareLogistics',
                         'volcanoGuide.before.stayInformed',
                         'volcanoGuide.before.altPlan']}],

        // summarized knowledge from buku saku panduan bencana BNPB
        during: [{heading: 'volcanoGuide.during.whatToWear', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                  texts: ['volcanoGuide.during.protectiveGoggles', 
                          'volcanoGuide.during.mask',
                          'volcanoGuide.during.coveringClothes']},

                 {heading: 'volcanoGuide.during.whatToNotWear', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                  texts: ['volcanoGuide.during.contactLenses']},

                 {heading: 'volcanoGuide.during.whatToAvoid', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                  texts: ['volcanoGuide.during.areasRecommendedToBeEmptied', 
                          'volcanoGuide.during.valley',
                          'volcanoGuide.during.watershed',
                          'volcanoGuide.during.openAreas']}],

        after: [{heading: 'volcanoGuide.after.whatToDoAfterEruption', 
                 subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                 sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                 citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                 texts: ['volcanoGuide.after.avoidAsh', 
                         'volcanoGuide.after.clearRoof',
                         'volcanoGuide.after.dontDriveOnAsh',
                         'volcanoGuide.after.bewareWatershed']}]
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};