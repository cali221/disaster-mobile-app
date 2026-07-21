import { render, screen, userEvent, act } from '@testing-library/react-native'
import { Navigation } from '../App';
import { AuthContext } from '../contexts/AuthContext';

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
        RotateCw: 'RotateCw'
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
            <AuthContext.Provider value={{user: testUser}}>
                <Navigation />
            </AuthContext.Provider>
        )

        expect(screen.getByRole('heading', {name: 'Home'})).toBeOnTheScreen();
    });

    it('shows home screen when user is not null and user navigated to home screen', async()=>{
        await render(
            <AuthContext.Provider value={{user: testUser}}>
                <Navigation />
            </AuthContext.Provider>
        )

        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'Home Screen' }));
        
        await act(() => jest.runAllTimers());

        expect(screen.getByRole('heading', {name: 'Home'})).toBeOnTheScreen();
    });

    it('shows resource hub screen when user is not null and user navigated to resource hub', async()=>{
        await render(
            <AuthContext.Provider value={{user: testUser}}>
                <Navigation />
            </AuthContext.Provider>
        )

        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'Resource Hub Screen' }));
        
        await act(() => jest.runAllTimers());

        expect(screen.getByRole('heading', {name: 'Resource Hub'})).toBeOnTheScreen();
    });

    it('shows panic button screen when user is not null and user navigated to panic button', async()=>{
        await render(
            <AuthContext.Provider value={{user: testUser}}>
                <Navigation />
            </AuthContext.Provider>
        )

        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'Panic Button Screen' }));
        
        await act(() => jest.runAllTimers());

        expect(screen.getByRole('heading', {name: 'Panic Button'})).toBeOnTheScreen();
    });

    it('shows notifications screen when user is not null and user navigated to notifications screen', async()=>{
        await render(
            <AuthContext.Provider value={{user: testUser}}>
                <Navigation />
            </AuthContext.Provider>
        )

        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'Notifications Screen' }));
        
        await act(() => jest.runAllTimers());

        expect(screen.getByRole('heading', {name: 'Notifications'})).toBeOnTheScreen();
    });

    it('shows notifications screen when user is not null and user navigated to notifications screen', async()=>{
        await render(
            <AuthContext.Provider value={{user: testUser}}>
                <Navigation />
            </AuthContext.Provider>
        )

        const user = userEvent.setup();
        
        await user.press(screen.getByRole('button', { name: 'Profile Screen' }));
        
        await act(() => jest.runAllTimers());

        expect(screen.getByRole('heading', {name: 'Profile'})).toBeOnTheScreen();
    });
});

// test navigation behaviors when user is null (logged out)
describe('Navigation when logged out', ()=>{
    it('shows sign in screen when user is null and has not navigated', async ()=>{
        await render(
            <AuthContext.Provider value={{user: null}}>
                <Navigation />
            </AuthContext.Provider>
        );
        
        expect(screen.getByRole('heading', {name: 'authWords.signIn'})).toBeOnTheScreen();
    });

    it('shows sign in screen when user is null and navigated to homescreen', async ()=>{
        await render(
            <AuthContext.Provider value={{user: null}}>
                <Navigation />
            </AuthContext.Provider>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'Home Screen' }));
        
        await act(() => jest.runAllTimers());
        
        expect(screen.getByRole('heading', {name: 'authWords.signIn'})).toBeOnTheScreen();
    });

    it('shows resource hub screen when user is null and navigated to resource hub screen', async ()=>{
        await render(
            <AuthContext.Provider value={{user: null}}>
                <Navigation />
            </AuthContext.Provider>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'Resource Hub Screen' }));
        
        await act(() => jest.runAllTimers());
        
        expect(screen.getByRole('heading', {name: 'Resource Hub'})).toBeOnTheScreen();
    });

    it('shows panic button screen when user is null and navigated to panic button screen', async ()=>{
        await render(
            <AuthContext.Provider value={{user: null}}>
                <Navigation />
            </AuthContext.Provider>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'Panic Button Screen' }));
        
        await act(() => jest.runAllTimers());
        
        expect(screen.getByRole('heading', {name: 'Panic Button'})).toBeOnTheScreen();
    });

    it('shows sign in screen when user is null and navigated to notifiations screen', async ()=>{
        await render(
            <AuthContext.Provider value={{user: null}}>
                <Navigation />
            </AuthContext.Provider>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'Notifications Screen' }));
        
        await act(() => jest.runAllTimers());
        
        expect(screen.getByRole('heading', {name: 'authWords.signIn'})).toBeOnTheScreen();
    });

    it('shows sign in screen when user is null and navigated to profile screen', async ()=>{
        await render(
            <AuthContext.Provider value={{user: null}}>
                <Navigation />
            </AuthContext.Provider>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'Profile Screen' }));
        
        await act(() => jest.runAllTimers());
        
        expect(screen.getByRole('heading', {name: 'authWords.signIn'})).toBeOnTheScreen();
    });
});