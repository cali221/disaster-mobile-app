import { Text, View, StyleSheet, Image } from 'react-native';

export function LevelXpOverviewSection(props) {
    return(
       <View style={styles.levelXpOverviewSection}>
            {/* league/level image */}
            <Image source={{uri: props?.levelImgUrl}} style={styles.levelImg} />

            {/* text container */}
            <View style={styles.levelXpOverviewTextContainer}>
                {/* user level/league name */}
                <Text style={styles.levelNameTxt}>
                    {props?.levelName}
                </Text>

                {/* user XP */}
                <Text style={styles.totalXpTxt}>
                    Total XP: {props?.xp}
                </Text>
            </View>
       </View>
    )
};

const styles = StyleSheet.create({
    // section container for XP and level overview
    levelXpOverviewSection: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        columnGap: 50,
        borderRadius: 20,
        width: '100%',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderColor: 'grey',
        borderWidth: 1,
        elevation: 2,
        backgroundColor: 'white'
    },
    // the level/league image
    levelImg: {
        width: 100,
        height: 100,
        resizeMode: 'cover'
    },
    // container of texts in the level and XP overview section
    levelXpOverviewTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 20,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    // the text showing the level/league name
    levelNameTxt: {
        fontSize: 17,
        fontWeight: '600',
        color: '#2D3782'
    },
    // the text showing total XP
    totalXpTxt: {
        fontSize: 15,
        color: '#2D3782'
    }
});