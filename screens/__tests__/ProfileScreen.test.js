// to run: npm test -- ProfileScreen.test.js

import { render, screen, userEvent, act, waitFor } from '@testing-library/react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import { Navigation } from '../../App';
import { ProfileScreen } from '../ProfileScreen';

jest.useFakeTimers();

jest.mock('lucide-react-native', () => {
    return {
        // profile screen icons:
        ChevronRight: 'ChevronRight', 
        RotateCw: 'RotateCw',
        Trophy: 'Trophy',
        // bottom tab bar icons:
        House: 'House', 
        UserRound: 'UserRound', 
        Bell: 'Bell', 
        FileText: 'FileText', 
        Siren: 'Siren',
        // home screen icons:
        Phone: 'Phone', 
        MapIcon: 'MapIcon', 
        ShieldAlert: 'ShieldAlert', 
        BadgeQuestionMark: 'BadgeQuestionMark', 
        ScrollText: 'ScrollText', 
        Briefcase: 'Briefcase',
        // disaster legend icons (shown on map markers):
        Activity: 'Activity',
        Waves: 'Waves',
        Flame: 'Flame',
        Mountain: 'Mountain',
        Wind: 'Wind',
        Tornado: 'Tornado',
        Haze: 'Haze',
        ShieldQuestion: 'ShieldQuestion',
        // close icon (shown on modal):
        XCircle: 'XCircle',
        // chevrons (for show/hide toggles)
        ChevronUp: 'ChevronUp', 
        ChevronDown: 'ChevronDown',
    }
});

jest.mock('@supabase/supabase-js', () => {
    return {
        createClient: jest.fn().mockImplementation(() => {
        return {
            channel: jest.fn().mockImplementation(()=>{
                return{
                    on: jest.fn().mockReturnThis(),
                    subscribe: jest.fn(),
                    unsubscribe: jest.fn()
                }
            }),
            schema: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            rpc: jest.fn().mockReturnThis(),
            auth: {
                onAuthStateChange: jest.fn().mockReturnThis()
            },
        }
    })
}});

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
            "badgeDesc": "badge 1 desc",
            "badgeImgUrl": "some-url-1",
            "badgeDescIdn": "badge 1 desc idn"
        },
        {
            "name": "badge 2",
            "earned": false,
            "badgeId": "badge id 2",
            "badgeDesc": "badge 2 desc",
            "badgeImgUrl": "some-url-2",
            "badgeDescIdn": "badge 2 desc idn"
        },
        {
            "name": "badge 3",
            "earned": false,
            "badgeId": "badge id 3",
            "badgeDesc": "badge 3 desc",
            "badgeImgUrl": "some-url-3",
            "badgeDescIdn": "badge 1 desc idn"
        }
    ]
};

jest.mock('../../utils/users-utilities', () => {
    return {
        getLeaderboard: jest.fn().mockImplementation(()=>{
            return leaderboardTestData = [
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
            ];
        }),
        getTrustedContacts: jest.fn().mockImplementation(()=>{
            return [{user_id: testUserId, phone_num: '12345', contact_name: 'John Doe'}];
        })
    }
});

