import React from 'react';
import { Box, Container, Paper, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
}));

const AdminLayout = ({ children, title, actions }) => {
  const theme = useTheme();

  return (
    <PageContainer maxWidth="lg">
      <PageHeader>
        <PageTitle variant="h4">{title}</PageTitle>
        {actions && <Box>{actions}</Box>}
      </PageHeader>
      <ContentPaper>
        {children}
      </ContentPaper>
    </PageContainer>
  );
};

export default AdminLayout; 