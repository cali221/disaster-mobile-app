import { Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';

export function DisasterDetailsScreen() {
    const route = useRoute();

    return(
        <View>
            <Text>Disaster Details Screen Placeholder</Text>
            <Text>{route.params.disasterId}</Text>
        </View>
    )
}
