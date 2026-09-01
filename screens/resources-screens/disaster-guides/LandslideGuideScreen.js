import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

export function LandslideGuideScreen() {
    const disasterGuideTextsTranslationKey = {
        before: [],
        during: [],
        after: []
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};