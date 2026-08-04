import { View, StyleSheet, Image } from 'react-native';

export function UserProfilePicture(props) { 
   return(
        <View style={[styles.avatarContainer, {width: props.width, 
                                               height: props.height, 
                                               backgroundColor: props.bgColor,
                                               borderRadius: props.pfpBorderRadius ? props.pfpBorderRadius: props.width/2}]}>
            <Image source={{uri: props.imgUrl}} 
                   style={[styles.avatarImg, {borderRadius: props.pfpBorderRadius ? props.pfpBorderRadius: props.width/2}]} />
        </View>
    )
}

const styles = StyleSheet.create({
    // the background behind the avatar
    avatarContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        elevation: 2
    },
    // the avatar image
    avatarImg: {
        width: '100%', 
        height: '100%'
    }
});