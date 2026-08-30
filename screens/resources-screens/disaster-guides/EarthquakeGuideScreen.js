import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';
import { Text } from 'react-native';

export function EarthquakeGuideScreen() {
    const { t, i18n } = useTranslation();

    const disasterGuideTextsTranslationKey = {
        before: [{heading: 'earthquakeGuide.before.heading', 
                  texts: ['earthquakeGuide.before.buildingStructureAndLoc',
                          'earthquakeGuide.before.identifySpots', 
                          'earthquakeGuide.before.evacuationPlan', 
                          'earthquakeGuide.before.practiceSafetySteps',
                          'earthquakeGuide.before.secureFurnitureToWall',
                          'earthquakeGuide.before.prepareLogistics']}],
        during: [],
        after: []
    };

    return(
        <DisasterGuideTemplate guideContent={disasterGuideTextsTranslationKey} />
    )
};