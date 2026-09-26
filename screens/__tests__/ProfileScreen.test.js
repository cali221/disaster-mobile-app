// to run: npm test -- ProfileScreen.test.js

import { ProfileScreen } from '../ProfileScreen';
import { render, screen, userEvent, act } from '@testing-library/react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { LanguageContext } from '../../contexts/LanguageContext';

jest.useFakeTimers();

jest.mock('lucide-react-native', () => {
    return {
        ChevronRight: 'ChevronRight', 
        RotateCw: 'RotateCw',
        Trophy: 'Trophy'
    }
});

jest.mock('@supabase/supabase-js', () => {
    return {
        createClient: jest.fn()
    }
});

jest.mock('@react-navigation/native', () => {
    return {
        useIsFocused: jest.fn().mockImplementation(()=>{return true}),
        useNavigation: jest.fn()
    }
});

const testUserId = 'some-uid';

const testUserProfile = {
    username: 'someusername',
    xp: 300,
    avatar_img_url: 'avatar-img-url',
    level_name: 'Beginner',
    level_img_url: 'level-img-url',
    next_level_min_xp: 500,
    current_level_min_xp: 0,
    next_level_name: 'Novice',
    following_count: 2,
    followers_count: 2,
    user_badges: [
        {
            "name": "badge 1",
            "earned": true,
            "badgeId": "badge id 1",
            "badgeDesc": "Lorem ipsum",
            "badgeImgUrl": "some-url",
            "badgeDescIdn": "Lorem ipsum"
        },
        {
            "name": "badge 2",
            "earned": false,
            "badgeId": "badge id 2",
            "badgeDesc": "Lorem ipsum",
            "badgeImgUrl": "some-url",
            "badgeDescIdn": "Lorem ipsum"
        },
        {
            "name": "badge 3",
            "earned": false,
            "badgeId": "badge id 3",
            "badgeDesc": "Lorem ipsum",
            "badgeImgUrl": "some-url",
            "badgeDescIdn": "Lorem ipsum"
        }
    ]
};

jest.mock('../../utils/users-utilities', () => {
    return {
        getLeaderboard: jest.fn().mockImplementation(()=>{
            return [
                {
                    user_id: testUserId,
                    username: testUserProfile.username,
                    xp: testUserProfile.xp
                },
                {
                    user_id: 'another-uid',
                    username: 'another-user',
                    xp: 200
                }
            ]
        }),
        getTrustedContacts: jest.fn().mockImplementation(()=>{
            return [{user_id: testUserId, phone_num: '12345', contact_name: 'John Doe'}]
        })
    }
})

describe('Profile Screen', () => {
    it('should show user avatar', async() => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUserId, 
                                     userProfile: testUserProfile, 
                                     setLoggedInUser: jest.fn()}}>
                    <ProfileScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );

        await expect(screen.getByTestId('user-avatar')).toBeOnTheScreen();
    });

    it('should show the username of the authenticated user at the top and in leaderboard', async () => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUserId, 
                                     userProfile: testUserProfile, 
                                     setLoggedInUser: jest.fn()}}>
                    <ProfileScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );

        await expect(screen.getAllByText(`@${testUserProfile.username}`).length).toBe(2);
    });
});