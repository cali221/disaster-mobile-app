import { Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showInfoToast } from '../utils/showToast';
import * as Notifications from 'expo-notifications';
import { AuthContext } from '../contexts/AuthContext';
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native";
import * as mapStyle from '../assets/map-style/style.json';
import { supabase } from '../lib/supabase';

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
  const [disastersLast24h, setDisastersLast24h] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { 
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      showInfoToast('Notification detected', '');
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // TODO: fetch disaster data in last 24h before subscribing 
  useEffect(()=>{
    if(user){
      // yesterday's time
      const yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));

      // ISO string of yesterday's time
      const yesterdayStr = yesterday.toISOString();

      // listen to new disaster inserts in the last 24 hours
      const changes = supabase
                      .channel('table-db-changes')
                      .on(
                        'postgres_changes',
                        {
                          event: 'INSERT',
                          schema: 'disasters_related_data',
                          table: 'disasters',
                          filter: `datetime=gt.${yesterdayStr}`
                        },
                        (payload) => {
                          console.log('new disaster > yesterday detected');
                          setDisastersLast24h([...disastersLast24h, payload.new]);
                        }
                      ).subscribe();

      return () => {
        changes.unsubscribe();
      };
    }
  }, [user])

  return(
    <View style={styles.homescreenContainer}>
       <Map style={styles.disasterMap} 
            mapStyle={mapStyle}>
          {/* camera with bounds to Indonesia */}
          <Camera maxZoom={14} zoom={10} bounds={[93, -12, 142, 10]} />

          {/* sample marker */}
          <Marker lngLat={[106.827222,  -6.175288]}>
            <View style={styles.marker}>
            </View>
          </Marker>

          {/* markers showing disasters */}
          {/* TODO: implement overlapping markers hanndling(?) */}
          {
            //disastersLast24h.map(x=>([x['lat'], x['lon']])))
            (disastersLast24h.map((disaster, index) => (
              <Marker key={index} 
                      lngLat={[disaster['longitude'], disaster['latitude']]} 
                      onPress={()=>alert(`${disaster['disaster_type']} index: ${index}`)} >
                <View style={styles.marker}></View>
              </Marker>
            )))
          }
      </Map>  

      {/* TODO: temporary, move/remove later */}
      {/* button to go to watched areas settings, currently for adding watched areas */}
      <TouchableOpacity style={styles.accountSettingsBtn}
                        onPress={()=>{navigation.navigate('Watched Areas Settings', 
                                                          {'session': session})}}>
        <Text>Go to Watched areas settings</Text>
      </TouchableOpacity>
     
     {
        isLoading == true && (
          <ActivityIndicator size="large" color='pink' />
        )

      }
    </View>
  )
} 

const styles = StyleSheet.create({
  // screen content container
  homescreenContainer:{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: 50,
    backgroundColor: 'white',
    width: '100%',
    height: '100%'
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
  // overlay behind loading spinner
  loadingOverlay:{
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: '#0000008f',
    zIndex: 1,
 },
 // map showing disasters 
 disasterMap: {
  width: '100%',
  height: '35%'
 },
 marker: {
  backgroundColor: '#df3015c4',
  width: 20, 
  height: 20, 
  borderRadius: 10
 }
})