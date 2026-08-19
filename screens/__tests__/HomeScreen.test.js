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
        XCircle: 'XCircle'
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
                    else{
                        return {
                            data: []
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

const setLoggedInUser = jest.fn();
const fetchAndSetProfileData = jest.fn();

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

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // get markers
        const markersOnMapArr = await screen.getAllByTestId('marker-on-map');

        // if marker exists, press on one (the first one in array)
        if(markersOnMapArr.length > 0){
            await user.press(markersOnMapArr[0]);
            await act(() => jest.runAllTimers());
            
            // expect to be redirected to disaster details screen
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

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // get details button
        const disasterSummaryItemArr = await screen.getAllByRole('button', {name: 'homeScreen.goToDisastersDetailsScreenAccLbl'})

        // if button exists, try to press on one (the first one in array)
        if(disasterSummaryItemArr.length > 0){
            await user.press(disasterSummaryItemArr[0]);
            await act(() => jest.runAllTimers());
            
            // expect to be redirected to the disaster details screen
            await expect(screen.getByRole('heading', 
                                        {name: 'screenTitles.disasterDetailsScreenTitle'}))
                            .toBeOnTheScreen();
        }
    });

    it('should navigate to create report screen when create report button is pressed', async() => {
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // get create report button
        const createReportBtn = await screen.getByRole('button', {name: 'homeScreen.experiencedDisasterBtnTxt'})

        // if button exists, press it
        if(createReportBtn){
            await user.press(createReportBtn);
            await act(() => jest.runAllTimers());
            
            // expect to be redirected to the disaster details screen
            await expect(screen.getByRole('heading', 
                                        {name: 'screenTitles.createReportScreenTitle'}))
                            .toBeOnTheScreen();
        }
    });

    it('should navigate to emergency numbers screen when the corresponding button is pressed', async() => {
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // get the emergency numbers button
        const emergencyNumsBtn = await screen.getByRole('button', {name: 'homeScreen.emergencyNumberBtnAccLbl'})

        // if button exists, press it
        if(emergencyNumsBtn){
            await user.press(emergencyNumsBtn);
            await act(() => jest.runAllTimers());
            
            // expect to be redirected to the emergency numbers screen
            await expect(screen.getByRole('heading', 
                                        {name: 'screenTitles.emergencyNumbersScreenTitle'}))
                            .toBeOnTheScreen();
        }
    });

    it('should navigate to useful locations screen when the corresponding button is pressed', async() => {
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // get the useful locations button
        const usefulLocBtn = await screen.getByRole('button', {name: 'homeScreen.usefulLocBtnAccLbl'})

        // if button exists, press it
        if(usefulLocBtn){
            await user.press(usefulLocBtn);
            await act(() => jest.runAllTimers());
            
            // expect to be redirected to the useful locations screen
            await expect(screen.getByRole('heading', 
                                        {name: 'screenTitles.usefulLocationScreenTitle'}))
                            .toBeOnTheScreen();
        }
    });

    it('should navigate to quizzes screen when the corresponding button is pressed', async() => {
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // get the quizzes button
        const quizzesBtn = await screen.getByRole('button', {name: 'homeScreen.quizzesBtnAccLbl'})

        // if button exists, press it
        if(quizzesBtn){
            await user.press(quizzesBtn);
            await act(() => jest.runAllTimers());
            
            // expect to be redirected to the quizzes screen
            await expect(screen.getByRole('heading', 
                                          {name: 'screenTitles.quizzesScreenTitle'}))
                            .toBeOnTheScreen();
        }
    });    

    it('should navigate to flashcards screen when the corresponding button is pressed', async() => {
        await render(
            <AuthContext value={{user: testUser, setLoggedInUser: jest.fn(), fetchAndSetProfileData: jest.fn()}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // get the flashcards button
        const flashcardsBtn = await screen.getByRole('button', {name: 'homeScreen.flashcardsBtnAccLbl'})

        // if button exists, press it
        if(flashcardsBtn){
            await user.press(flashcardsBtn);
            await act(() => jest.runAllTimers());
            
            // expect to be redirected to the flashcards screen
            await expect(screen.getByRole('heading', 
                                          {name: 'Flashcards'}))
                            .toBeOnTheScreen();
        }
    });    

    it('should navigate to emergency bag screen when the corresponding button is pressed', async() => {
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // get the emergency bag button
        const emergencyBagBtn = await screen.getByRole('button', {name: 'homeScreen.emergencyBagBtnAccLbl'})

        // if button exists, press it
        if(emergencyBagBtn){
            await user.press(emergencyBagBtn);
            await act(() => jest.runAllTimers());
            
            // expect to be redirected to the emergency bag screen
            await expect(screen.getByRole('heading', 
                                          {name: 'screenTitles.emergencyBagScreenTitle'}))
                            .toBeOnTheScreen();
        }
    });    

    it('should navigate to resource hub screen when the resouce hub link is pressed', async() => {
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // get the resource hub link
        const resourceHubLink = await screen.getByRole('link', {name: 'Resource Hub'})

        // if link exists, press it
        if(resourceHubLink){
            await user.press(resourceHubLink);
            await act(() => jest.runAllTimers());
            
            // expect to be redirected to the resource hub screen
            await expect(screen.getByRole('heading', 
                                          {name: 'Resource Hub'}))
                        .toBeOnTheScreen();
        }
    });
    
    it('should show disaster types menu modal when evacuation steps button is pressed', async() => {
        await render(
            <AuthContext value={{user: testUser}}>
                <HomeScreen />
            </AuthContext>
        );

        const user = userEvent.setup();

        // press evacuation steps button (in the quick access section)
        await user.press(screen.getByRole('button', { name: 'homeScreen.evacuationStepsBtnAccLbl' }));
        await act(() => jest.runAllTimers());

        // expect modal title to be visible
        await expect(screen.getByText('homeScreen.pickDisasterModalTitle')).toBeVisible();

    });

    it('should navigate to the earthquake guide screen if the flood button is pressed on disaster types menu modal', async()=>{
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // press evacuation steps button to show menu modal
        await user.press(screen.getByRole('button', { name: 'homeScreen.evacuationStepsBtnAccLbl' }));
        await act(() => jest.runAllTimers());

        // press earthquake option button
        await user.press(screen.getByRole('button', { name: 'homeScreen.earthquakeBtnAccLbl' }));
        await act(() => jest.runAllTimers());
        
        // expect to be redirected to the earthquake guide screen
        await expect(screen.getByRole('heading', 
                                      {name: 'screenTitles.earthquakeGuideScreenTitle'}))
                    .toBeOnTheScreen();
        
    });

    it('should navigate to the tsunami guide screen if the tsunami button is pressed on disaster types menu modal', async()=>{
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // press evacuation steps button to show menu modal
        await user.press(screen.getByRole('button', { name: 'homeScreen.evacuationStepsBtnAccLbl' }));
        await act(() => jest.runAllTimers());

        // press tsunami option button
        await user.press(screen.getByRole('button', { name: 'homeScreen.tsunamiBtnAccLbl' }));
        await act(() => jest.runAllTimers());
        
        // expect to be redirected to the tsunami guide screen
        await expect(screen.getByRole('heading', 
                                      {name: 'screenTitles.tsunamiGuideScreenTitle'}))
                    .toBeOnTheScreen();
        
    });

    it('should navigate to the flood guide screen if the flood button is pressed on disaster types menu modal', async()=>{
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // press evacuation steps button to show menu modal
        await user.press(screen.getByRole('button', { name: 'homeScreen.evacuationStepsBtnAccLbl' }));
        await act(() => jest.runAllTimers());

        // press flood option button
        await user.press(screen.getByRole('button', { name: 'homeScreen.floodBtnAccLbl' }));
        await act(() => jest.runAllTimers());
        
        // expect to be redirected to the flood guide screen
        await expect(screen.getByRole('heading', 
                                      {name: 'screenTitles.floodGuideScreenTitle'}))
                    .toBeOnTheScreen();
        
    });

    it('should navigate to the landslide guide screen if the landslide button is pressed on disaster types menu modal', async()=>{
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // press evacuation steps button to show menu modal
        await user.press(screen.getByRole('button', { name: 'homeScreen.evacuationStepsBtnAccLbl' }));
        await act(() => jest.runAllTimers());

        // press landslide option button
        await user.press(screen.getByRole('button', { name: 'homeScreen.landslideBtnAccLbl' }));
        await act(() => jest.runAllTimers());
        
        // expect to be redirected to the landslide guide screen
        await expect(screen.getByRole('heading', 
                                      {name: 'screenTitles.landslideGuideScreenTitle'}))
                    .toBeOnTheScreen();
        
    });

    it('should navigate to the volcanic eruption guide screen if the volcanic eruption button is pressed on disaster types menu modal', async()=>{
        await render(
            <AuthContext value={{user: testUser}}>
                <Navigation />
            </AuthContext>
        );

        const user = userEvent.setup();

        // navigate to home screen first to be sure it's on home screen
        await user.press(screen.getByRole('button', { name: 'tabBarLabels.home' }));
        await act(() => jest.runAllTimers());

        // press evacuation steps button to show menu modal
        await user.press(screen.getByRole('button', { name: 'homeScreen.evacuationStepsBtnAccLbl' }));
        await act(() => jest.runAllTimers());

        // press volcanic eruption option button
        await user.press(screen.getByRole('button', { name: 'homeScreen.volcanicEruptionBtnAccLbl' }));
        await act(() => jest.runAllTimers());
        
        // expect to be redirected to the landslide guide screen
        await expect(screen.getByRole('heading', 
                                      {name: 'screenTitles.volcanicEruptionsGuideScreenTitle'}))
                    .toBeOnTheScreen();
        
    });
});