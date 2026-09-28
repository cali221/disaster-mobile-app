import { Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

export function BadgesHorizontalScrollContainer(props) {
    const { t, i18n } = useTranslation();
    
    return(
        <ScrollView style={styles.badgesScrollView}
                    horizontal={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={styles.badgesScrollViewContentContainer}>
            { props?.badgesArr ? (
                    (props?.badgesArr?.map((item, index) => {
                        return(
                            // badge item container with badge image and name
                            <TouchableOpacity key={index} 
                                              accessibilityRole='button'
                                              style={styles.badgeItemContainer}
                                              onPress={()=>{props?.handleBadgePress(item)}}
                                              accessibilityLabel={t('badgeScrollContainer.badgeBtnAccLabel')}
                                              testID={`${(item.name).toLowerCase().replace(' ', '-')}-badge-btn`}>
                                {/* the badge image, grayscale if unearned */}
                                <Image source={{uri: item.badgeImgUrl}} 
                                       style={[styles.badgeImg, 
                                       item.earned == false && {filter: 'grayscale(100%)'}]}
                                       alt={item.name}
                                       testID={`${(item.name).toLowerCase().replace(' ', '-')}-badge-img`}/>
                                {/* the badge name */}
                                <Text style={styles.badgeNameTxt}>{item.name}</Text>
                            </TouchableOpacity>
                        )
                    }))
                )
                :
                (
                    <Text>
                        {t('badgesHoriScrollComponent.unavailableBadgesData')}
                    </Text>
                )
            }
        </ScrollView>   
    )
};

const styles = StyleSheet.create({
    // the container of the badges scroll view content
    badgesScrollViewContentContainer: {
        display: 'flex',
        flexDirection: 'row',
        columnGap: 20
    },
    // scroll view for showing badges
    badgesScrollView: {
        marginTop: 15,
        width: '100%'
    },
    // container of each badge item
    badgeItemContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // the badge image
    badgeImg: {
        flex: 1,
        width: 110,
        height: 110,
        resizeMode: 'cover'
    }
});