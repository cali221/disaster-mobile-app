// // to run: npm test -- FlashcardsScreen.test.js

jest.useFakeTimers();

jest.mock('lucide-react-native', () => {
    return {}
});

const testUser = {id: 'some-uid'};

import { supabase } from '../../../lib/supabase';

// initial supabase mock
jest.mock('../../../lib/supabase', ()=>{
    return {
        supabase: {
            schema: jest.fn().mockImplementation((schemaName)=>{
                if(schemaName == 'public'){
                    return{
                        from: jest.fn().mockReturnThis(),
                        order: jest.fn().mockReturnThis(),
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        rpc: jest.fn().mockImplementation((rpcName, rpcInput)=>{
                            if(rpcName == 'get_homescreen_summary_of_disasters_for_user'){
                                return {
                                    data: [{ 
                                                disaster_type: 'hurricane', 
                                                dist_in_m_from_disaster: 1000, 
                                                adm2_name: 'Jakarta Pusat', 
                                                adm1_name: 'DKI Jakarta', 
                                                disaster_datetime: new Date ,
                                                disaster_id: 'someid'
                                            },
                                            { 
                                                disaster_type: 'flood', 
                                                dist_in_m_from_disaster: 20, 
                                                adm2_name: 'Denpasar', 
                                                adm1_name: 'Bali', 
                                                disaster_datetime: new Date(new Date - (24 * 60 * 60 * 1000)) ,
                                                disaster_id: 'someid2'
                                            }],
                                    error: null
                                }
                            }
                            else if(rpcName == 'get_flashcards_to_review_for_auth_user'){
                                return {
                                    data: [
                                        {
                                            flashcard_id: 1,
                                            front: 'front 1',
                                            back: 'back 1',
                                            front_idn: 'front idn 1',
                                            back_idn: 'back_idn 1',
                                            card_repetition: 1,
                                            card_interval: 1,
                                            card_ease_factor: 2.5,
                                            due_at: new Date() - (5 * 1000),
                                            reference: [
                                                {
                                                    "index": 1,
                                                    "italic_text": null,
                                                    "text_part_1": "some reference text 1",
                                                    "text_part_2": null
                                                }
                                            ]
                                        },
                                        {
                                            flashcard_id: 2,
                                            front: 'front 2',
                                            back: 'back 2',
                                            front_idn: 'front idn 2',
                                            back_idn: 'back_idn 2',
                                            card_repetition: 2,
                                            card_interval: 6,
                                            card_ease_factor: 3.0,
                                            due_at: new Date() - (3 * 1000),
                                            reference: [
                                                {
                                                    "index": 1,
                                                    "italic_text": null,
                                                    "text_part_1": "some reference text 2",
                                                    "text_part_2": null
                                                }
                                            ]
                                        },
                                    ],
                                    error: null
                                }
                            }
                            else if(rpcName == 'increment_auth_user_flashcard_review_times'){
                                return {
                                    error: null
                                }
                            }
                            else{
                                return {
                                    data: []
                                }
                            }
                        }),
                    }
                }
                else if(schemaName == 'disasters_related_data'){
                    return{
                        from: jest.fn().mockReturnThis(),
                        select: jest.fn().mockReturnThis(),
                        gt: jest.fn().mockReturnValue({ data: [{
                                                                    disaster_longitude: 10, 
                                                                    disaster_latitude: 10, 
                                                                    disaster_type: 'earthquake'
                                                                },
                                                                {
                                                                    disaster_longitude: 5, 
                                                                    disaster_latitude: 5, 
                                                                    disaster_type: 'flood'
                                                                }], 
                                                        error: null}),
                    }
                }
                else if(schemaName == 'users'){
                    return {
                        from: jest.fn().mockImplementation(()=>{
                            return {
                                upsert: jest.fn().mockImplementation(()=>{
                                    return {
                                        error: null
                                    }
                                })
                            }
                        })
                    }
                }
            }),
            channel: jest.fn().mockImplementation(()=>{
                return{
                    on: jest.fn().mockReturnThis(),
                    subscribe: jest.fn(),
                    unsubscribe: jest.fn()
                }
            }),
            auth: {
                onAuthStateChange: jest.fn().mockReturnThis()
            },
        }
    }
});

jest.useFakeTimers();

// mock used icons
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
        // mute/unmute icons
        VolumeOff: 'VolumeOff', 
        Volume2: 'Volume2'
    }
});

import { render, screen, userEvent, act } from '@testing-library/react-native';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { renderWithToasts } from '../../../utils/render-with-toasts';
import { Navigation } from '../../../App';

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
    user_badges: []
};

