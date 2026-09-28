/**
 * Tests for bottom tab navigator.
 * Tests for navigation through interactions on specific screens,
 * are on the test files of the screens.
 * 
 * To run: npm test -- BottomTabNavigation.test.js
 */

import { render, screen, userEvent, act } from '@testing-library/react-native';
import { Navigation } from '../App';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';

jest.useFakeTimers();

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

jest.mock('lucide-react-native', () => {
    return {
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
        // notification screen icons:
        RotateCw: 'RotateCw',
        ArrowBigUp: 'ArrowBigUp',
        // resouce hub extra icons that aren't already included
        Map: 'Map',
        SlashIcon: 'SlashIcon',
        WavesArrowUp: 'WavesArrowUp',
        Activity: 'Activity',
        Waves: 'Waves',
        Mountain: 'Mountain',
        // mute/unmute icons
        VolumeOff: 'VolumeOff', 
        Volume2: 'Volume2',
        // chevrons (for show/hide toggles)
        ChevronUp: 'ChevronUp', 
        ChevronDown: 'ChevronDown',
    }
});

// test navigation behaviors when user is not null (logged in)
describe('Navigation when logged in', ()=>{
    const testUser = {
        id: 'some-user-id',
        user_metadata:{
            username: 'some-username'
        }
    };

    it('shows home screen when user is not null and user has not navigated', async()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: testUser}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        )

        await expect(screen.getByRole('heading', {name: 'screenTitles.home'})).toBeOnTheScreen();
    });

    it('shows home screen when user is not null and user navigated to home screen', async()=>{
        await render(
             <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: testUser}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        )

        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.home'})).toBeOnTheScreen();
    });

    it('shows resource hub screen when user is not null and user navigated to resource hub', async()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: testUser}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        )

        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.resourceHub' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'Resource Hub'})).toBeOnTheScreen();
    });

    it('shows panic button screen when user is not null and user navigated to panic button', async()=>{
        await render(
             <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: testUser}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        )

        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'Panic Button (Tombol Panik)'}));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'Panic Button'})).toBeOnTheScreen();
    });

    it('shows notifications screen when user is not null and user navigated to notifications screen', async()=>{
        await render(
             <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: testUser}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        )

        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.notifications' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.notifications'})).toBeOnTheScreen();
    });

    it('shows notifications screen when user is not null and user navigated to profile screen', async()=>{
        await render(
             <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: testUser, setLoggedInUser: jest.fn(), fetchAndSetProfileData: jest.fn()}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        )

        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.profile' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.profile'})).toBeOnTheScreen();
    });
});

// test navigation behaviors when user is null (logged out)
describe('Navigation when logged out', ()=>{
    it('shows sign in screen when user is null and has not navigated', async ()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: null}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        );
        
        await expect(screen.getByRole('heading', {name: 'authWords.signIn'})).toBeOnTheScreen();
    });

    it('shows sign in screen when user is null and navigated to homescreen', async ()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: null}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        
        await act(() => jest.runAllTimers());
        
        await expect(screen.getByRole('heading', {name: 'authWords.signIn'})).toBeOnTheScreen();
    });

    it('shows resource hub screen when user is null and navigated to resource hub screen', async ()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: null}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'tabBarLabels.resourceHub' }));
        
        await act(() => jest.runAllTimers());
        
        await expect(screen.getByRole('heading', {name: 'Resource Hub'})).toBeOnTheScreen();
    });

    it('shows panic button screen when user is null and navigated to panic button screen', async ()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: null}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'Panic Button (Tombol Panik)' }));
        
        await act(() => jest.runAllTimers());
        
        await expect(screen.getByRole('heading', {name: 'Panic Button'})).toBeOnTheScreen();
    });

    it('shows sign in screen when user is null and navigated to notifiations screen', async ()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: null, setLoggedInUser: jest.fn(), fetchAndSetProfileData: jest.fn()}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'tabBarLabels.notifications' }));
        
        await act(() => jest.runAllTimers());
        
        await expect(screen.getByRole('heading', {name: 'authWords.signIn'})).toBeOnTheScreen();
    });

    it('shows sign in screen when user is null and navigated to profile screen', async ()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext.Provider value={{user: null}}>
                    <Navigation />
                </AuthContext.Provider>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'tabBarLabels.profile' }));
        
        await act(() => jest.runAllTimers());
        
        await expect(screen.getByRole('heading', {name: 'authWords.signIn'})).toBeOnTheScreen();
    });
});