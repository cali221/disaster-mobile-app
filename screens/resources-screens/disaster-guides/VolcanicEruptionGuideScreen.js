import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

// TODO: add attribution/mention source for guide content(?)
// planned to be based on buku saku panduan bencana BNPB
export function VolcanicEruptionGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        before: [],
        during: [],
        after: []
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};