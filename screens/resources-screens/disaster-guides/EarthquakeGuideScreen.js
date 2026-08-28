import { Text, View } from 'react-native';
import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';

export function EarthquakeGuideScreen() {
    /* keep guide texts here so that it's 
       avaiable offline without downloads */
    const guideTexts = {
        before: ['step1 before', 'step2 before'],
        during: ['step1 during this is a verly long texttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt', 'step2 during'],
        after: ['step 1 after', 'step2 after']
    };

    return(
       <DisasterGuideTemplate guideData = {guideTexts} />
    )
};