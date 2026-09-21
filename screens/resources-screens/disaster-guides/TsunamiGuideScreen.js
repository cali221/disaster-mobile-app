import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

export function TsunamiGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'tsunamiGuide.before.signsHeading', 
                  subheading: 'tsunamiGuide.before.signsSubheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 
                                 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                  texts: ['tsunamiGuide.before.strongAndLongEarthquake', 
                          'tsunamiGuide.before.retreatingSeaWater',
                          'tsunamiGuide.before.fishAtBeach',
                          'tsunamiGuide.before.roarFromOcean',
                          'tsunamiGuide.before.tsunamiWarningFromBMKG']}, 

                 {heading: 'tsunamiGuide.before.whatToDoBeforeATsunami', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 
                                 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                  texts: ['tsunamiGuide.before.knowTsunamiSigns',
                          'tsunamiGuide.before.stayInformed', 
                          'tsunamiGuide.before.knowEvacuationRoute',
                          'tsunamiGuide.before.knowRisk',
                          'tsunamiGuide.before.evacuateToHigherGroundAfterBigEarthquake',
                          'tsunamiGuide.before.getAwayFromShore']}],

        during: [{heading: 'tsunamiGuide.during.whatToDoIfYouReceiveTsunamiWarning', 
                  subheading: 'tsunamiGuide.during.sourceSubheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 
                                 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'},
                                {'name': 'tsunamiGuide.during.bmkgVidLinkTitle', 
                                 'link': 'https://www.youtube.com/watch?v=YXpIW3GoGco'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`},
                              {index: 2, part1: `Info BMKG, `, italicTxt: `Mitigasi Menghadapi Tsunami, `, part2: `(Mar. 02, 2023). Accessed: Sep. 17, 2026. [Online Video]. Available: https://www.youtube.com/watch?v=YXpIW3GoGco`}],
                  texts: ['tsunamiGuide.during.getAwayFromBeach',
                          'tsunamiGuide.during.evacuateOnFoot', 
                          'tsunamiGuide.during.stayOnHigherGround',
                          'tsunamiGuide.during.stayInformed',
                          'tsunamiGuide.during.ifEvacuatingUsingVehicle',
                          'tsunamiGuide.during.ifOnShipOrBoat']}],
                          
        after: [{heading: 'tsunamiGuide.after.whatToAvoidAfterTsunami', 
                 subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                 sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 
                                'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                 citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
                 texts: ['tsunamiGuide.after.damagedOrFloodedArea', 
                         'tsunamiGuide.after.puddlesOrStagnantWater',
                         'tsunamiGuide.after.movingWater',
                         'tsunamiGuide.after.areaThatWasSubmerged',
                         'tsunamiGuide.after.ruinsUnderWater',
                         'tsunamiGuide.after.areasStillAffected',
                         'tsunamiGuide.after.buildingsSurroundedByWater']},

                 {heading: 'tsunamiGuide.after.whatToDoAfterTsunami', 
                  subheading: 'disasterGuide.sharedSource.bnpbBookOnly.subheading',
                  sourceLinks: [{'name': 'disasterGuide.sharedSource.bnpbBookOnly.linkTitle', 'link': 'https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020'}],
                  citations: [{index: 1, part1: `T. Yanuarto, S. Pinuji, A. C. Utomo, and I. T. Satrio, `, italicTxt: `Buku Saku Tanggap Tangkas Tangguh Menghadapi Bencana. `, part2: `Jakarta: Pusat Data Informasi dan Humas BNPB, 2019. Accessed: Sep. 17, 2026. [Online]. Available: https://ebookbanyuwangi.id/assets/2022/buku-saku-bencana.pdf`}],
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