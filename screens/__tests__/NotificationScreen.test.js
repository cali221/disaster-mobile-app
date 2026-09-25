import { render, screen, userEvent, act } from '@testing-library/react-native';
import { NotificationsScreen } from '../NotificationsScreen';
import { AuthContext } from '../../contexts/AuthContext';
import { LanguageContext } from '../../contexts/LanguageContext';


jest.useFakeTimers();

jest.mock('lucide-react-native', () => {
    return {
        RotateCw: 'RotateCW'
    }
});

// supabase mock with sample data
jest.mock('@supabase/supabase-js', () => {
    return {
        createClient: jest.fn().mockImplementation(() => {
            return {
                schema: jest.fn().mockImplementation(() => {
                    return {
                        from: jest.fn().mockImplementation(() => {
                            return {
                                select: jest.fn().mockImplementation(() => {
                                    return {
                                        eq: jest.fn().mockImplementation(() => {
                                            return {
                                                eq: jest.fn().mockImplementation((key, notifTypeToFetch) => {
                                                    return {
                                                        order: jest.fn().mockImplementation(() => {
                                                            console.log('Notification type: ' + notifTypeToFetch);
                                                            if(notifTypeToFetch == 'disaster_notification'){
                                                                return {
                                                                    data: [{body: 'this is as disaster notification body',
                                                                            associated_disaster_id: 'some-disaster-id',
                                                                            mentioned_user_user_id: null,
                                                                            created_at: new Date()}],
                                                                    error: null
                                                                }
                                                            }
                                                            else if(notifTypeToFetch== 'follow_notification'){
                                                                return {
                                                                    data: [{
                                                                                body: 'this is a follow notification body 1',
                                                                                associated_disaster_id: null,
                                                                                mentioned_user_user_id: 'some other user id',
                                                                                created_at: new Date(),
                                                                                users_are_now_mutuals: false
                                                                            },
                                                                            {
                                                                                body: 'this is a follow notification body 2',
                                                                                associated_disaster_id: null,
                                                                                mentioned_user_user_id: 'some other user id',
                                                                                created_at: new Date(),
                                                                                users_are_now_mutuals: true
                                                                            }],
                                                                    error: null
                                                                }
                                                            }
                                                            else{
                                                                return {
                                                                    data: null,
                                                                    error: {
                                                                        message: 'Unsupported category'
                                                                    }
                                                                }
                                                            } 
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    )}
});

describe('Notification Screen', () => {
    const testUser = { id: 'some-user-id' };

    it('should show disaster notification category button', async () => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );

        const disasterCategoryBtn = await screen.getByRole('button', 
                                                           {name: 'notifScreen.disastersCategoryBtn'});
        expect(disasterCategoryBtn).toBeVisible();
    });

    it('should show follow notification category button', async () => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );

        const disasterCategoryBtn = await screen.getByRole('button', 
                                                           { name: 'notifScreen.newFollowersCategoryBtn'});
        expect(disasterCategoryBtn).toBeVisible();
    });

    it('should show initially show disaster notifications by default', async () => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );

        const disasterNotifBody = await screen.getByText('this is as disaster notification body');

        expect(disasterNotifBody).toBeVisible();
    });

    it('should show initially show disaster details button on disaster notification', async () => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        // make sure disaster category is picked
        await user.press(screen.getByRole('button', { name: 'notifScreen.disastersCategoryBtn'}));
        await act(() => jest.runAllTimers());

        // get the details button
        const disasterDetailsBtn = await screen.getByRole('button', 
                                                           { name: 'notifScreen.detailsBtnAccLbl'});

        // it should be visible
        expect(disasterDetailsBtn ).toBeVisible();
    });

    it('should show the disaster category button as pink when it is picked', async () => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        // make sure disaster category is picked
        const disasterCategoryBtn = await screen.getByRole('button', { name: 'notifScreen.disastersCategoryBtn'})
        await user.press(disasterCategoryBtn);
        await act(() => jest.runAllTimers());

        // fetch it again
        await screen.getByRole('button', { name: 'notifScreen.disastersCategoryBtn'})

        // expect its background color to be dusty pink
        expect(disasterCategoryBtn).toHaveStyle({'backgroundColor': '#AB5C82'})
    });  

    it('should show follow notification when the category is picked', async () => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        // make sure followers category is picked
        await user.press(screen.getByRole('button', { name: 'notifScreen.newFollowersCategoryBtn'}));
        await act(() => jest.runAllTimers());

        // get the follow notification body 1
        const followNotficationBody1 = await screen.getByText('this is a follow notification body 1');

        // it should be visible
        expect(followNotficationBody1).toBeVisible();

        // get the follow notification body 2
        const followNotficationBody2 = await screen.getByText('this is a follow notification body 2');

        // it should be visible
        expect(followNotficationBody2).toBeVisible();
    });

    it('should show the followers category button as pink when it is picked', async () => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        // make sure followers category is picked
        const followersCategoryBtn = await screen.getByRole('button', { name: 'notifScreen.newFollowersCategoryBtn'})
        await user.press(followersCategoryBtn);
        await act(() => jest.runAllTimers());

        // expect its background color to be dusty pink
        expect(followersCategoryBtn).toHaveStyle({'backgroundColor': '#AB5C82'})
    });  

    it('should show show follow button on follow notification where the users are not yet mutual', async () => {
        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        // make sure followers category is picked
        await user.press(screen.getByRole('button', { name: 'notifScreen.newFollowersCategoryBtn'}));
        await act(() => jest.runAllTimers());

        // get the folllow back button
        const followBtns = await screen.getAllByRole('button', 
                                                     { name: 'shared.followBack'});

        // only one should be present (since out of the 2 follow notifications, only one should have it)
        expect(followBtns.length).toBe(1)
    });
});