// Note: test everything using Navigation, to avoid needing to mock useNavigation(), etc
describe('Profile Screen', () => {
    beforeEach(async()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: {id: testUserId},
                                     userProfile: testUserProfile, 
                                     setLoggedInUser: jest.fn()}}>
                    <Navigation />
                </AuthContext>
            </LanguageContext.Provider>
        );
        
        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.profile' }));
        
        await act(() => jest.runAllTimers());
    });

    it('should show user avatar', async() => {
        await expect(screen.getByLabelText('Avatar')).toBeOnTheScreen();
    });

    it('should show 3 badge buttons in total (both earned and unearned)', async () => {
        const badgeBtns = await screen.getAllByLabelText('badgeScrollContainer.badgeBtnAccLabel');

        expect(badgeBtns.length).toBe(3);
    });

    it('should show earned badge image(s) as colored', async () => {    
        await expect(screen.getByTestId('badge-1-badge-img')).not.toHaveStyle({filter: 'grayscale(100%)'});
    });

    it('should show earned badge image(s) as greyscale', async () => {    
        await expect(screen.getByTestId('badge-2-badge-img')).toHaveStyle({filter: 'grayscale(100%)'});
        await expect(screen.getByTestId('badge-3-badge-img')).toHaveStyle({filter: 'grayscale(100%)'});
    });

    it('should show the modal to add trusted contact when the corresponding button is pressed', async () => {
        const user = userEvent.setup();

        // open badge 1
        await user.press(screen.getByTestId('badge-1-badge-btn'));
        await act(() => jest.runAllTimers());
        // expect to see the right badge
        await expect(screen.getByTestId('badge-details-modal-content-container')).toBeOnTheScreen();
        await expect(screen.getByTestId('badge-image-on-modal-badge-1')).toBeOnTheScreen();
        await expect(screen.getByText('badge 1 desc')).toBeOnTheScreen();
        // close modal
        await user.press(screen.getByRole('button', {name: 'shared.close'}));
        await act(() => jest.runAllTimers());

        // open badge 2
        await user.press(screen.getByTestId('badge-2-badge-btn'));
        await act(() => jest.runAllTimers());
        // expect to see the right badge
        await expect(screen.getByTestId('badge-details-modal-content-container')).toBeOnTheScreen();
        await expect(screen.getByTestId('badge-image-on-modal-badge-2')).toBeOnTheScreen();
        await expect(screen.getByText('badge 2 desc')).toBeOnTheScreen();
        // close modal
        await user.press(screen.getByRole('button', {name: 'shared.close'}));
        await act(() => jest.runAllTimers());

        // open badge 3
        await user.press(screen.getByTestId('badge-3-badge-btn'));
        await act(() => jest.runAllTimers());
        // expect to see the right badge
        await expect(screen.getByTestId('badge-details-modal-content-container')).toBeOnTheScreen();
        await expect(screen.getByTestId('badge-image-on-modal-badge-3')).toBeOnTheScreen();
        await expect(screen.getByText('badge 3 desc')).toBeOnTheScreen();
        // close modal
        await user.press(screen.getByRole('button', {name: 'shared.close'}));
        await act(() => jest.runAllTimers()); 
    });

    it('should show the leaderboard data correctly on leaderboard', async () => {
        const leaderboard = await screen.getByTestId('leaderboard-list');

        // it should show the test leaderboard data usernames
        await expect(leaderboard).toContainElement(screen.getByTestId('user-link-someusername'));
        await expect(leaderboard).toContainElement(screen.getByTestId('user-link-another-user'));

        // it should show the test leaderboard data total xp
        await expect(leaderboard).toContainElement(screen.getByTestId('someusername-xp-text'));
        await expect(leaderboard).toContainElement(screen.getByTestId('another-user-xp-text'));

        /* it should place trophy in the container for user 
           with the most xp (in this case @someusername) */
        const someusernameLeaderboardItemContainer = await screen.getByTestId('someusername-leaderboard-item-container');
        await expect(someusernameLeaderboardItemContainer).toContainElement(screen.getByTestId('leaderboard-trophy'));

        // it should show (You) for the authenticated user's username link
        await expect(someusernameLeaderboardItemContainer).toContainElement(screen.getByText('@someusername (shared.you)'));
    });
});

describe('Profile Screen Navigation Checks', () => {
    beforeEach(async()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: {id: testUserId},
                                     userProfile: testUserProfile, 
                                     setLoggedInUser: jest.fn()}}>
                    <Navigation />
                </AuthContext>
            </LanguageContext.Provider>
        );
        
        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.profile' }));
        
        await act(() => jest.runAllTimers());
    });
    
    it('should navigate to the account settings screen when the account settings button is pressed', async () => {
        const user = userEvent.setup();

        // press account settings button
        await user.press(screen.getByRole('button', {name: 'profileScreen.accountSettingsBtnTxt'}));
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.accountSettingsScreenTitle'})).toBeOnTheScreen();
    });

     it('should navigate to followers screen when the followers button is pressed', async () => {
        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'shared.goToFollowersScreen' }));
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'shared.followers'})).toBeOnTheScreen();
    });

    it('should navigate to following screen when the following button is pressed', async () => {
        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'shared.goToFollowingScreen' }));
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'shared.following'})).toBeOnTheScreen();
    });
});