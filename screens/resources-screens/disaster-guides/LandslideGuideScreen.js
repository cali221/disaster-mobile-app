import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

// TODO: add attribution/mention source for guide content(?)
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