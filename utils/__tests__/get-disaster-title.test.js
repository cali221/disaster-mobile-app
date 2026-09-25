import { getDisasterTitle } from "../get-disaster-title";
import { useTranslation } from "react-i18next";

/**
 * Parameter order:
 * isContainedInArea, 
   cityOrRegency, 
   province, 
   distInMetersFromArea, 
   disasterType,
   t, 
   i18n
 */

describe('getDisasterTitle function when disaster type is SUPPORTED', () => {
    const {t, i18n} = useTranslation();

    beforeEach(()=>{
        i18n.exists = ()=>{return true};
    })

    it('should return the right title when the disaster is contained in an area', ()=>{
        expect(getDisasterTitle(true, 
                                'Some city', 
                                'Some province', 
                                100, 
                                'earthquake',
                                t, 
                                i18n)).toBe('disasterTitles.titleWhenInAreaIsTrue');
    });

    it('should return the right title when the disaster is not contained in an area', ()=>{
        expect(getDisasterTitle(false, 
                                'Some city', 
                                'Some province', 
                                100, 
                                'earthquake',
                                t, 
                                i18n)).toBe('disasterTitles.titleWhenInAreaIsFalse');
    });

    it('should return the right title when the disaster location is unknown', ()=>{
        expect(getDisasterTitle(false, 
                                null, 
                                null, 
                                null, 
                                'flood',
                                t, 
                                i18n)).toBe('DisasterNames.flood');
    });
});

describe('getDisasterTitle function when disaster type is UNSUPPORTED', () => {
    const {t, i18n} = useTranslation();

    beforeEach(()=>{
        i18n.exists = ()=>{return false};
    });

    it('should return the right title when the disaster is contained in an area', ()=>{
        expect(getDisasterTitle(true, 
                                'Some city', 
                                'Some province', 
                                100, 
                                'Some unknown disaster',
                                t, 
                                i18n)).toBe('disasterTitles.titleWhenInAreaIsTrue');
    });

    it('should return the right title when the disaster is not contained in an area', ()=>{
        expect(getDisasterTitle(false, 
                                'Some city', 
                                'Some province', 
                                100, 
                                'Some unknown disaster',
                                t, 
                                i18n)).toBe('disasterTitles.titleWhenInAreaIsFalse');
    });

    it('should return the right title when the disaster location is unknown', ()=>{
        expect(getDisasterTitle(false, 
                                null, 
                                null, 
                                null, 
                                'Some unknown disaster',
                                t, 
                                i18n)).toBe('Some unknown disaster');
    });
});