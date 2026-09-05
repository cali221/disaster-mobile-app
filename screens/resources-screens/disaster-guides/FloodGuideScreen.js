import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

// TODO: add attribution/mention source for guide content(?)
export function FloodGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        // https://bpbd.tangerangkota.go.id/berita/tips-aman-menghadapi-banjir-ini-yang-harus-dilakukan
        before: [{heading: 'floodGuide.before.whatToDoBefore', 
                  texts: ['floodGuide.before.knowRisks', 
                          'floodGuide.before.knowEvacuationRouteAndSafePlace',
                          'floodGuide.before.prepareEmergencyBag',
                          'floodGuide.before.strenghtenAndHeightenHouse',
                          'floodGuide.before.stayUpdatedAboutWeather',
                          'floodGuide.before.scanDocuments']}],
        // https://bpbd.hulusungaiselatankab.go.id/?p=14240
        during: [{heading: 'floodGuide.during.whatToDoWhenFloodHapperning', 
                  texts: ['floodGuide.during.turnOffElectricity', 
                          'floodGuide.during.prepareEmergencyBag',
                          'floodGuide.during.stayUpdated',
                          'floodGuide.during.avoidWatershedsAndChannels',
                          'floodGuide.during.stayAwayFromFloodWater',
                          'floodGuide.during.avoidWaterWithElectricity']}],
        // https://bpbd.jatengprov.go.id/langkah-yang-harus-dilakukan-setelah-banjir/
        after: [{heading: 'floodGuide.after.whatToDoAfterFlood', 
                 texts: ['floodGuide.after.cleanHouse', 
                         'floodGuide.after.dontTurnOnGasAndElectricity',
                         'floodGuide.after.dryHouse',
                         'floodGuide.after.onlyConsumeCleanWater']}]
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};