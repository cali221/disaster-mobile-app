// // to run: npm test -- QuizzesScreen.test.js

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
            schema: jest.fn()
        }
    }
});

import { QuizzesScreen } from '../QuizzesScreen'; 
import { render, screen, userEvent, act } from '@testing-library/react-native';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { renderWithToasts } from '../../../utils/render-with-toasts';

const categoryTestData = [
    {category_id: 1, category_name_idn: 'category 1 idn', category_name: 'category 1'},
    {category_id: 2, category_name_idn: 'category 2 idn', category_name: 'category 2'}
];

const testQAndAData = [
    {
        question_text: 'Q1', 
        question_text_idn: 'Q1 idn', 
        quiz_answers: [{answer_text: 'Q1 A1', answer_text_idn: 'Q1 A1 idn', is_correct_ans: false}, 
                  {answer_text: 'Q1 A2', answer_text_idn: 'Q1 A2 idn', is_correct_ans: true}]
    },
    {
        question_text: 'Q2', 
        question_text_idn: 'Q2 idn', 
        quiz_answers: [{answer_text: 'Q2 A1', answer_text_idn: 'Q2 A1 idn', is_correct_ans: false}, 
                  {answer_text: 'Q2 A2', answer_text_idn: 'Q2 A2 idn', is_correct_ans: true}]
    }
]

