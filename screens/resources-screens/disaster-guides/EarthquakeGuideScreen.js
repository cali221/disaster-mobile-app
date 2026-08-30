import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { DisasterGuideTemplate } from '../../../components/DisasterGuideTemplate';
import { Text } from 'react-native';

export function EarthquakeGuideScreen() {
    const { t, i18n } = useTranslation();

    const disasterGuideTextsTranslationKey = {
        before: ['earthquakeGuide.before.hi'],
        during: ['earthquakeGuide.during.hi', 'earthquakeGuide.during.hello'],
        after: ['earthquakeGuide.after.hi']
    };

    return(
       <DisasterGuideTemplate guideTranslationKeys={disasterGuideTextsTranslationKey} />
    )
};