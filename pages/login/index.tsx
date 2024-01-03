import React, { useState, ChangeEvent } from "react";
import { Box, Button, Flex, Input, Stack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { Field, Form, Formik, FormikHelpers } from "formik";

type LoginFormValues = {
  email: string;
  password: string;
};

interface LoginProps {
  onLogin: () => void;
  expired: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, expired }) => {
  const [message, setMessage] = useState(
    expired ? "Your Session has expired. Please log in again." : ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (
    values: LoginFormValues,
    actions: FormikHelpers<LoginFormValues>
  ) => {
    try {
      const { email, password } = values;
      setIsLoading(true);
      const response = await fetch("http://34.78.38.78/api/v1/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        const JwtToken = data.token;
        sessionStorage.setItem("JwtToken", JwtToken);

        onLogin();
      } else {
        actions.resetForm();
        setMessage("Invalid email or password. Please check and try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function validateEmail(value: string) {
    let error;
    if (!value) {
      error = "Email is required";
    }
    return error;
  }

  function validatePassword(value: string) {
    let error;
    if (!value) {
      error = "Password is required";
    }
    return error;
  }

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      direction="column"
      minH="100vh"
    >
      <Text
        fontSize={["xl", "2xl"]}
        color="teal.500"
        fontWeight="bold"
        mb={[2, 4]}
      >
        Welcome To BlockScout
      </Text>
      <Box
        w={["90%", "80%", "80%", "50%", "30%"]}
        borderWidth={2}
        borderRadius="md"
        p={4}
        pt={8}
        pb={8}
      >
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={(values, actions) => {
            handleLogin(values, actions);
          }}
        >
          {(props) => (
            <Form>
              <Stack spacing={2}>
                <Field name="email" validate={validateEmail}>
                  {({
                    field,
                    form,
                  }: {
                    field: { name: string; value: string };
                    form: any;
                  }) => (
                    <FormControl
                      isInvalid={form.errors.email && form.touched.email}
                    >
                      <FormLabel
                        fontSize={["sm", "sm"]}
                        color="teal.700"
                        mb={[1, 1]}
                      >
                        Email Address
                      </FormLabel>
                      <Input
                        {...field}
                        placeholder="Email"
                        onFocus={() => {
                          setMessage("");
                        }}
                      />
                      <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="password" validate={validatePassword}>
                  {({
                    field,
                    form,
                  }: {
                    field: { name: string; value: string };
                    form: any;
                  }) => (
                    <FormControl
                      isInvalid={form.errors.password && form.touched.password}
                    >
                      <FormLabel
                        fontSize={["sm", "sm"]}
                        color="teal.700"
                        mb={[1, 1]}
                      >
                        Password
                      </FormLabel>
                      <Input
                        {...field}
                        type="password"
                        placeholder="password"
                        onFocus={() => {
                          setMessage("");
                        }}
                      />
                      <FormErrorMessage>
                        {form.errors.password}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Button
                  mt={4}
                  colorScheme="teal"
                  isLoading={isLoading}
                  type="submit"
                >
                  Login
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
        <Text mt={4} fontSize={["xs", "sm"]} color="red.500" textAlign="center">
          {message}
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
