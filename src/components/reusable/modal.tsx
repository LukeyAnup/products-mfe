import { Modal, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { ReactNode } from "react";

interface ReusableModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number | string;
}

export default function ModalComponent({
  open,
  onClose,
  title,
  children,
  width = 400,
}: ReusableModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle(width)}>
        {title && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">{title}</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        <Box mt={2}>{children}</Box>
      </Box>
    </Modal>
  );
}

const modalStyle = (width: number | string) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  px: 2,
});
