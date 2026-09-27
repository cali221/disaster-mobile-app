// to run: npm test -- NotificationScreen.test.js

import { render, screen, userEvent, act } from '@testing-library/react-native';
import { NotificationsScreen } from '../NotificationsScreen';
import { AuthContext } from '../../contexts/AuthContext';
import { LanguageContext } from '../../contexts/LanguageContext';
import { Navigation } from '../../App';
import { renderWithToasts } from '../../utils/render-with-toasts'; 
import { supabase } from '../../lib/supabase';
import { addFollow } from '../../utils/users-utilities';

// initial supabase mock
jest.mock('../../lib/supabase', () => {
    return {
        supabase: {
            schema: jest.fn().mockImplementation((schemaName) => {
                // mock fetching user's notifications
                if(schemaName == 'users'){
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
                                                            if(notifTypeToFetch == 'disaster_notification'){
                                                                return {
                                                                    data: [],
                                                                    error: null
                                                                }
                                                            }
                                                            else if(notifTypeToFetch== 'follow_notification'){
                                                                return {
                                                                    data: [],
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
                }
                // mock fetching required data for homescreen
                else if(schemaName == 'disasters_related_data'){
                    return{
                        from: jest.fn().mockImplementation(()=>{
                            return {
                                select: jest.fn().mockImplementation(()=>{
                                    return {
                                        gt: jest.fn().mockReturnValue({ 
                                            data: [], 
                                            error: null}),
                                    }
                                })
                            }
                        })
                    }
                }
                // mock rpc so they return empty data
                else if(schemaName == 'public'){
                    return{
                        rpc: jest.fn().mockImplementation(()=>{
                            return {
                                    data: null
                            }
                        }),
                    }
                }
            }),
            // mock supabase channel for homescreen
            channel: jest.fn().mockImplementation(()=>{
                return{
                    on: jest.fn().mockReturnThis(),
                    subscribe: jest.fn(),
                    unsubscribe: jest.fn()
                }
            }),
        }
    }
});

jest.useFakeTimers();

jest.mock('lucide-react-native', () => {
    return {
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
        // chevrons (for show/hide map toggles)
        ChevronUp: 'ChevronUp', 
        ChevronDown: 'ChevronDown',
    }
});

// supabase mock with sample data
// jest.mock('@supabase/supabase-js', () => {
//     return {
//         createClient: jest.fn().mockImplementation(() => {
//             return {
//                 schema: jest.fn().mockImplementation((schemaName) => {
//                     // mock fetching user's notifications
//                     if(schemaName == 'users'){
//                         return {
//                             from: jest.fn().mockImplementation(() => {
//                                 return {
//                                     select: jest.fn().mockImplementation(() => {
//                                         return {
//                                             eq: jest.fn().mockImplementation(() => {
//                                                 return {
//                                                     eq: jest.fn().mockImplementation((key, notifTypeToFetch) => {
//                                                         return {
//                                                             order: jest.fn().mockImplementation(() => {
//                                                                 if(notifTypeToFetch == 'disaster_notification'){
//                                                                     return {
//                                                                         data: [{body: 'this is as disaster notification body',
//                                                                                 associated_disaster_id: 'some-disaster-id',
//                                                                                 mentioned_user_user_id: null,
//                                                                                 created_at: new Date()}],
//                                                                         error: null
//                                                                     }
//                                                                 }
//                                                                 else if(notifTypeToFetch== 'follow_notification'){
//                                                                     return {
//                                                                         data: [{
//                                                                                     body: 'this is a follow notification body 1',
//                                                                                     associated_disaster_id: null,
//                                                                                     mentioned_user_user_id: 'some other user id',
//                                                                                     created_at: new Date(),
//                                                                                     users_are_now_mutuals: false
//                                                                                 },
//                                                                                 {
//                                                                                     body: 'this is a follow notification body 2',
//                                                                                     associated_disaster_id: null,
//                                                                                     mentioned_user_user_id: 'some other user id',
//                                                                                     created_at: new Date(),
//                                                                                     users_are_now_mutuals: true
//                                                                                 }],
//                                                                         error: null
//                                                                     }
//                                                                 }
//                                                                 else{
//                                                                     return {
//                                                                         data: null,
//                                                                         error: {
//                                                                             message: 'Unsupported category'
//                                                                         }
//                                                                     }
//                                                                 } 
//                                                             })
//                                                         }
//                                                     })
//                                                 }
//                                             })
//                                         }
//                                     })
//                                 }
//                             })
//                         }
//                     }
//                     // mock fetching required data for homescreen
//                     else if(schemaName == 'disasters_related_data'){
//                         return{
//                             from: jest.fn().mockImplementation(()=>{
//                                 return {
//                                     select: jest.fn().mockImplementation(()=>{
//                                         return {
//                                             gt: jest.fn().mockReturnValue({ 
//                                                 data: [], 
//                                                 error: null}),
//                                         }
//                                     })
//                                 }
//                             })
//                         }
//                     }
//                     // mock rpc so they return empty data
//                     else if(schemaName == 'public'){
//                         return{
//                             rpc: jest.fn().mockImplementation(()=>{
//                                 return {
//                                         data: null
//                                 }
//                             }),
//                         }
//                     }
//                 }),
//                 // mock supabase channel for homescreen
//                 channel: jest.fn().mockImplementation(()=>{
//                     return{
//                         on: jest.fn().mockReturnThis(),
//                         subscribe: jest.fn(),
//                         unsubscribe: jest.fn()
//                     }
//                 }),
//             }
//         }
//     )}
// });

jest.mock('../../utils/users-utilities', () => {
    return {
        addFollow: jest.fn()
    }
});

const testUser = { id: 'some-user-id' };

describe('Notification screen when fetching user notifications was successful', () => {
    beforeEach(async ()=>{
        supabase.schema.mockImplementation((schemaName)=>{
            // mock fetching user's notifications with test data
            if(schemaName == 'users'){
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
            }
            // mock fetching required data for homescreen
            else if(schemaName == 'disasters_related_data'){
                return{
                    from: jest.fn().mockImplementation(()=>{
                        return {
                            select: jest.fn().mockImplementation(()=>{
                                return {
                                    gt: jest.fn().mockReturnValue({ 
                                        data: [], 
                                        error: null}),
                                }
                            })
                        }
                    })
                }
            }
            // mock rpc so they return empty data
            else if(schemaName == 'public'){
                return{
                    rpc: jest.fn().mockImplementation(()=>{
                        return {
                                data: null
                        }
                    }),
                }
            }
        });

        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );
    });

    it('should show disaster notification category button', async () => {
        const disasterCategoryBtn = await screen.getByRole('button', 
                                                           {name: 'notifScreen.disastersCategoryBtn'});
        expect(disasterCategoryBtn).toBeVisible();
    });

    it('should show follow notification category button', async () => {
        const disasterCategoryBtn = await screen.getByRole('button', 
                                                           { name: 'notifScreen.newFollowersCategoryBtn'});
        expect(disasterCategoryBtn).toBeVisible();
    });

    it('should show initially show disaster notifications by default', async () => {
        const disasterNotifBody = await screen.getByText('this is as disaster notification body');

        expect(disasterNotifBody).toBeVisible();
    });

    it('should show initially show disaster details button on disaster notification', async () => {
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
        const user = userEvent.setup();

        // make sure followers category is picked
        const followersCategoryBtn = await screen.getByRole('button', { name: 'notifScreen.newFollowersCategoryBtn'})
        await user.press(followersCategoryBtn);
        await act(() => jest.runAllTimers());

        // expect its background color to be dusty pink
        expect(followersCategoryBtn).toHaveStyle({'backgroundColor': '#AB5C82'})
    });  

    it('should show show follow button on follow notification where the users are not yet mutual', async () => {
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

    it('should make the follow back button disappears after it is pressed and successful', async() => {
        const user = userEvent.setup();

        // make sure followers category is picked
        await user.press(screen.getByRole('button', { name: 'notifScreen.newFollowersCategoryBtn'}));
        await act(() => jest.runAllTimers());

        // get the folllow back button (there should be only 1)
        const followBtn = await screen.getByRole('button', 
                                                  { name: 'shared.followBack'});

        await user.press(followBtn);
        await act(() => jest.runAllTimers());

        await expect(followBtn).not.toBeOnTheScreen();
    });
});

describe('Notification screen toast checks when follow is successful', () => {
    beforeEach(async ()=>{
        supabase.schema.mockImplementation((schemaName)=>{
            // mock fetching user's notifications with test data
            if(schemaName == 'users'){
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
            }
            // mock fetching required data for homescreen
            else if(schemaName == 'disasters_related_data'){
                return{
                    from: jest.fn().mockImplementation(()=>{
                        return {
                            select: jest.fn().mockImplementation(()=>{
                                return {
                                    gt: jest.fn().mockReturnValue({ 
                                        data: [], 
                                        error: null}),
                                }
                            })
                        }
                    })
                }
            }
            // mock rpc so they return empty data
            else if(schemaName == 'public'){
                return{
                    rpc: jest.fn().mockImplementation(()=>{
                        return {
                                data: null
                        }
                    }),
                }
            }
        });

        await renderWithToasts(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );
    });

    it('should show success toast after follow back button is pressed and successful', async() => {
        const user = userEvent.setup();

        // make sure followers category is picked
        await user.press(screen.getByRole('button', { name: 'notifScreen.newFollowersCategoryBtn'}));
        await act(() => jest.runAllTimers());

        // get the folllow back button (there should be only 1)
        const followBtn = await screen.getByRole('button', 
                                                  { name: 'shared.followBack'});

        await user.press(followBtn);
        await act(() => jest.runAllTimers());
    
        // expect to see toast saying the follow was done
        const toast = await screen.getByTestId('toastAnimatedContainer');
        expect(toast).toContainElement(screen.getByText('shared.followed'));
    });
});

describe('Notification screen toast checks when follow is unsuccessful', () => {
    beforeEach(async ()=>{
        supabase.schema.mockImplementation((schemaName)=>{
            // mock fetching user's notifications with test data
            if(schemaName == 'users'){
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
            }
            // mock rpc so they return empty data
            else if(schemaName == 'public'){
                return{
                    rpc: jest.fn().mockImplementation(()=>{
                        return {
                                data: null
                        }
                    }),
                }
            }
        });

        addFollow.mockImplementation(()=>{
            throw new Error('There was an error when trying to follow')
        })

        await renderWithToasts(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );
    });

    it('should show error toast after follow back button is pressed and unsuccessful', async() => {
        const user = userEvent.setup();

        // make sure followers category is picked
        await user.press(screen.getByRole('button', { name: 'notifScreen.newFollowersCategoryBtn'}));
        await act(() => jest.runAllTimers());

        // get the folllow back button (there should be only 1)
        const followBtn = await screen.getByRole('button', 
                                                  { name: 'shared.followBack'});

        await user.press(followBtn);
        await act(() => jest.runAllTimers());
    
        // expect to see toast saying the follow was unsuccessful
        const toast = await screen.getByTestId('toastAnimatedContainer');
        expect(toast).toContainElement(screen.getByText('shared.failedToFollow'));
        expect(toast).toContainElement(screen.getByText('There was an error when trying to follow'));
    });
});

describe('Notification screen toast checks when follow back button is pressed when the other user was already followed', () => {
    beforeEach(async ()=>{
        supabase.schema.mockImplementation((schemaName)=>{
            // mock fetching user's notifications with test data
            if(schemaName == 'users'){
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
            }
            // mock rpc so they return empty data
            else if(schemaName == 'public'){
                return{
                    rpc: jest.fn().mockImplementation(()=>{
                        return {
                            data: null
                        }
                    }),
                }
            }
        });

        addFollow.mockImplementation(()=>{
            throw {
                code: 23505
            }
        })

        await renderWithToasts(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <NotificationsScreen />
                </AuthContext>
            </LanguageContext.Provider>
        );
    });

    it('should show error toast after follow back button is pressed and unsuccessful', async() => {
        const user = userEvent.setup();

        // make sure followers category is picked
        await user.press(screen.getByRole('button', { name: 'notifScreen.newFollowersCategoryBtn'}));
        await act(() => jest.runAllTimers());

        // get the folllow back button (there should be only 1)
        const followBtn = await screen.getByRole('button', 
                                                  { name: 'shared.followBack'});

        await user.press(followBtn);
        await act(() => jest.runAllTimers());
    
        // expect to see toast saying the follow was unsuccessful
        const toast = await screen.getByTestId('toastAnimatedContainer');
        expect(toast).toContainElement(screen.getByText('shared.alreadyFollowed'));
    });
});

describe('Notification Screen Navigation Checks', () => {
    beforeEach(async ()=>{
        supabase.schema.mockImplementation((schemaName)=>{
            // mock fetching user's notifications with test data
            if(schemaName == 'users'){
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
            }
            // mock fetching required data for homescreen
            else if(schemaName == 'disasters_related_data'){
                return{
                    from: jest.fn().mockImplementation(()=>{
                        return {
                            select: jest.fn().mockImplementation(()=>{
                                return {
                                    gt: jest.fn().mockReturnValue({ 
                                        data: [], 
                                        error: null}),
                                }
                            })
                        }
                    })
                }
            }
            // mock rpc so they return empty data
            else if(schemaName == 'public'){
                return{
                    rpc: jest.fn().mockImplementation(()=>{
                        return {
                                data: null
                        }
                    }),
                }
            }
        });

        await render(
            <LanguageContext.Provider value={{currentLang: 'en'}}>
                <AuthContext value={{user: testUser}}>
                    <Navigation />
                </AuthContext>
            </LanguageContext.Provider>
        );

        const user = userEvent.setup();

        // go to the notifications screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.notifications' }));
        await act(() => jest.runAllTimers());
    });

    it('should navigate to disaster details screen when the details button is pressed on a disaster notification', async () => {
        const user = userEvent.setup();
        
        // make sure disaster category is picked
        await user.press(screen.getByRole('button', { name: 'notifScreen.disastersCategoryBtn'}));
        await act(() => jest.runAllTimers());

        // press disaster details button on notification
        await user.press(await screen.getByRole('button', 
                                                { name: 'notifScreen.detailsBtnAccLbl'}));
        await act(() => jest.runAllTimers());

        // expect to be redirected to disaster details screen
        await expect(screen.getByRole('heading', 
                                      {name: 'screenTitles.disasterDetailsScreenTitle'}))
              .toBeOnTheScreen();
    });
});