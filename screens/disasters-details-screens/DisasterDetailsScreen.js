import { Text, View } from 'react-native';

export function DisasterDetailsScreen({route}) {
    return(
        <View>
            <Text>Disaster Details Screen Placeholder</Text>
            <Text>{route.params.disasterId}</Text>
        </View>
    )
}