describe('Flashcards Screen', ()=>{
    describe('Flashcards screen when fetching flashcards to review was successful and updating card after each review is successful', () => {
        beforeEach(async()=>{
            await renderWithToasts(
                <LanguageContext.Provider value={{currentLang: 'en'}}>
                    <AuthContext value={{user: testUser, fetchAndSetProfileData: jest.fn(), userProfile: testUserProfile}}>
                        <Navigation />
                    </AuthContext>
                </LanguageContext.Provider>
            );

            const user = userEvent.setup();

            // go to the flashcards screen
            await user.press(screen.getByRole('button', { name: 'homeScreen.flashcardsBtnAccLbl' }));
            await act(() => jest.runAllTimers());
        });

        it('should show the content of the front of first flashcard to review by default', async()=>{
            // the front text
            await expect(screen.getByText('front 1')).toBeOnTheScreen();
        });

        it('should show the button to show answer', async () => {
            await expect(screen.getByRole('button', {name: 'flashcardScreen.showAnswer'})).toBeOnTheScreen();
        });

        it('should show the flashcard back content when the show answer button is pressed', async () => {
            const user = userEvent.setup();
            await user.press(screen.getByRole('button', {name: 'flashcardScreen.showAnswer'}));
            await act(() => jest.runAllTimers());

            await expect(screen.getByText('back 1')).toBeOnTheScreen();
            await expect(screen.getByText('[1]')).toBeOnTheScreen();
            await expect(screen.getByText('some reference text 1')).toBeOnTheScreen();
        });

        it('should show the all recall ease option buttons when the show answer button is pressed', async () => {
            const user = userEvent.setup();
            await user.press(screen.getByRole('button', {name: 'flashcardScreen.showAnswer'}));
            await act(() => jest.runAllTimers());

            await expect(screen.getByRole('button', {name: '0'})).toBeOnTheScreen();
            await expect(screen.getByRole('button', {name: '1'})).toBeOnTheScreen();
            await expect(screen.getByRole('button', {name: '2'})).toBeOnTheScreen();
            await expect(screen.getByRole('button', {name: '3'})).toBeOnTheScreen();
            await expect(screen.getByRole('button', {name: '4'})).toBeOnTheScreen();
            await expect(screen.getByRole('button', {name: '5'})).toBeOnTheScreen();
        });

        it('should show the second/next flashcard front after the a recall ease button is pressed', async() => {
            const user = userEvent.setup();
            await user.press(screen.getByRole('button', {name: 'flashcardScreen.showAnswer'}));
            await act(() => jest.runAllTimers());
            await user.press(screen.getByRole('button', {name: '1'}));
            await act(() => jest.runAllTimers());

            await expect(screen.getByText('front 2')).toBeOnTheScreen();
        });
    });
    describe('Flashcards screen when fetching flashcards to review was unsuccessful', ()=>{
        beforeEach(async ()=>{
            supabase.schema.mockImplementation((schemaName)=>{
                if(schemaName == 'public'){
                    return{
                        from: jest.fn().mockReturnThis(),
                        order: jest.fn().mockReturnThis(),
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        rpc: jest.fn().mockImplementation((rpcName, rpcInput)=>{
                            if(rpcName == 'get_homescreen_summary_of_disasters_for_user'){
                                return {
                                    data: [{ 
                                                disaster_type: 'hurricane', 
                                                dist_in_m_from_disaster: 1000, 
                                                adm2_name: 'Jakarta Pusat', 
                                                adm1_name: 'DKI Jakarta', 
                                                disaster_datetime: new Date ,
                                                disaster_id: 'someid'
                                            },
                                            { 
                                                disaster_type: 'flood', 
                                                dist_in_m_from_disaster: 20, 
                                                adm2_name: 'Denpasar', 
                                                adm1_name: 'Bali', 
                                                disaster_datetime: new Date(new Date - (24 * 60 * 60 * 1000)) ,
                                                disaster_id: 'someid2'
                                            }],
                                    error: null
                                }
                            }
                            else if(rpcName == 'get_flashcards_to_review_for_auth_user'){
                                return {
                                    data: null,
                                    error: {
                                        message: 'Failed to fetch flashcards'
                                    }
                                }
                            }
                            else if(rpcName == 'increment_auth_user_flashcard_review_times'){
                                return {
                                    error: null
                                }
                            }
                            else{
                                return {
                                    data: []
                                }
                            }
                        }),
                    }
                }
                else if(schemaName == 'disasters_related_data'){
                    return{
                        from: jest.fn().mockReturnThis(),
                        select: jest.fn().mockReturnThis(),
                        gt: jest.fn().mockReturnValue({ data: [{
                                                                    disaster_longitude: 10, 
                                                                    disaster_latitude: 10, 
                                                                    disaster_type: 'earthquake'
                                                                },
                                                                {
                                                                    disaster_longitude: 5, 
                                                                    disaster_latitude: 5, 
                                                                    disaster_type: 'flood'
                                                                }], 
                                                        error: null}),
                    }
                }
                else if(schemaName == 'users'){
                    return {
                        from: jest.fn().mockImplementation(()=>{
                            return {
                                upsert: jest.fn().mockImplementation(()=>{
                                    return {
                                        error: null
                                    }
                                })
                            }
                        })
                    }
                }
            });

            await renderWithToasts(
                <LanguageContext.Provider value={{currentLang: 'en'}}>
                    <AuthContext value={{user: testUser, fetchAndSetProfileData: jest.fn(), userProfile: testUserProfile}}>
                        <Navigation />
                    </AuthContext>
                </LanguageContext.Provider>
            );

            const user = userEvent.setup();

            // go to the flashcards screen
            await user.press(screen.getByRole('button', { name: 'homeScreen.flashcardsBtnAccLbl' }));
            await act(() => jest.runAllTimers());
        });

        it('should show error toast if fetching flashcards was unsuccessful', async () => {
            await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('flashcardsScreen.failedToFetchFlashcardsAndProfileData'));
            await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('Failed to fetch flashcards'));
        });
    });
});