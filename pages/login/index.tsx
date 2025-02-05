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
import router from "next/router";

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
      const apiURL = process.env.NEXT_PUBLIC_BASE_API + "/login";

      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        const JwtToken = data.token;
        sessionStorage.setItem("JwtToken", JwtToken);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("vaultId", data.vaultId);

        const assetId = process.env.NEXT_PUBLIC_ASSET_ID;

        const apiURL = process.env.NEXT_PUBLIC_BASE_API + "/getAssets";

        try {
          if (!apiURL || !data?.vaultId || !assetId) {
            console.error("CALLING GET ASSET HAS BEEN CANCLED");
          } else {
            const response = await fetch(apiURL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${JwtToken}`,
              },
              body: JSON.stringify({
                assetId,
                vaultId: parseInt(data?.vaultId),
              }),
            });

            if (response.ok) {
              const unparsedResponse: any = await response.json();
              sessionStorage.setItem(
                "asset_addresses",
                unparsedResponse.address
              );
              onLogin();
            } else {
              console.error("Response Failed.." + response.json());
            }
          }
        } catch (err) {
          console.log(err, "req error");
        }
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
