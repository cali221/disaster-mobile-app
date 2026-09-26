// to run: npm test -- PanicButton.test.js

import { PanicButtonScreen } from "../PanicButtonScreen";
import { render, screen, userEvent, act } from '@testing-library/react-native';
import { AuthContext } from '../../contexts/AuthContext';
import { LanguageContext } from '../../contexts/LanguageContext';

jest.useFakeTimers();

jest.mock('lucide-react-native', () => {
    return {
        BellRing: 'BellRing', 
        Bell: 'Bell'
    }
});

jest.mock('@supabase/supabase-js', () => {
    return {
        createClient: jest.fn()
    }
});

describe('Panic Button Screen', () => {
    beforeEach(async ()=>{
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: null}}>
                    <PanicButtonScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );
    });

    it('should show the button to sound SOS by default', async () => {
        expect(screen.getByRole('button', {name: 'panicButtonScreen.soundSOSAccLabel'})).toBeOnTheScreen();
    });

    it('should show the button to stop sounding SOS when sounding SOS', async () => {
        const user = userEvent.setup();
        await user.press(screen.getByRole('button', {name: 'panicButtonScreen.soundSOSAccLabel'}));
        await act(() => jest.runOnlyPendingTimers());

        await expect(screen.getByRole('button', {name: 'panicButtonScreen.stopSoundingSOSAccLabel'})).toBeOnTheScreen();
    });

    it('should show button to sound SOS when not sounding SOS', async () => {
        const user = userEvent.setup();

        // sound SOS
        await user.press(screen.getByRole('button', {name: 'panicButtonScreen.soundSOSAccLabel'}));
        await act(() => jest.runOnlyPendingTimers());

        // stop sounding
        await user.press(screen.getByRole('button', {name: 'panicButtonScreen.stopSoundingSOSAccLabel'}));
        await act(() => jest.runOnlyPendingTimers());

        // the button to sound SOS should be on the screen again
        await expect(screen.getByRole('button', {name: 'panicButtonScreen.soundSOSAccLabel'})).toBeOnTheScreen();
    });

    it('should show sound SOS button explanation text by default', async () => {
        expect(screen.getByText('panicButtonScreen.soundSOS')).toBeOnTheScreen();
    });

    it('should show the explanation text about stopping sounding SOS when sounding SOS', async () => {
        const user = userEvent.setup();
        await user.press(screen.getByRole('button', {name: 'panicButtonScreen.soundSOSAccLabel'}));
        await act(() => jest.runOnlyPendingTimers());

        await expect(screen.getByText('panicButtonScreen.stopSOS')).toBeOnTheScreen();
    });

    it('should show explanation text about sounding SOS when not sounding SOS', async () => {
        const user = userEvent.setup();

        // sound SOS
        await user.press(screen.getByRole('button', {name: 'panicButtonScreen.soundSOSAccLabel'}));
        await act(() => jest.runOnlyPendingTimers());

        // stop sounding
        await user.press(screen.getByRole('button', {name: 'panicButtonScreen.stopSoundingSOSAccLabel'}));
        await act(() => jest.runOnlyPendingTimers());

        // the explanation text to start sounding should be visible again
        await expect(screen.getByText('panicButtonScreen.soundSOS')).toBeOnTheScreen();
    });

    it('should show button to call 112', async () => {
        await expect(screen.getByRole('button', {name: 'panicButtonScreen.call12'})).toBeOnTheScreen();
    });

    it('should show button to send SMS to trusted contacts', async () => {
        await expect(screen.getByRole('button', {name: 'panicButtonScreen.sendSMS'})).toBeOnTheScreen();
    });
});