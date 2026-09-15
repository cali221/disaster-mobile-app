import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { showInfoToast } from './show-toast';

// function to register for push notification using Expo
// Start of code I did not write myself
// Taken and slightly modified from:

// Title: notifications.mdx

// Author: commit authored by Aman Mittal (https://github.com/amandeepmittal) in a repository by Expo (https://github.com/expo)

// Date: May 26, 2026

// Code version: commit be06320

// Availability: https://github.com/expo/expo/blob/main/docs/pages/versions/unversioned/sdk/notifications.mdx

// The repository the original code is in is licensed under the MIT License.
// A copy of the license can be found on THIRD-PARTY-LICENSES-MANUAL-ADDITION.MD file at the root directory of this project 
// under the section "Expo (https://github.com/expo/expo)" and also shown below:
/*
The MIT License (MIT)

Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)
// Modified by me. Changes I made:
// - I added comments
// - I changed some setNotificationChannelAsync parameter values
// - I changed the alert message if notification permission is not granted
// - I changed console.log for showing generated push token message slightly
// - I export the function to use from another file
// - I throw an error if the token wasn't successfully generated instead of setting token to the error string
// - I manually add the project ID instead of using Constants
export async function registerForPushNotificationsAsync(){
    // the Expo push notification token
    let token;

    // set notification channel (needed to make permissions prompt appear)
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('finalProjectAppNotificationChannel', {
        name: "Final project applications's push notification channel",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        });
    }

    // get notification permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    // set final status as existing status initially
    let finalStatus = existingStatus;

    // if currently push notification permission is not grantedm request for the permission
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    // if final status is stil not granted, alert the user that it's needed to get notifications
    if (finalStatus !== 'granted') {
        throw new Error('Permission needed');
    }

    // if notification permission is granted, try to get the Expo push token
    try {
        // get the project ID
        // const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

        // if (!projectId) {
        //     throw new Error('Project ID was not found');
        // }
        
        // get the Expo push token
        token = (
            await Notifications.getExpoPushTokenAsync({
                projectId: 'de577934-0e3e-4bc7-965b-5f8d8c7e4e1f'
            })
        ).data;

        console.log("Expo push token: " + token);
    } 
    catch(error) {
        throw new Error(`Failed to obtain token for push notification. ${error}`);
    }

    return token;
}
// End of code I did not write myself