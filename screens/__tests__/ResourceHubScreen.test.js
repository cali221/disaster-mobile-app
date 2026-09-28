// to run: npm test -- ResourceHubScreen.test.js
import { ResourceHubScreen } from '../ResourceHubScreen';
import { render, screen, userEvent, act } from '@testing-library/react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import { Navigation } from '../../App';

jest.useFakeTimers();

jest.mock('lucide-react-native', () => {
    return {
        // resource hub screen icons
        Activity: 'Activity',
        Waves: 'Waves',
        Mountain: 'Mountain',
        WavesArrowUp: 'WavesArrowUp',
        SlashIcon: 'SlashIcon',
        Phone: 'Phone',
        Map: 'Map',
        // curling arrow on notification screen
        RotateCw: 'RotateCW',
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
        // disaster legend icons (shown on map markers) that's not already included:
        Flame: 'Flame',
        Wind: 'Wind',
        Tornado: 'Tornado',
        Haze: 'Haze',
        ShieldQuestion: 'ShieldQuestion',
        // close icon (shown on modal):
        XCircle: 'XCircle',
        // chevrons (for show/hide map toggles)
        ChevronUp: 'ChevronUp', 
        ChevronDown: 'ChevronDown',
        // icons on disaster guide template
        ArrowBigUp: 'ArrowBigUp'
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

describe('Resource Hub Screen', () => {
    beforeEach(async () => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: null}}>
                    <ResourceHubScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );
    });

    it('should show emergency number button', async() => {
        await expect(screen.getByRole('button', {name: 'resourceHubScreen.goToEmergencyNumbersScreen'})).toBeOnTheScreen();
    });

    it('should show useful location button', async() => {
        await expect(screen.getByRole('button', {name: 'resourceHubScreen.goToUsefulLocationScreen'})).toBeOnTheScreen();
    });

    it('should show earthquake guide button', async() => {
        await expect(screen.getByRole('button', {name: 'resourceHubScreen.goToEarthquakeGuideScreen'})).toBeOnTheScreen();
    });

    it('should show tsunami guide button', async() => {
        await expect(screen.getByRole('button', {name: 'resourceHubScreen.goToTsunamiGuideScreen'})).toBeOnTheScreen();
    });

    it('should show flood guide button', async() => {
        await expect(screen.getByRole('button', {name: 'resourceHubScreen.goToFloodGuideScreen'})).toBeOnTheScreen();
    });

    it('should show landslide guide button', async() => {
        await expect(screen.getByRole('button', {name: 'resourceHubScreen.goToLandslideGuideScreen'})).toBeOnTheScreen();
    });

    it('should show volcanic erupation guide button', async() => {
        await expect(screen.getByRole('button', {name: 'resourceHubScreen.goToVolcanicEruptionGuideScreen'})).toBeOnTheScreen();
    });

    it('should show 7 menu buttons', async() => {
        const menuButtons = await screen.getAllByRole('button');
        await expect(menuButtons.length).toBe(7);
    });
});

describe('Resource Hub Screen Navigation Checks', () => {
    beforeEach(async ()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: null}}>
                    <Navigation />
                </AuthContext>
            </LanguageContext.Provider>
        );

        // go to resource hub screen
        const user = userEvent.setup();
    
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.resourceHub' }));
        
        await act(() => jest.runAllTimers());
    });

    it('should navigate to the emergency numbers screen when the corresponding button is pressed', async () => {
        const user = userEvent.setup();
    
        await user.press(screen.getByRole('button', { name: 'resourceHubScreen.goToEmergencyNumbersScreen' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.emergencyNumbersScreenTitle'})).toBeOnTheScreen();
    });

    it('should navigate to the useful location screen when the corresponding button is pressed', async () => {
        const user = userEvent.setup();
    
        await user.press(screen.getByRole('button', { name: 'resourceHubScreen.goToUsefulLocationScreen' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.usefulLocationScreenTitle'})).toBeOnTheScreen();
    });

    it('should navigate to the earthquake guide screen when the corresponding button is pressed', async () => {
        const user = userEvent.setup();
    
        await user.press(screen.getByRole('button', { name: 'resourceHubScreen.goToEarthquakeGuideScreen' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.earthquakeGuideScreenTitle'})).toBeOnTheScreen();
    });

    it('should navigate to the tsunami guide screen when the corresponding button is pressed', async () => {
        const user = userEvent.setup();
    
        await user.press(screen.getByRole('button', { name: 'resourceHubScreen.goToTsunamiGuideScreen' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.tsunamiGuideScreenTitle'})).toBeOnTheScreen();
    });

    it('should navigate to the flood guide screen when the corresponding button is pressed', async () => {
        const user = userEvent.setup();
    
        await user.press(screen.getByRole('button', { name: 'resourceHubScreen.goToFloodGuideScreen' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.floodGuideScreenTitle'})).toBeOnTheScreen();
    });

    it('should navigate to the landslide guide screen when the corresponding button is pressed', async () => {
        const user = userEvent.setup();
    
        await user.press(screen.getByRole('button', { name: 'resourceHubScreen.goToLandslideGuideScreen' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.landslideGuideScreenTitle'})).toBeOnTheScreen();
    });

    it('should navigate to the volcanic eruption guide screen when the corresponding button is pressed', async () => {
        const user = userEvent.setup();
    
        await user.press(screen.getByRole('button', { name: 'resourceHubScreen.goToVolcanicEruptionGuideScreen' }));
        
        await act(() => jest.runAllTimers());

        await expect(screen.getByRole('heading', {name: 'screenTitles.volcanicEruptionsGuideScreenTitle'})).toBeOnTheScreen();
    });
});