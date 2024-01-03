import { Button, Flex, useColorModeValue } from '@chakra-ui/react';
import router from 'next/router';
import React from 'react';

import ColorModeSwitch from './ColorModeSwitch';
import TopBarStats from './TopBarStats';

const TopBar = () => {
  const bgColor = useColorModeValue('gray.50', 'whiteAlpha.100');

  return (
    <Flex py={ 2 } px={ 6 } bgColor={ bgColor } justifyContent="space-between">
      <TopBarStats/>
      <Flex
        w="full"
        h="full"
        justifyContent="right"
        alignItems="center"
        gap={ 2 }
      >
        <ColorModeSwitch/>
      </Flex>
    </Flex>
  );
};

export default React.memo(TopBar);
