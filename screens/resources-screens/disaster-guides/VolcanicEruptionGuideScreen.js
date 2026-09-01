import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

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