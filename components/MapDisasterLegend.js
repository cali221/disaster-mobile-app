import { View, StyleSheet } from 'react-native';
import { Activity,
         Waves,
         Flame,
         Mountain,
         Wind,
         Tornado,
         Haze,
         ShieldQuestion } from 'lucide-react-native'; 

export function MapDisasterLegend(props) {
    let disasterIcon; 

    if(props.disasterType == 'earthquake'){
        disasterIcon = <Activity size={20} color='white' strokeWidth={3} />
    }
    else if(props.disasterType == 'flood'){
        disasterIcon = <Waves size={20} color='white' strokeWidth={3} />
    }
    else if(props.disasterType == 'fire'){
        disasterIcon = <Flame size={20} color='white' strokeWidth={3} />
    }
    else if(props.disasterType == 'volcano'){
        disasterIcon = <Mountain size={20} color='white' strokeWidth={3} />
    }
    else if(props.disasterType == 'wind'){
        disasterIcon = <Wind size={20} color='white' strokeWidth={3} />
    }
    else if(props.disasterType == 'tornado'){
        disasterIcon = <Tornado size={20} color='white' strokeWidth={3} />
    }
    else if(props.disasterType == 'haze'){
        disasterIcon = <Haze size={20} color='white' strokeWidth={3} />
    }
    else{
        disasterIcon = <ShieldQuestion size={20} color='white' strokeWidth={3} />
    }
    
    return(
        <View style={styles.disasterIconContainer}>
            {disasterIcon}
        </View>
    )
}

const styles = StyleSheet.create({
    // container of the disaster icon 
    disasterIconContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#df3015c4',
        width: 30, 
        height: 30, 
        borderRadius: 15,
        zIndex: 15
    }
})