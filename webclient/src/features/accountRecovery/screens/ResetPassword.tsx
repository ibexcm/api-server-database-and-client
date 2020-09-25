import React from "react";
import routes from "../../../routes";
import DependencyContext from "../../../common/contexts/DependencyContext";
import { styles } from "../../../common/theme";
import { MobileNavBar, NavBar } from "../components";
import { MutationResetPasswordArgs } from "@ibexcm/libraries/api";
import { RouteComponentProps, StaticContext } from "react-router";
import { Box, Container, Theme, withStyles, WithStyles } from "@material-ui/core";
import { Button, InputErrorBox, TextField, Typography } from "../../../common/components";
import { AccountRecoveryRepositoryInjectionKey } from "../InjectionKey";

interface Props extends WithStyles, RouteComponentProps<{}, StaticContext> {}

const Component: React.FC<Props> = ({ classes, history, location, match, ...props }) => {
  const dependencies = React.useContext(DependencyContext);
  const AccountRecoveryRepository = dependencies.provide(
    AccountRecoveryRepositoryInjectionKey,
  );

  const [confirmButtonDisabled, setConfirmButtonDisabled] = React.useState<boolean>(true);

  const [error, setError] = React.useState<Error | null>(null);
  const [input, setInput] = React.useState<MutationResetPasswordArgs>({
    args: { password: "" },
  });
  const [confirmPasswordInput, setConfirmPasswordInput] = React.useState<
    MutationResetPasswordArgs
  >({
    args: { password: "" },
  });

  const {
    execute: executeResetPasswordMutation,
  } = AccountRecoveryRepository.useResetPasswordMutation();

  const onResetPassword = async () => {
    try {
      await executeResetPasswordMutation(input);
      history.push(routes.authentication.signIn);
    } catch (error) {
      setError(error);
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setInput({ args: { password: value } });
  };

  const onConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value !== input.args.password) {
      setError(new Error("La contraseñas no coinciden"));
      setConfirmButtonDisabled(true);
    } else {
      setError(null);
      setConfirmButtonDisabled(false);
    }

    setConfirmPasswordInput({ args: { password: value } });
  };

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onResetPassword();
    }
  };

  return (
    <Box className={classes.homeContainer}>
      <MobileNavBar />
      <NavBar />
      <Container maxWidth="xs">
        <Box
          minHeight="100vh"
          flexDirection="column"
          display="flex"
          justifyContent="center"
        >
          <Box flexDirection="column" display="flex" justifyContent="center">
            <Typography variant="h5">Restablece tu Contraseña</Typography>
            <Typography>Elige una nueva contraseña.</Typography>
          </Box>
          <Box my={2}>
            <Box>
              <Typography>{""}</Typography>
            </Box>
            <TextField
              autoFocus
              fullWidth
              label="Contraseña nueva"
              placeholder="Combina varios caracteres"
              variant="outlined"
              onKeyPress={onKeyPress}
              onChange={onInputChange}
              value={input.args.password}
              type="password"
              my={2}
            />
            <TextField
              fullWidth
              label="Confirma tu contraseña"
              variant="outlined"
              onKeyPress={onKeyPress}
              onChange={onConfirmPasswordChange}
              value={confirmPasswordInput.args.password}
              type="password"
              my={2}
            />
            <InputErrorBox error={error} />
            <Button
              color="primary"
              variant="contained"
              fullWidth
              size="large"
              onClick={onResetPassword}
              disabled={confirmButtonDisabled}
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export const ResetPassword = withStyles((theme: Theme) => ({
  ...styles(theme),
  homeContainer: {
    backgroundColor: "white",
  },
}))(Component);