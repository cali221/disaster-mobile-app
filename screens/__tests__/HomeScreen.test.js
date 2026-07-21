// npm test -- HomeScreen.test.js
import { render, screen, userEvent, act } from '@testing-library/react-native';

// mock used icons
jest.mock('lucide-react-native', () => {
    return {
        Phone: 'Phone', 
        MapIcon: 'MapIcon', 
        ShieldAlert: 'ShieldAlert', 
        BadgeQuestionMark: 'BadgeQuestionMark', 
        ScrollText: 'ScrollText', 
        Briefcase: 'Briefcase'
    }
});

describe('Home Screen', () => {
    const testUser = { id: 'some-user-id' };
    
    it('should run test', async () => {
        // test specific supabase mock with sample data
        jest.doMock('@supabase/supabase-js', () => {
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
                        gt: jest.fn().mockReturnValue({ data: [{
                                                                disaster_longitude: 10, 
                                                                disaster_latitude: 10, 
                                                                disaster_type: 'earthquake'
                                                             }], 
                                                        error: null}),
                        eq: jest.fn().mockReturnThis(),
                        rpc: jest.fn().mockImplementation((rpcName, rpcInput)=>{
                            console.log('param1: ' + rpcName);
                            console.log('param2: ' + JSON.stringify(rpcInput));                        

                            if(rpcName == 'get_homescreen_summary_of_disasters_for_user' && rpcInput['user_id_input'] == testUser.id){
                                return {
                                    data: [{ 
                                             disaster_type: 'hurricane', 
                                             dist_in_m_from_disaster: 1000, 
                                             adm2_name: 'Jakarta Pusat', 
                                             adm1_name: 'DKI Jakarta', 
                                             disaster_datetime: new Date 
                                            },
                                            { 
                                             disaster_type: 'flood', 
                                             dist_in_m_from_disaster: 20, 
                                             adm2_name: 'Denpasar', 
                                             adm1_name: 'Bali', 
                                             disaster_datetime: new Date(new Date - (24 * 60 * 60 * 1000)) 
                                            }],
                                    error: null
                                }
                            }
                        }),
                        auth: {
                            onAuthStateChange: jest.fn().mockReturnThis()
                        },
                    }
                })
            }
        });
        
        const { HomeScreen } = require('../HomeScreen');
        const { AuthContext } = require('../../contexts/AuthContext')

        await render(
            <AuthContext.Provider value={{user: testUser}}>
                <HomeScreen/>
            </AuthContext.Provider>
        )

        expect(screen.getByRole('heading', {name: 'THIS SHOULD CAUSE AN ERROR'})).toBeOnTheScreen();

        jest.resetModules();
    })
});