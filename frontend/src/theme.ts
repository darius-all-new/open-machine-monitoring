import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export const theme = extendTheme({ 
  config,
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'light' ? 'white' : 'gray.800',
        color: props.colorMode === 'light' ? 'gray.800' : 'white',
      },
    }),
  },
  components: {
    // Add any component-specific theme customizations here
  },
});
