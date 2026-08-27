import { Text, 
         TouchableOpacity, 
         View, 
         StyleSheet, 
         ScrollView,
         Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showErrorToast, showInfoToast } from '../utils/show-toast';
import * as Notifications from 'expo-notifications';
import { AuthContext } from '../contexts/AuthContext';
//import { Map, Camera, Marker } from "@maplibre/maplibre-react-native"; 
import * as mapStyle from '../assets/map-style/style.json';
import { supabase } from '../lib/supabase';
import { getYesterdaysISOTimeStr } from '../utils/get-time';
import { capitalizeFirstLetter } from '../utils/text-formatting';
import { roundTo2DP } from '../utils/rounding';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { MapDisasterLegend } from '../components/MapDisasterLegend';
import { BottomModalBase } from '../components/modals-base/BottomModalBase';

// name Map as MapIcon to differentiate from Map Libre's Map
import { Phone, 
         MapIcon, 
         ShieldAlert, 
         BadgeQuestionMark, 
         ScrollText, 
         Briefcase } from 'lucide-react-native'; 
import { DataAttributionSection } from '../components/DataAttributionSection';

// set how the notification should be shown if it happens while the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  })
});

export function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [disastersLast24h, setDisastersLast24h] = useState([]);
  const [disastersSummaryFollowingWatchedAreas, setDisastersSummaryFollowingWatchedAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowBottomModal, setShouldShowBottomModal] = useState(false);

  useEffect(() => { 
    // TODO: these are just example listeners, should be removed/changed later
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      showInfoToast('Notification detected', '');
      console.log(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);


  // TODO: handle overlapping markers (do it for all maps, implement using a utility function)
  // possible approach: find coordinate duplicates, offset coordinates to cluster around the actual coordinates
  // useEffect(()=>{
  // }, [disastersLast24h])

  useEffect(()=>{
    // function to get recent disasters (last 24 hours) around user's watched areas
    const fetchRecentDisastersNearWatchedAreaSummary = async (user_id) => {
        if(user_id){
          const {data, error} = await supabase.rpc('get_homescreen_summary_of_disasters_for_user',
                                                   {user_id_input: user_id});
              
          if(error){
            showErrorToast(t('homeScreen.failedToFetchRecentDisastersNearWatchedAreas'), 
                          `${error.message ?? JSON.stringify(error)}`);
          }
          else{
            if(data){
              setDisastersSummaryFollowingWatchedAreas([...data]);
            }
          } 
        }
    };

    // function to fetch disasters greater than the time specified in parameter
    // (for showing the initial existing disasters in the last 24 hours on map)
    const fetchDisastersGtTimeStrFilter = async(gtTimestrFilter) => {
      const { data, error } = await supabase.schema('disasters_related_data')
                                            .from('disasters')
                                            .select()
                                            .gt('datetime', gtTimestrFilter);
      
      if(error){
        showErrorToast(t('homeScreen.failedToFetchExistingDisastersToShowOnMap'),
                       `${error.message ?? JSON.stringify(error)}`);
      }
      else{
        if(data){
          setDisastersLast24h([...data]);
        }
      }
    }

    // function to subscribe to new disasters
    const subscribeToNewDisasters = (gtTimestrFilter) => {
      // listen to new disaster inserts in the last 24 hours
      const changes = supabase
                      .channel('disasters-table-db-changes')
                      .on(
                        'postgres_changes',
                        {
                          event: 'INSERT',
                          schema: 'disasters_related_data',
                          table: 'disasters',
                          filter: `datetime=gt.${gtTimestrFilter}`
                        },
                        (payload) => {
                          setDisastersLast24h(disastersLast24h => [...disastersLast24h, payload.new]);

                          if(user?.id){
                            /* re-fetch and update the summary of disasters near 
                               user's watched areas on disaster insert */
                            fetchRecentDisastersNearWatchedAreaSummary(user?.id);
                          }
                        }
                      ).subscribe();

      return changes;
    } 

    if(user){
      setIsLoading(true);

      // time string of yesterday's time in ISO format
      const yesterdaytimeStr = getYesterdaysISOTimeStr();

      // fetch disasters data in the last 24 hours
      fetchDisastersGtTimeStrFilter(yesterdaytimeStr);
    
      // fetch disasters data in the last 24 hours that match user's watched areas
      fetchRecentDisastersNearWatchedAreaSummary(user?.id);

      // subcribe to new disasters data within the last 24 hours
      const newDisastersSubscription = subscribeToNewDisasters(yesterdaytimeStr);

      setIsLoading(false);

      return () => {
        if(newDisastersSubscription){
          newDisastersSubscription.unsubscribe();
        }
      };
    }
  }, [user?.id])

  return(
    <View style={[styles.homescreenContainer, { paddingLeft: insets.left,
                                                paddingRight: insets.right }]}>
        <StatusBar style="auto" />
        {/* disaster map section */}
        <View style={styles.disasterMapAreaContainer}>
          {/* button to create a crowdsourced report */}
          <TouchableOpacity style={styles.experiencedDisasterBtn}
                            accessibilityLabel={t('homeScreen.experiencedDisasterBtnTxt')}
                            accessibilityRole='button'
                            onPress={()=>{navigation.navigate('Report Menu')}}>
            <Text style={styles.experiencedDisasterBtnTxt}>
              {t('homeScreen.experiencedDisasterBtnTxt')}
            </Text>
          </TouchableOpacity>

          {/* map placeholder, use when testing on web */}
          <View style={{ width: '100%', height: '100%', backgroundColor: 'plum'}}></View>
    
          {/* the disaster map component */}
          {/* <Map style={styles.disasterMap} 
               mapStyle={mapStyle}
               compassPosition={{top: 20, left: 20}}
               onStartShouldSetResponder={()=>{return true}}>
            <Camera maxZoom={14} zoom={10} bounds={[93, -12, 142, 10]} />
            {
              (disastersLast24h?.map((disaster, index) => (
                <Marker key={index} 
                        testID='marker-on-map'
                        lngLat={[disaster['longitude'], disaster['latitude']]} 
                        onPress={()=>{navigation.navigate('Disaster Details',
                                                          {disasterId: disaster['id']}
                        )}}
                        accessibilityRole='button'
                        accessibilityLabel={t('homeScreen.goToDisastersDetailsScreenAccLbl')}>
                  <MapDisasterLegend disasterType={disaster['disaster_type']} />
                </Marker>
              )))
            }
          </Map>  */}
      </View>

      {/* scroll view for content below disaster map */}
      <ScrollView style={styles.homescreenContainer} 
                  contentContainerStyle={styles.scrollViewContentContainer}
                  nestedScrollEnabled={true}
                  accessibilityRole='scrollbar'>
       
          {/* explanation text about the disaster map */}
          <Text style={styles.mapExplanationTxt}>
            {t('homeScreen.disasterMapExplanation')}
          </Text>

          {/* section for showing recent disasters near user's watched area */}
          <View style={styles.disasterNearWatchedAreaSummaryContainer}>
            {/* the section's heading text */}
            <Text style={styles.sectionHeadingTxt}>
              {t('homeScreen.recentDisasterNearYourWatchedAreaHeading')}
            </Text>
            
            {/* scroll view showing a list of the recent disaster near user's watched areas  */}
            <ScrollView nestedScrollEnabled={true} 
                        style={styles.disasterNearWatchedAreaSummaryScrolLView}
                        accessibilityRole='scrollbar'>
              {
                (disastersSummaryFollowingWatchedAreas?.map((summary, index) => (
                  /* map the corresponding array state into views with disaster 
                     description and details button */
                  <View key={index} 
                        style={styles.disasterSummaryItemContainer} 
                        testID='disaster-summary-item-container'>
                    {/* the disaster description text, showing the disaster type, 
                        how far is it from the watched area and 
                        the time of the disaster */}
                    <View style={styles.disasterSummaryTxtContainer}>
                      <Text style={styles.disasterSummaryTxt}>
                        {t('homeScreen.recentDisasterNearYourWatchedAreaItemTxtTemplate', { disasterType: i18n.exists(`disasterNames.${summary.disaster_type}`) ?  
                                                                                                          capitalizeFirstLetter(t(`disasterNames.${summary.disaster_type}`)) : capitalizeFirstLetter(summary.disaster_type),
                                                                                            distance: roundTo2DP(summary.dist_in_m_from_disaster/1000),
                                                                                            cityOrRegency: summary.adm2_name,
                                                                                            province: summary.adm1_name})}
                      </Text>

                      <Text style={styles.disasterSummaryTxt}> 
                        {new Date(summary.disaster_datetime).toLocaleString('id', {timeZoneName: 'short'})}
                      </Text>
                    </View>

                    {/* button to see the details of the disaster */}
                    <TouchableOpacity style={styles.disasterSummaryDetailsBtn}
                                      accessibilityLabel={t('homeScreen.goToDisastersDetailsScreenAccLbl')}
                                      accessibilityRole='button'
                                      onPress={()=>{navigation.navigate('Disaster Details', 
                                                                        {disasterId: summary?.disaster_id})
                                                   }}>
                      <Text style={styles.disasterSummaryDetailsBtnTxt}>{t('shared.details')}</Text>
                    </TouchableOpacity>
                  </View>
                )))
              }
            </ScrollView>
          </View>

          {/* button to edit the areas watchlist */}
          <TouchableOpacity style={styles.editWatchlistBtn}
                            accessibilityLabel={t('homeScreen.editWatchlistBtnTxt')}
                            accessibilityRole='button'
                            onPress={()=>{navigation.navigate('Watched Areas Settings')}}>
            <Text style={styles.editWatchlistBtnTxt}>{t('homeScreen.editWatchlistBtnTxt')}</Text>
          </TouchableOpacity>

          {/* section for quick access to important screens */}
          <View style={styles.homescreenContentSectionsNonScroll}>
            {/* the section heading */}
            <Text style={styles.sectionHeadingTxt}>
              {t('homeScreen.quickAccessHeaderTxt')}
            </Text>

            {/* container of the buttons */}
            <View style={styles.nonScrollSectionsButtonsContainer}>
              {/* emergency number button */}
              <TouchableOpacity style={styles.nonScrollSectionButtons}
                                accessibilityLabel={t('homeScreen.emergencyNumberBtnAccLbl')}
                                accessibilityRole='button'
                                onPress={()=>{
                                              navigation.navigate('Resource Hub Screen Stack', 
                                                                  { screen: 'Emergency Numbers',
                                                                    initial: false, 
                                                                    params: {}
                                                                  })
                                             }
                                        }>
                <Phone color={'#FFFFFF'} size={30} />

                <Text style={styles.nonScrollSectionButtonsTxt}>
                  {t('homeScreen.emergencyNumberBtnTxt')}
                </Text>
              </TouchableOpacity>

              {/* useful location button */}
              <TouchableOpacity style={styles.nonScrollSectionButtons}
                                accessibilityLabel={t('homeScreen.usefulLocBtnAccLbl')}
                                accessibilityRole='button'
                                onPress={()=>{
                                              navigation.navigate('Resource Hub Screen Stack', 
                                                                  { screen: 'Useful Locations',
                                                                    initial: false, 
                                                                    params: {}
                                                                  })
                                             }
                                        }>
                <MapIcon color={'#FFFFFF'} size={30} />

                <Text style={styles.nonScrollSectionButtonsTxt}>
                  {t('homeScreen.usefulLocsBtnTxt')}
                </Text>
              </TouchableOpacity>

              {/* evacuation steps button */}
              <TouchableOpacity style={styles.nonScrollSectionButtons}
                                accessibilityLabel={t('homeScreen.evacuationStepsBtnAccLbl')}
                                accessibilityRole='button'
                                onPress={()=>{setShouldShowBottomModal(true)}}>
                <ShieldAlert color={'#FFFFFF'} size={30} />

                <Text style={styles.nonScrollSectionButtonsTxt}>
                  {t('homeScreen.evacuationStepsBtnTxt')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* the gamification section */}
          <View style={styles.homescreenContentSectionsNonScroll}>
            {/* the section heading */}
            <Text style={styles.sectionHeadingTxt}>
              {t('homeScreen.gamificationHeaderTxt')}
            </Text>

            {/* explanation text about the features */}
            <Text style={styles.sectionExplanationTxt}>
             {t('homeScreen.gamificationSectionExplanationTxt')}
            </Text>

            {/* container of the buttons */}
            <View style={styles.nonScrollSectionsButtonsContainer}>
              {/* quizzes button */}
              <TouchableOpacity style={styles.nonScrollSectionButtons}
                                accessibilityLabel={t('homeScreen.quizzesBtnAccLbl')}
                                accessibilityRole='button'
                                onPress={()=>{navigation.navigate('Quizzes')}}>
                <BadgeQuestionMark color={'#FFFFFF'} size={30} />

                <Text style={styles.nonScrollSectionButtonsTxt}>
                  {t('homeScreen.quizzesBtnTxt')}
                </Text>
              </TouchableOpacity>

              {/* flashcards button */}
              <TouchableOpacity style={styles.nonScrollSectionButtons}
                                accessibilityLabel={t('homeScreen.flashcardsBtnAccLbl')}
                                accessibilityRole='button'
                                onPress={()=>{navigation.navigate('Flashcards')}}>
                <ScrollText color={'#FFFFFF'} size={30} />

                <Text style={styles.nonScrollSectionButtonsTxt}>
                  {t('homeScreen.flashcardsBtnTxt')}
                </Text>
              </TouchableOpacity>

              {/* emergency bag button */}
              <TouchableOpacity style={styles.nonScrollSectionButtons}
                                accessibilityLabel={t('homeScreen.emergencyBagBtnAccLbl')}
                                accessibilityRole='button'
                                onPress={()=>{navigation.navigate('Emergency Bag')}}>
                <Briefcase color={'#FFFFFF'} size={30} />

                <Text style={styles.nonScrollSectionButtonsTxt}>
                  {t('homeScreen.emergencyBagBtnTxt')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* "Learn" section */}
          <View style={styles.homescreenContentSectionsNonScroll}>
            {/* section heading */}
            <Text style={styles.sectionHeadingTxt}>
              {t('homeScreen.learnHeaderTxt')}
            </Text>

            {/* explanation text containing link to resource hub 
                and link to BNPB's guide */}
            <Text style={styles.sectionExplanationTxt}>
              {t('homeScreen.learnSectionResourceHubInfoGoToThe')}{" "}

              {/* resource hub link text, 
                  redirect to the Resource Hub screen when pressed */}
              <Text style={[styles.sectionExplanationTxt, styles.linkText]}
                    accessibilityRole='link'
                    onPress={()=>{navigation.navigate('Resource Hub Screen Stack', 
                                                      { screen: 'Resource Hub',
                                                        initial: false, 
                                                        params: {}
                                                      })
                                 }}>
                Resource Hub
              </Text>
              {" "}{t('homeScreen.learnSectionResourceHubInfoToReadGuidesAbt')}.
            </Text>
            <Text style={styles.sectionExplanationTxt}>
              {/* information text about BNPB pocket book */}
              {t('homeScreen.learnSectionBNPBSourceInfoCheckOut')}{" "}

              {/* link to the webpage with the book download button */}
              <Text style={[styles.sectionExplanationTxt, styles.linkText]}
                    accessibilityRole='link'
                    onPress={() => {Linking.openURL('https://bnpb.go.id/buku/buku-saku-tanggap-tangkas-tangguh-cetakan-kelima-2020')}}>
                {t('homeScreen.learnSectionBNPBSourceInfoHereLink')}.
              </Text>
            </Text>
          </View>

          {/* data attribution */}
          <DataAttributionSection attributionTxt={t('homeScreen.dataAttribution')} />
      </ScrollView>

      {/* the bottom modal to show when shouldShowBottomModal is true */}
      {
        shouldShowBottomModal == true && (
          <BottomModalBase title={t('homeScreen.pickDisasterModalTitle')}
                           closeFunc={()=>{setShouldShowBottomModal(false)}}>

              {/* earthquake button */}
              <TouchableOpacity style={styles.pickDisasterModalOptionBtn}
                                accessibilityRole='button'
                                accessibilityLabel={t('homeScreen.earthquakeBtnAccLbl')}
                                onPress={()=>{navigation.navigate('Resource Hub Screen Stack', 
                                                                  { screen: 'Earthquake Guide', 
                                                                    initial: false, 
                                                                    params: {}
                                                                  })}}>
                <Text style={styles.pickDisasterModalOptionBtnTxt}>
                  {capitalizeFirstLetter(t('disasterNames.earthquake'))}
                </Text>
              </TouchableOpacity>

              {/* tsunami button */}
              <TouchableOpacity style={styles.pickDisasterModalOptionBtn}
                                accessibilityRole='button'
                                accessibilityLabel={t('homeScreen.tsunamiBtnAccLbl')}
                                onPress={()=>{navigation.navigate('Resource Hub Screen Stack', 
                                                                  { screen: 'Tsunami Guide', 
                                                                    initial: false, 
                                                                    params: {}
                                                                  })}}>
                <Text style={styles.pickDisasterModalOptionBtnTxt}>
                  {capitalizeFirstLetter(t('disasterNames.tsunami'))}
                </Text>
              </TouchableOpacity>

              {/* flood button */}
              <TouchableOpacity style={styles.pickDisasterModalOptionBtn}
                                accessibilityRole='button'
                                accessibilityLabel={t('homeScreen.floodBtnAccLbl')}
                                onPress={()=>{navigation.navigate('Resource Hub Screen Stack', 
                                                                  { screen: 'Flood Guide', 
                                                                    initial: false, 
                                                                    params: {}
                                                                  })}}>
                <Text style={styles.pickDisasterModalOptionBtnTxt}>
                  {capitalizeFirstLetter(t('disasterNames.flood'))}
                </Text>
              </TouchableOpacity>

              {/* landslide button */}
              <TouchableOpacity style={styles.pickDisasterModalOptionBtn}
                                accessibilityRole='button'
                                accessibilityLabel={t('homeScreen.landslideBtnAccLbl')}
                                onPress={()=>{navigation.navigate('Resource Hub Screen Stack', 
                                                                  { screen: 'Landslide Guide', 
                                                                    initial: false, 
                                                                    params: {}
                                                                  })}}>
                <Text style={styles.pickDisasterModalOptionBtnTxt}>
                  {capitalizeFirstLetter(t('disasterNames.landslide'))}
                </Text>
              </TouchableOpacity>

              {/* volcanic eruption button */}
              <TouchableOpacity style={styles.pickDisasterModalOptionBtn}
                                accessibilityRole='button'
                                accessibilityLabel={t('homeScreen.volcanicEruptionBtnAccLbl')}
                                onPress={()=>{navigation.navigate('Resource Hub Screen Stack', 
                                                                  { screen: 'Volcanic Eruption Guide', 
                                                                    initial: false, 
                                                                    params: {}
                                                                  })}}>
                <Text style={styles.pickDisasterModalOptionBtnTxt}>
                  {capitalizeFirstLetter(t('disasterNames.volcano'))}
                </Text>
              </TouchableOpacity>
          </BottomModalBase>
        )
      }

      {/* loading overlay to show when isLoading is true */}
      {
        isLoading == true && (
          <LoadingOverlay />
        )
      }
    </View>
  )
} 

const styles = StyleSheet.create({
  // container of all of the screen's content
  homescreenContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white'
  },
  // content container of the scroll view for content below disaster map
  scrollViewContentContainer: { 
    paddingHorizontal: 30, 
    paddingTop: 30, 
    paddingBottom: 100, 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    rowGap: 30,
    backgroundColor: 'white'
  },
  // container of the disaster map
  disasterMapAreaContainer:{
    backgroundColor: 'white',
    height: '45%', 
    maxHeight: 550
  },
  // button to go to watched areas settings screen
  accountSettingsBtn: {
    width: 250,
    backgroundColor: 'lavenderblush',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    borderRadius: 20,
    marginBottom: 20
  },
  // map showing disasters 
  disasterMap: {
    width: '100%',
    height: '100%'
  },
  // button that says "Experienced a disaster (...)"
  experiencedDisasterBtn: {
    position: 'absolute',
    backgroundColor: '#2D3782',
    top: 20,
    right: 20,
    width: 270,
    height: 50,
    borderRadius: 50,
    zIndex: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  // text inside the button that says "Experienced a disaster (...)"
  experiencedDisasterBtnTxt: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600'
  },
  // explanation text about the disaster map
  mapExplanationTxt: {
    textAlign: 'center',
    color: '#2D3782',
    fontWeight: '500'
  },
  /* scroll view for showing a list of disaster summaries 
     of recent disasters near user's watched area */
  disasterNearWatchedAreaSummaryScrolLView: {
    flex: 1
  },
  /* container of the section with scroll view and explanation/heading text
     or showing recent disasters near user's watched area*/
  disasterNearWatchedAreaSummaryContainer: {
    height: 220,
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderColor: 'grey',
    borderWidth: 1,
    elevation: 2
  },
  /* container of each item in the list showing 
     recent disasters near user's watched area */
  disasterSummaryItemContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3782'
  },
  /* container of texts for summary of disasters 
     near user's watched area */
  disasterSummaryTxtContainer: {
    display: 'flex', 
    flexDirection: 'column', 
    width: '60%',
    rowGap: 10
  },
  /* text for each item in the list showing 
     recent disasters near user's watched area */
  disasterSummaryTxt: {
    width: '100%',
    color: '#2D3782'
  },
  /* button to go to the details screen for 
     the disaster shown in the list of recent 
     disasters near user's watched area */
  disasterSummaryDetailsBtn: {
    backgroundColor: '#2D3782',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30
  },
  /* text inside the button to go 
     to the details screen for the disaster 
     shown in the list of recent 
     disasters near user's watched area  */
  disasterSummaryDetailsBtnTxt: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  // the section heading texts 
  sectionHeadingTxt: {
    fontWeight: '700',
    fontSize: 17,
    color: '#2D3782'
  },
  // button for editing areas watchlist 
  editWatchlistBtn: {
    backgroundColor: '#2D3782',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30
  },
  // text inside button to edit areas watchlist
  editWatchlistBtnTxt: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15
  },
  /* non-scrollable sections on the screen */
  homescreenContentSectionsNonScroll: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderColor: 'grey',
    borderWidth: 1,
    elevation: 2,
    display: 'flex',
    flexDirection: 'column',
    rowGap: 10,
    columnGap: 20,
    backgroundColor: 'white'
  },
  /* container of buttons in the non-scrollable 
     sections of the screen */
  nonScrollSectionsButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    flex: 1
  },
  /* buttons inside the non-scrollable 
     section of the screen */
  nonScrollSectionButtons: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D3782',
    width: '30%',
    height: '100%',
    padding: 5,
    maxWidth: 100,
    borderRadius: 20,
    elevation:  5
  },
  /* text inside the buttons in the 
      non-scrollable section of the screen */
  nonScrollSectionButtonsTxt: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600'
  },
  /* explanation texts inside the 
      sections of the screen */
  sectionExplanationTxt: {
    color: '#2D3782'
  },
  // additional styling for text links
  linkText: {
    color: 'dodgerblue',
    textDecorationLine: 'underline'
  },
  /* the option button on modal for disaster type 
     to view evacuation steps for */
  pickDisasterModalOptionBtn: {
    width: '100%',
    height: 55,
    backgroundColor: '#2D3782',
    borderRadius: 25,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25
  },
  /* the text inside the option button 
     on modal for disaster type to view 
     evacuation steps for */
  pickDisasterModalOptionBtnTxt: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 17
  }
});