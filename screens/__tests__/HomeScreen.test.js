// to run: npm test -- HomeScreen.test.js
import { render, screen, userEvent, act } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { AuthContext } from '../../contexts/AuthContext';
import { Navigation } from '../../App';

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
        Briefcase: 'Briefcase'
    }
});

// Notes: Couldn't figure out how to make splitting the tests with separate mocks work, 
// for now testing them with the same mock.
// jest.resetModules() caused useContext related error afterwards on the next test. 
// Alternatives such as jest.clearAllMocks() etc. did not reset screen correctly

// supabase mock with sample data
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
                eq: jest.fn().mockReturnThis(),
                rpc: jest.fn().mockImplementation((rpcName, rpcInput)=>{
                    console.log('param1: ' + rpcName);
                    console.log('param2: ' + JSON.stringify(rpcInput));                        

                    if(rpcName == 'get_homescreen_summary_of_disasters_for_user'){
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

describe('Home Screen', () => {
    const testUser = { id: 'some-user-id' };

    it('should show the right number of disaster summary item according to data', async () => {
        await render(
            <AuthContext value={{user: testUser}}>
                <HomeScreen/>
            </AuthContext>
        )

        const listItemShownArr = await screen.getAllByTestId('disaster-summary-item-container');
        expect(listItemShownArr.length).toBe(2);
    });

    it('should show the right number of disaster markers on map according to data', async() => {
       await render(
            <AuthContext value={{user: testUser}}>
                <HomeScreen/>
            </AuthContext>
        )

        const markersShownArr = await screen.getAllByTestId('marker-on-map');
        await expect(markersShownArr.length).toBe(2);
    });

    it('should navigate to disaster details screen when map marker is pressed', async() => {
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'Home Screen' }));
        
        await act(() => jest.runAllTimers());

        const markersOnMapArr = await screen.getAllByTestId('marker-on-map');

        console.log(markersOnMapArr[0])

        if(markersOnMapArr.length > 0){
            await user.press(markersOnMapArr[0]);
        
            await act(() => jest.runAllTimers());
            
            await expect(screen.getByRole('heading', 
                                        {name: 'screenTitles.disasterDetailsScreenTitle'}))
                            .toBeOnTheScreen();
        }
    });

    it('should navigate to disaster details screen when disaster details button is pressed', async() => {
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        await user.press(screen.getByRole('button', { name: 'Home Screen' }));
        
        await act(() => jest.runAllTimers());

        const disasterSummaryItemArr = await screen.getAllByRole('button', {name: 'homeScreen.goToDisastersDetailsScreenAccLbl'})

        if(disasterSummaryItemArr.length > 0){
            await user.press(disasterSummaryItemArr[0]);
        
            await act(() => jest.runAllTimers());
            
            await expect(screen.getByRole('heading', 
                                        {name: 'screenTitles.disasterDetailsScreenTitle'}))
                            .toBeOnTheScreen();
        }
    });
});
