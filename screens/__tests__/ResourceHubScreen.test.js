// to run: npm test -- ResourceHubScreen.test.js
import { ResourceHubScreen } from '../ResourceHubScreen';
import { render, screen, userEvent, act } from '@testing-library/react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { LanguageContext } from '../../contexts/LanguageContext';

jest.useFakeTimers();

jest.mock('lucide-react-native', () => {
    return {
        Activity: 'Activity',
        Waves: 'Waves',
        Mountain: 'Mountain',
        WavesArrowUp: 'WavesArrowUp',
        SlashIcon: 'SlashIcon',
        Phone: 'Phone',
        Map: 'Map'
    }
});

jest.mock('@supabase/supabase-js', () => {
    return {
        createClient: jest.fn()
    }
});

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
        expect(screen.getByRole('button', {name: 'resourceHubScreen.goToEmergencyNumbersScreen'})).toBeOnTheScreen();
    });
});