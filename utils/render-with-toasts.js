/**
 * function for rendering components with toasts for testing
 */
import { render } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import { View } from 'react-native';
import { toastConfig } from '../App';

export const renderWithToasts = async(component) => {
  await render(
    <View>
      {component}
      <Toast config={toastConfig} />
    </View>
  )
};