describe('Quizzes Screen', ()=>{
    describe('Quizzes screen when fetching category failed', () => {
        beforeEach(async()=>{
            // update mock to show error
            supabase.schema.mockImplementation((tableName)=>{
                return{
                    from: jest.fn().mockImplementation((tableName)=>{
                        if(tableName == 'quiz_categories'){
                            return {
                                select: jest.fn().mockImplementation(()=>{ 
                                  throw new Error('Some error message due to failing to fetch categories')
                                })
                            }
                        }
                    })
                }
            });

            // render screen
            await renderWithToasts(
                <LanguageContext.Provider value={{currentLang: 'en'}}>
                    <AuthContext value={{user: testUser}}>
                        <QuizzesScreen />
                    </AuthContext>
                </LanguageContext.Provider>
            );
        });

        it('should show error toast if emergency bag items were not successfully fetched', async() => {
            await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('quizScreen.failedToFetchCategories'));
            await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('Some error message due to failing to fetch categories'));
        });
    });

    describe('Quizzes screen when fetching category was successful', () => {
        describe('When fetching question and answer data was successful', () => {
            beforeEach(async ()=>{
                    // update mock with test data
                    supabase.schema.mockImplementation((tableName)=>{
                        return{
                            from: jest.fn().mockImplementation((tableName)=>{
                                if(tableName == 'quiz_categories'){
                                    return {
                                        select: jest.fn().mockImplementation(()=>{ 
                                        return{
                                            data: categoryTestData,
                                            error: null
                                        }
                                        })
                                    }
                                }
                                else if(tableName == 'quiz_questions'){
                                    return {
                                        select: jest.fn().mockImplementation(()=>{ 
                                        return{
                                            eq: jest.fn().mockImplementation(()=>{
                                                return {
                                                    data: testQAndAData,
                                                    error: null
                                                }
                                            })
                                        }
                                        })
                                    }
                                }
                            })
                        }
                    });

                    // render screen
                    await renderWithToasts(
                        <LanguageContext.Provider value={{currentLang: 'en'}}>
                            <AuthContext value={{user: testUser}}>
                                <QuizzesScreen />
                            </AuthContext>
                        </LanguageContext.Provider>
                    );
                    
                    // press a category button
                    const user = userEvent.setup();
                    await user.press(screen.getByRole('button', { name: 'category 1'}));
                    await act(() => jest.runAllTimers());
                });
         

                it('should show the first question and answers after a category button is pressed', async() => {    
                    // expect first question to be shown
                    await expect(screen.getByText('Q1')).toBeOnTheScreen();

                    // expect all answers to the question to be shown
                    await expect(screen.getByText('Q1 A1')).toBeOnTheScreen();
                    await expect(screen.getByText('Q1 A2')).toBeOnTheScreen();
                });

                it('should show score as 0 initially', async() => {
                    await expect(screen.getByText('quizScreen.score: 0')).toBeOnTheScreen();
                });

                it('should show that the answer is correct if the correct answer was pressed', async() => {
                    const user = userEvent.setup();
                    await user.press(screen.getByRole('button', { name: 'Q1 A2'}));
                    await jest.advanceTimersByTime(1);

                    await expect(screen.getByText('quizAnswerOverlay.correct')).toBeOnTheScreen();
                });

                it('should show increase score correctly if the correct answer is picked', async() => {
                    const user = userEvent.setup();
                    await user.press(screen.getByRole('button', { name: 'Q1 A2'}));
                    await act(() => jest.runAllTimers());

                    await expect(screen.getByText('quizScreen.score: 50')).toBeOnTheScreen();
                });

                it('should show not increase score if the wrong answer is picked', async() => {
                    const user = userEvent.setup();
                    await user.press(screen.getByRole('button', { name: 'Q1 A1'}));
                    await act(() => jest.runAllTimers());

                    await expect(screen.getByText('quizScreen.score: 0')).toBeOnTheScreen();
                });

                it('should show that the answer is false if the wrong answer was pressed', async() => {
                    const user = userEvent.setup();
                    await user.press(screen.getByRole('button', { name: 'Q1 A1'}));
                    await jest.advanceTimersByTime(1);

                    await expect(screen.getByText('quizAnswerOverlay.wrong')).toBeOnTheScreen();
                });

                it('should show the next question number and questions and answers after the correct answer was picked', async() => {
                    const user = userEvent.setup();
                    await user.press(screen.getByRole('button', { name: 'Q1 A2'}));
                    await act(() => jest.runAllTimers());

                    await expect(screen.getByText('quizScreen.question 2/2')).toBeOnTheScreen();
                    // expect first question to be shown
                    await expect(screen.getByText('Q2')).toBeOnTheScreen();

                    // expect all answers to the question to be shown
                    await expect(screen.getByText('Q2 A1')).toBeOnTheScreen();
                    await expect(screen.getByText('Q2 A2')).toBeOnTheScreen();
                });

                it('should show the next question number and questions and answers after the wrong answer was picked', async() => {
                    const user = userEvent.setup();
                    await user.press(screen.getByRole('button', { name: 'Q1 A1'}));
                    await act(() => jest.runAllTimers());

                    await expect(screen.getByText('quizScreen.question 2/2')).toBeOnTheScreen();
                    
                    // expect first question to be shown
                    await expect(screen.getByText('Q2')).toBeOnTheScreen();

                    // expect all answers to the question to be shown
                    await expect(screen.getByText('Q2 A1')).toBeOnTheScreen();
                    await expect(screen.getByText('Q2 A2')).toBeOnTheScreen();
                });

                describe('If fetching current status about if 100 was ever achieved before failed',() => {
                    beforeEach(async ()=>{
                        // update mock with test data
                        supabase.schema.mockImplementation((tableName)=>{
                            return{
                                from: jest.fn().mockImplementation((tableName)=>{
                                    if(tableName == 'quiz_categories'){
                                        return {
                                            select: jest.fn().mockImplementation(()=>{ 
                                            return{
                                                data: categoryTestData,
                                                error: null
                                            }
                                            })
                                        }
                                    }
                                    else if(tableName == 'quiz_questions'){
                                        return {
                                            select: jest.fn().mockImplementation(()=>{ 
                                            return{
                                                eq: jest.fn().mockImplementation(()=>{
                                                    return {
                                                        data: testQAndAData,
                                                        error: null
                                                    }
                                                })
                                            }
                                            })
                                        }
                                    }
                                    else if(tableName=='profiles_public_data'){
                                        return{
                                            update: jest.fn().mockImplementation(()=>{
                                                return {
                                                    eq: jest.fn().mockImplementation(()=>{
                                                        return {
                                                            error: null
                                                        }
                                                    })
                                                }
                                            }),
                                            select: jest.fn().mockImplementation((colNamesStr)=>{
                                                if(colNamesStr == 'has_gotten_100_in_a_quiz, xp'){
                                                    return {
                                                        eq: jest.fn().mockImplementation(()=>{
                                                            return {
                                                                single: jest.fn().mockImplementation(()=>{
                                                                    return {
                                                                        data: null,  
                                                                        error: {
                                                                            message: 'Failed to get status about if 100 was ever achieved before'
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        });

                        // render screen
                        await renderWithToasts(
                            <LanguageContext.Provider value={{currentLang: 'en'}}>
                                <AuthContext value={{user: testUser}}>
                                    <QuizzesScreen />
                                </AuthContext>
                            </LanguageContext.Provider>
                        );
                        
                        // press a category button
                        const user = userEvent.setup();
                        await user.press(screen.getByRole('button', { name: 'category 1'}));
                        await act(() => jest.runAllTimers());

                        // press answer button 
                        await user.press(screen.getByRole('button', { name: 'Q1 A2'}));
                        await act(() => jest.runAllTimers());

                        // press final answer button
                        await user.press(screen.getByRole('button', { name: 'Q2 A2'}));
                        await act(() => jest.runAllTimers());
                    });

                    it('should show the correct error toast', async() => {
                        await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('quizScreen.failedToFetchProfileData'));
                        await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('Failed to get status about if 100 was ever achieved before'));
                    });
                });

                 describe('If updating profile data failed',() => {
                    beforeEach(async ()=>{
                        // update mock with test data
                        supabase.schema.mockImplementation((tableName)=>{
                            return{
                                from: jest.fn().mockImplementation((tableName)=>{
                                    if(tableName == 'quiz_categories'){
                                        return {
                                            select: jest.fn().mockImplementation(()=>{ 
                                            return{
                                                data: categoryTestData,
                                                error: null
                                            }
                                            })
                                        }
                                    }
                                    else if(tableName == 'quiz_questions'){
                                        return {
                                            select: jest.fn().mockImplementation(()=>{ 
                                            return{
                                                eq: jest.fn().mockImplementation(()=>{
                                                    return {
                                                        data: testQAndAData,
                                                        error: null
                                                    }
                                                })
                                            }
                                            })
                                        }
                                    }
                                    else if(tableName=='profiles_public_data'){
                                        return{
                                            update: jest.fn().mockImplementation(()=>{
                                                return {
                                                    eq: jest.fn().mockImplementation(()=>{
                                                        return {
                                                            error: {
                                                                message: 'Failed to update profile'
                                                            }
                                                        }
                                                    })
                                                }
                                            }),
                                            select: jest.fn().mockImplementation((colNamesStr)=>{
                                                if(colNamesStr == 'has_gotten_100_in_a_quiz, xp'){
                                                    return {
                                                        eq: jest.fn().mockImplementation(()=>{
                                                            return {
                                                                single: jest.fn().mockImplementation(()=>{
                                                                    return {
                                                                        data:{
                                                                            has_gotten_100_in_a_quiz: false, 
                                                                            xp: 10
                                                                        },   
                                                                        error: null
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        });

                        // render screen
                        await renderWithToasts(
                            <LanguageContext.Provider value={{currentLang: 'en'}}>
                                <AuthContext value={{user: testUser}}>
                                    <QuizzesScreen />
                                </AuthContext>
                            </LanguageContext.Provider>
                        );
                        
                        // press a category button
                        const user = userEvent.setup();
                        await user.press(screen.getByRole('button', { name: 'category 1'}));
                        await act(() => jest.runAllTimers());

                        // press answer button 
                        await user.press(screen.getByRole('button', { name: 'Q1 A2'}));
                        await act(() => jest.runAllTimers());

                        // press final answer button
                        await user.press(screen.getByRole('button', { name: 'Q2 A2'}));
                        await act(() => jest.runAllTimers());
                    });

                    it('should show the correct error toast', async() => {
                        await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('quizScreen.failedToUpdateProfile'));
                        await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('Failed to update profile'));
                    });
                });
                
                describe('If fetching current status about if 100 was ever achieved before was successful (returned status as false) andfinal question score update to supabase was successful',() => {
                    beforeEach(async ()=>{
                        // update mock with test data
                        supabase.schema.mockImplementation(()=>{
                            return{
                                from: jest.fn().mockImplementation((tableName)=>{
                                    if(tableName == 'quiz_categories'){
                                        return {
                                            select: jest.fn().mockImplementation(()=>{ 
                                            return{
                                                data: categoryTestData,
                                                error: null
                                            }
                                            })
                                        }
                                    }
                                    else if(tableName == 'quiz_questions'){
                                        return {
                                            select: jest.fn().mockImplementation(()=>{ 
                                            return{
                                                eq: jest.fn().mockImplementation(()=>{
                                                    return {
                                                        data: testQAndAData,
                                                        error: null
                                                    }
                                                })
                                            }
                                            })
                                        }
                                    }
                                    else if(tableName=='profiles_public_data'){
                                        return{
                                            update: jest.fn().mockImplementation(()=>{
                                                return {
                                                    eq: jest.fn().mockImplementation(()=>{
                                                        return {
                                                            error: null
                                                        }
                                                    })
                                                }
                                            }),
                                            select: jest.fn().mockImplementation((colNamesStr)=>{
                                                if(colNamesStr == 'has_gotten_100_in_a_quiz, xp'){
                                                    return {
                                                        eq: jest.fn().mockImplementation(()=>{
                                                            return {
                                                                single: jest.fn().mockImplementation(()=>{
                                                                    return {
                                                                        data: {
                                                                            has_gotten_100_in_a_quiz: false, // assume 100 in a quiz never happened before
                                                                            xp: 10
                                                                        }, 
                                                                        error: null
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        });

                        // render screen
                        await renderWithToasts(
                            <LanguageContext.Provider value={{currentLang: 'en'}}>
                                <AuthContext value={{user: testUser}}>
                                    <QuizzesScreen />
                                </AuthContext>
                            </LanguageContext.Provider>
                        );
                        
                        // press a category button
                        const user = userEvent.setup();
                        await user.press(screen.getByRole('button', { name: 'category 1'}));
                        await act(() => jest.runAllTimers());
                    });

                    it('should show the final score as 100 if all questions were answered correctly', async() => {
                        const user = userEvent.setup();

                        // press first correct answer
                        await user.press(screen.getByRole('button', { name: 'Q1 A2'}));
                        await act(() => jest.runAllTimers());

                        // press first correct answer
                        await user.press(screen.getByRole('button', { name: 'Q2 A2'}));
                        await act(() => jest.runAllTimers());

                        await expect(screen.getByText('quizScreen.finalScore: 100'))
                    });

                    it('should show the final score as 50 if only one of the two questions were answered correctly', async() => {
                        const user = userEvent.setup();

                        // press first correct answer
                        await user.press(screen.getByRole('button', { name: 'Q1 A2'}));
                        await act(() => jest.runAllTimers());

                        // press first correct answer
                        await user.press(screen.getByRole('button', { name: 'Q2 A1'}));
                        await act(() => jest.runAllTimers());

                        await expect(screen.getByText('quizScreen.finalScore: 50'))
                    });

                    it('should show the final score as 0 if only none of the two questions were answered correctly', async() => {
                        const user = userEvent.setup();

                        // press first correct answer
                        await user.press(screen.getByRole('button', { name: 'Q1 A1'}));
                        await act(() => jest.runAllTimers());

                        // press first correct answer
                        await user.press(screen.getByRole('button', { name: 'Q2 A1'}));
                        await act(() => jest.runAllTimers());

                        await expect(screen.getByText('quizScreen.finalScore: 0'))
                    });
                });

            describe('When fetching question and answer data was unsuccessful', () => {
                beforeEach(async ()=>{
                    // update mock to show error
                    supabase.schema.mockImplementation(()=>{
                        return{
                            from: jest.fn().mockImplementation((tableName)=>{
                                if(tableName == 'quiz_categories'){
                                    return {
                                        select: jest.fn().mockImplementation(()=>{ 
                                        return{
                                            data: categoryTestData,
                                            error: null
                                        }
                                        })
                                    }
                                }
                                else if(tableName == 'quiz_questions'){
                                    return {
                                        select: jest.fn().mockImplementation(()=>{ 
                                        return{
                                            eq: jest.fn().mockImplementation(()=>{
                                                return {
                                                    data: null,
                                                    error: {
                                                        message: 'Failed to fetch Qs and As'
                                                    }
                                                }
                                            })
                                        }
                                        })
                                    }
                                }
                            })
                        }
                    });

                    // render screen
                    await renderWithToasts(
                        <LanguageContext.Provider value={{currentLang: 'en'}}>
                            <AuthContext value={{user: testUser}}>
                                <QuizzesScreen />
                            </AuthContext>
                        </LanguageContext.Provider>
                    );

                    // press a category button
                    const user = userEvent.setup();
                    await user.press(screen.getByRole('button', { name: 'category 1'}));
                    await act(() => jest.runAllTimers());
                });

                it('should show error toast when fetching questions and answers data failed', async () => {
                    await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('quizScreen.failedToFetchQsAndAs'));
                    await expect(screen.getByTestId('toastAnimatedContainer')).toContainElement(screen.getByText('Failed to fetch Qs and As'));
                });
            });
        });
    });
});