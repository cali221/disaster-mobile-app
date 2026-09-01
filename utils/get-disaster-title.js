import { roundTo2DP } from "./rounding";
import { capitalizeFirstLetter } from "./text-formatting";

// function to get disaster title
export function getDisasterTitle(isContainedInArea, 
                                 cityOrRegency, 
                                 province, 
                                 distInMetersFromArea, 
                                 disasterType,
                                 t, 
                                 i18n){

  if(!disasterType){
    return t('disasterTitles.disasterTypeNotAvailable');
  }
  else{
    if(cityOrRegency && province && (isContainedInArea !== null || isContainedInArea !== undefined)){
        if(isContainedInArea == true){
            return t('disasterTitles.titleWhenInAreaIsTrue', { disasterType: i18n.exists(`disasterNames.${disasterType}`) ?  
                                                                                    capitalizeFirstLetter(t(`disasterNames.${disasterType}`)) : 
                                                                                    capitalizeFirstLetter(disasterType),
                                                                      cityOrRegency: cityOrRegency,
                                                                      province: province});
        }
        else if(isContainedInArea == false){
          return t('disasterTitles.titleWhenInAreaIsFalse', { disasterType: i18n.exists(`disasterNames.${disasterType}`) ?  
                                                                                    capitalizeFirstLetter(t(`disasterNames.${disasterType}`)) : 
                                                                                    capitalizeFirstLetter(disasterType),
                                                                     distFromArea: roundTo2DP((distInMetersFromArea)/1000),
                                                                     cityOrRegency: cityOrRegency,
                                                                     province: province})
        }
    }
    else{
        return i18n.exists(`disasterNames.${disasterType}`) ?  
               capitalizeFirstLetter(t(`disasterNames.${disasterType}`)) : 
               capitalizeFirstLetter(disasterType)
    }
  }
};