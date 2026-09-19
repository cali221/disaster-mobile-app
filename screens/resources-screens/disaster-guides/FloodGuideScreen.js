import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

export function FloodGuideScreen() {
    const { t, i18n } = useTranslation();
    
    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'floodGuide.before.whatToDoBefore', 
                  subheading: 'floodGuide.before.sourceSubheading',
                  sourceLinks: [{'name': 'floodGuide.before.sourceLinkTitle', 
                                 'link': 'https://bpbd.tangerangkota.go.id/berita/tips-aman-menghadapi-banjir-ini-yang-harus-dilakukan'}],
                  citations: [{index: 1, part1: '“Tips Aman Menghadapi Banjir, Ini yang Harus Dilakukan.” Accessed: Sep. 20, 2026. [Online]. Available: https://bpbd.tangerangkota.go.id/berita/tips-aman-menghadapi-banjir-ini-yang-harus-dilakukan', itaicTxt: '', part2: ''}],
                  texts: ['floodGuide.before.knowRisks', 
                          'floodGuide.before.knowEvacuationRouteAndSafePlace',
                          'floodGuide.before.prepareEmergencyBag',
                          'floodGuide.before.strenghtenAndHeightenHouse',
                          'floodGuide.before.stayUpdatedAboutWeather',
                          'floodGuide.before.scanDocuments']}],
        during: [{heading: 'floodGuide.during.whatToDoWhenFloodHapperning', 
                  subheading: 'floodGuide.during.sourceSubheading',
                  sourceLinks: [{'name': 'floodGuide.during.sourceLinkTitle', 
                                 'link': 'https://bpbd.hulusungaiselatankab.go.id/?p=14240'}],
                  citations: [{index: 1, part1: 'Admin, “Saat Banjir Terjadi: Apa yang Harus Dilakukan untuk Tetap Aman?,” bpbd.hulusungaiselatankab.go.id. Accessed: Sep. 17, 2026. [Online]. Available: https://bpbd.hulusungaiselatankab.go.id/?p=14240', italicTxt: '', part2: ''}],
                  texts: ['floodGuide.during.turnOffElectricity', 
                          'floodGuide.during.prepareEmergencyBag',
                          'floodGuide.during.evacuate',
                          'floodGuide.during.avoidWatershedsAndChannels',
                          'floodGuide.during.stayUpdated',
                          'floodGuide.during.dontTouchElectricalStuff']}],
        after: [{heading: 'floodGuide.after.whatToDoAfterFlood', 
                 subheading: 'floodGuide.after.sourceSubheading',
                 sourceLinks: [{'name': 'floodGuide.before.sourceLinkTitle', 
                                 'link': 'https://bpbd.jatengprov.go.id/langkah-yang-harus-dilakukan-setelah-banjir/'}],
                 citations: [{index: 1, part1: 'A. D. Prasakti, “Langkah yang Harus Dilakukan Setelah Banjir.” Accessed: Sep. 20, 2026. [Online]. Available: https://bpbd.jatengprov.go.id/langkah-yang-harus-dilakukan-setelah-banjir/', italicTxt: '', part2: ''}],
                 texts: ['floodGuide.after.cleanHouse', 
                         'floodGuide.after.dontTurnOnGasAndElectricity',
                         'floodGuide.after.dryHouse',
                         'floodGuide.after.onlyConsumeCleanWater']}]
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
        // <Text>
        //     {t('userTestingTemporary.contentOnThisScreenIsCurrentlyUnderReview')}
        // </Text>
    )
};