/**
 * For sources (such as documentation pages) that showed clear linkage 
 * to the repository and the code file version for the source's page, attributions with 
 * the license information and repository link are included.
 * For sources with linkage to repository and code file version that were harder to ascertain,
 * only academic attribution following the university's guidelines are given with links to 
 * the sources' web pages. 
 */

// -------------- Mock react-native-safe-area-context --------------
// Start of code I did not write myself (Part 1)
// Source:
// Title: testing.mdx

// Author: commit authored by Janic Duplessis (https://github.com/janicduplessis) in a repository by App&Flow (https://github.com/AppAndFlow)

// Date: Feb 12, 2025

// Code version: commit 6103e7d

// Availability: https://github.com/AppAndFlow/react-native-safe-area-context/blob/main/docs/docs/testing.mdx

// The repository the original code is in is licensed under the MIT License.
// A copy of the license can be found on THIRD-PARTY-LICENSES-MANUAL-ADDITION.MD file at the root directory of this project 
// under the section "react-native-safe-area-context (https://github.com/AppAndFlow/react-native-safe-area-context)" and also shown below:
/*
MIT License

Copyright (c) 2019 Th3rd Wave

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
// The code used below is only a subset of the code shown in the original file
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
// End of code I did not write myself (Part 1)

// ------------------- Mock react navigation --------------------
// Start of code I did not write myself (Part 2)
// Adapted from:
// Title: testing.md

// Author: Commit by Satyajit Sahoo (https://github.com/satya164) in a repository by React Navigation (https://github.com/react-navigation)

// Date: Jun 25, 2026

// Code version: commit 2637049

// Availability: https://github.com/react-navigation/react-navigation.github.io/blob/main/versioned_docs/version-7.x/testing.md

/* Chages I made:
   The lines:

   import { jest } from '@jest/globals';
   jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

   are is not included, because it seems to cause an error and the directory 
   react-native/Libraries/Animated/NativeAnimatedHelper does not appear to exist in this project.
   The code used below is only a subset of the code shown in the original file */

// The repository the original code is in is licensed under the MIT License.
// A copy of the license can be found on THIRD-PARTY-LICENSES-MANUAL-ADDITION.MD file at the root directory of this project 
// under the section "React Navigation (https://github.com/react-navigation/react-navigation.github.io/tree/main)" and also shown below:
/*
MIT License

Copyright (c) 2020 React Navigation

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
import 'react-native-gesture-handler/jestSetup';
import { setUpTests } from 'react-native-reanimated';
setUpTests();
// End of code I did not write myself (Part 2)

// -------------------- Mock translations usage (react-i18next) -----------------------
// Start of code I did not write myself (Part 3)
// Adapted from:
// Title: Unknown (found on an article titled 'Testing')

// Author: No individual authors named, found on react-i18next documentation page

// Date: 7/16/2026

// Code version: Unknown

// Availability: https://react.i18next.com/misc/testing

// Changes I made: I added exists function handling
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (i18nKey) => i18nKey,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
        exists: () => true // just default to true whether or not the translation exists
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  }
}));
// End of code I did not write myself (Part 3)

// ----------------- Mock async storage ------------------------
// Start of code I did not write myself (Part 4)
// Source:
// Title: Unknown (found on article titled 'Jest integration')

// Author: No individual authors named, found on Async Storage's guide on Jest integration

// Date: Unknown

// Code version: Unknown (for Async Storage version 2.0)

// Availability: https://react-native-async-storage.github.io/2.0/advanced/Jest-integration/
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
// End of code I did not write myself (Part 4)

// Start of code I personally wrote without assistance
// ----------------------- Mock map libre's components ------------------------
jest.mock('@maplibre/maplibre-react-native', () => {
    return{
        Map: 'Map',
        Marker: 'Marker',
        Camera: 'Camera'
    }
});

// mock expo audio
jest.mock('expo-audio', () => {
   return{
     useAudioPlayer: () => {
      return{
        pause: jest.fn(),
        play: jest.fn(),
        seekTo: jest.fn()
      }
     }
   }
});
// End of code I personally wrote without assistance