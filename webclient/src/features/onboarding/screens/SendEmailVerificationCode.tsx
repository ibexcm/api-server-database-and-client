import { MutationSendEmailVerificationCodeArgs } from "@ibexcm/libraries/api";
import { Box, Container, Theme, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { RouteComponentProps } from "react-router";
import {
  Button,
  Modal,
  StepsSidebar,
  TextField,
  ToolbarPadding,
  Typography,
} from "../../../common/components";
import DependencyContext from "../../../common/contexts/DependencyContext";
import { styles } from "../../../common/theme";
import { MobileAppBar } from "../components";
import { OnboardingRepositoryInjectionKeys } from "../InjectionKeys";

interface ISendEmailVerificationCodeProps extends WithStyles, RouteComponentProps {}

const Component: React.FC<ISendEmailVerificationCodeProps> = ({
  classes,
  history,
  match,
  ...props
}) => {
  const dependencies = React.useContext(DependencyContext);
  const OnboardingRepository = dependencies.provide(OnboardingRepositoryInjectionKeys);
  const [input, setInput] = React.useState<MutationSendEmailVerificationCodeArgs>({
    args: {
      address: "",
    },
  });
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const {
    execute: executeSendEmailVerificationCodeMutation,
  } = OnboardingRepository.useSendEmailVerificationCodeMutation();

  const onSendVerificationCode = async () => {
    try {
      await executeSendEmailVerificationCodeMutation(input);
      setIsModalOpen(true);
    } catch (error) {}
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInput({ ...input, args: { address: value } });
  };

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSendVerificationCode();
    }
  };

  return (
    <Box display="flex">
      <Modal
        onClose={() => {
          setIsModalOpen(false);
        }}
        open={isModalOpen}
      >
        <Box p={2} height="35vh">
          <Typography>Enviamos un correo a {input.args.address}.</Typography>
        </Box>
      </Modal>
      <StepsSidebar />
      <Container maxWidth="xl">
        <MobileAppBar />
        <ToolbarPadding />
        <Box mb={4}>
          <Typography variant="h5" mb={1}>
            Ingresa tu email
          </Typography>
          <Typography>
            Enviaremos un código a tu bandeja de entrada para verificar tu dirección de
            correo electrónico.
          </Typography>
        </Box>
        <Box mb={4}>
          <TextField
            autoFocus
            fullWidth
            label="Correo electrónico"
            variant="outlined"
            onChange={onChange}
            onKeyPress={onKeyPress}
            value={input.args.address}
            type="email"
            mb={3}
          />
          <Button
            color="primary"
            variant="contained"
            fullWidth
            size="large"
            onClick={onSendVerificationCode}
          >
            Enviar Email
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export const SendEmailVerificationCode = withStyles((theme: Theme) => ({
  ...styles(theme),
}))(Component);
