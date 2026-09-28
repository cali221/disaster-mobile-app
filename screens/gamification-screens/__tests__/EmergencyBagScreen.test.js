// // to run: npm test -- EmergencyBagScreen.test.js

jest.useFakeTimers();

jest.mock('lucide-react-native', () => {
    return {
        Check: 'Check'
    }
});

const testUser = {id: 'some-uid'};

import { supabase } from '../../../lib/supabase';

// initial supabase mock
jest.mock('../../../lib/supabase', ()=>{
    return {
        supabase: {
            schema: jest.fn()
        }
    }
});

import { EmergencyBagScreen } from '../EmergencyBagScreen'; 
import { render, screen, userEvent, act } from '@testing-library/react-native';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { renderWithToasts } from '../../../utils/render-with-toasts';

// test emergency bag items data
const testData = [{item_id: 1, item_name: 'item 1', item_name_idn: 'item 1 idn', is_checked: true},
                  {item_id: 2, item_name: 'item 2', item_name_idn: 'item 2 idn', is_checked: false},
                  {item_id: 3, item_name: 'item 3', item_name_idn: 'item 3 idn', is_checked: false}];

describe('Emergency Bag Screen', ()=>{
    describe('Emergency bag screen when items were failed to be fetched', () => {
        beforeEach(async()=>{
            // update mock to show error
            supabase.schema.mockImplementation(()=>{
                return{
                    rpc: jest.fn().mockImplementation((rpcName)=>{
                        if(rpcName == 'get_auth_user_emergency_bag_data'){
                            return {
                                data: null,
                                error: {
                                    message: 'Some error message'
                                }
                            }
                        }
                    })
                }
            });

            // render screen
            await renderWithToasts(
                <LanguageContext.Provider value={{currentLang: 'en'}}>
                    <AuthContext value={{user: testUser}}>
                        <EmergencyBagScreen />
                    </AuthContext>
                </LanguageContext.Provider>
            );
        });

        it('should show error toast if emergency bag items were not successfully fetched', async() => {
            await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('emergencyBagScreen.failedToFecthEmergencyBagData'));
            await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('Some error message'));
        });
    });

    describe('Emergency bag screen when items were successfully fetched', () => {
        beforeEach(async ()=>{
            // update mock to use test data
            supabase.schema.mockImplementation(()=>{
                return{
                    rpc: jest.fn().mockImplementation((rpcName)=>{
                        if(rpcName == 'get_auth_user_emergency_bag_data'){
                            return {
                                data: testData,
                                error: null
                            }
                        }
                    })
                }
            });

            // render screen
            await renderWithToasts(
                <LanguageContext.Provider value={{currentLang: 'en'}}>
                    <AuthContext value={{user: testUser}}>
                        <EmergencyBagScreen />
                    </AuthContext>
                </LanguageContext.Provider>
            );
        });
        
        it('should show each item once according to test data', async ()=>{
            await expect(screen.getAllByTestId('item-1-container').length).toBe(1);
            await expect(screen.getAllByTestId('item-2-container').length).toBe(1);
            await expect(screen.getAllByTestId('item-3-container').length).toBe(1);
        });

        it('should show the right number of ticked and unticked checkboxes according to test data', async () => {
            await expect(screen.getAllByRole('button', {name: 'emergencyBagScreen.tickCheckboxAccLabel'}).length).toBe(2);
            await expect(screen.getAllByRole('button', {name: 'emergencyBagScreen.untickCheckboxAccLabel'}).length).toBe(1);
        });
    });

    describe('Emergency bag screen when ticking and unticking is successful', () => {
        beforeEach(async ()=>{
            // update mock to use test data
            supabase.schema.mockImplementation(()=>{
                return{
                    rpc: jest.fn().mockImplementation((rpcName)=>{
                        if(rpcName == 'get_auth_user_emergency_bag_data'){
                            return {
                                data: testData,
                                error: null
                            }
                        }
                    }),
                    from: jest.fn().mockImplementation(()=>{
                        return{
                            delete: jest.fn().mockImplementation(()=>{
                                return{
                                    eq: jest.fn().mockImplementation(()=>{
                                        return{
                                            eq: jest.fn().mockImplementation(()=>{
                                                return {
                                                    data: null,
                                                    error: null
                                                }
                                            })
                                        }
                                    })
                                }
                            }),
                            insert: jest.fn().mockImplementation(()=>{
                                return {
                                    data: null,
                                    error: null
                                }
                            }),
                        }
                    })
                }
            });

            // render screen
            await renderWithToasts(
                <LanguageContext.Provider value={{currentLang: 'en'}}>
                    <AuthContext value={{user: testUser}}>
                        <EmergencyBagScreen />
                    </AuthContext>
                </LanguageContext.Provider>
            );
        });

        it('should show the right number of ticked and unticked checkboxes when one item is ticked', async () => {
            const user = userEvent.setup();
            await user.press(screen.getAllByRole('button', { name: 'emergencyBagScreen.tickCheckboxAccLabel'})[0]);
            await act(() => jest.runAllTimers());

            await expect(screen.getAllByRole('button', {name: 'emergencyBagScreen.tickCheckboxAccLabel'}).length).toBe(1);
            await expect(screen.getAllByRole('button', {name: 'emergencyBagScreen.untickCheckboxAccLabel'}).length).toBe(2);
        });

        it('should show the right number of ticked and unticked chekcboxes when one item is unticked', async () => {
            const user = userEvent.setup();
            await user.press(screen.getAllByRole('button', { name: 'emergencyBagScreen.untickCheckboxAccLabel'})[0]);
            await act(() => jest.runAllTimers());

            await expect(screen.getAllByRole('button', {name: 'emergencyBagScreen.tickCheckboxAccLabel'}).length).toBe(3);
        })
    });

    describe('Emergency bag screen when ticking and unticking is unsuccessful', () => {
        beforeEach(async ()=>{
            // update mock to use test data
            supabase.schema.mockImplementation(()=>{
                return{
                    rpc: jest.fn().mockImplementation((rpcName)=>{
                        if(rpcName == 'get_auth_user_emergency_bag_data'){
                            return {
                                data: testData,
                                error: null
                            }
                        }
                    }),
                    from: jest.fn().mockImplementation(()=>{
                        return{
                            delete: jest.fn().mockImplementation(()=>{
                                return{
                                    eq: jest.fn().mockImplementation(()=>{
                                        return{
                                            eq: jest.fn().mockImplementation(()=>{
                                                return {
                                                    data: null,
                                                    error: {
                                                        message: 'some error message due to failed delete'
                                                    }
                                                }
                                            })
                                        }
                                    })
                                }
                            }),
                            insert: jest.fn().mockImplementation(()=>{
                                return {
                                    data: null,
                                    error: {
                                        message: 'some error message due to failed insert'
                                    }
                                }
                            }),
                        }
                    })
                }
            });

            // render screen
            await renderWithToasts(
                <LanguageContext.Provider value={{currentLang: 'en'}}>
                    <AuthContext value={{user: testUser}}>
                        <EmergencyBagScreen />
                    </AuthContext>
                </LanguageContext.Provider>
            );
        });

        it('should show the right number of ticked and unticked checkboxes when one item is ticked and unsuccessful', async () => {
            const user = userEvent.setup();
            await user.press(screen.getAllByRole('button', { name: 'emergencyBagScreen.tickCheckboxAccLabel'})[0]);
            await act(() => jest.runAllTimers());

            await expect(screen.getAllByRole('button', {name: 'emergencyBagScreen.tickCheckboxAccLabel'}).length).toBe(2);
            await expect(screen.getAllByRole('button', {name: 'emergencyBagScreen.untickCheckboxAccLabel'}).length).toBe(1);
        });

        it('should show the right number of ticked and unticked chekcboxes when one item is unticked', async () => {
            const user = userEvent.setup();
            await user.press(screen.getAllByRole('button', { name: 'emergencyBagScreen.untickCheckboxAccLabel'})[0]);
            await act(() => jest.runAllTimers());

            await expect(screen.getAllByRole('button', {name: 'emergencyBagScreen.tickCheckboxAccLabel'}).length).toBe(2);
            await expect(screen.getAllByRole('button', {name: 'emergencyBagScreen.untickCheckboxAccLabel'}).length).toBe(1);
        });

        it('should show error toast when ticking is unsuccessful', async ()=>{
            const user = userEvent.setup();
            await user.press(screen.getAllByRole('button', { name: 'emergencyBagScreen.tickCheckboxAccLabel'})[0]);
            await act(() => jest.runAllTimers());

            await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('emergencyBagScreen.failedToAddEmergencyBagItem'));
            await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('some error message due to failed insert'));
        });

        it('should show error toast when unticking is unsuccessful', async ()=>{
            const user = userEvent.setup();
            await user.press(screen.getAllByRole('button', { name: 'emergencyBagScreen.untickCheckboxAccLabel'})[0]);
            await act(() => jest.runAllTimers());
            
            await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('emergencyBagScreen.failedToRemoveEmergencyBagItem'));
            await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('some error message due to failed delete'));
        });
    });
});