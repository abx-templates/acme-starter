import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import { api } from './api/client';

function RootLayout() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ACME
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/buildings">
            Buildings
          </Button>
          <Button color="inherit" component={Link} to="/work-orders">
            Work Orders
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function IndexPage() {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          ACME Interview App
        </Typography>
        <Typography color="text.secondary">
          Use the nav above. The Buildings and Work Orders pages show the
          route-loader + typed-client pattern to follow.
        </Typography>
      </Box>
    );
  },
});

// Buildings page: the data-fetching pattern to imitate (loader -> useLoaderData).
const buildingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/buildings',
  loader: () => api.getBuildings(),
  component: function BuildingsPage() {
    const buildings = buildingsRoute.useLoaderData();
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Buildings
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {buildings.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.name}</TableCell>
                <TableCell>{b.address ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  },
});

const workOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/work-orders',
  loader: () => api.getWorkOrders(),
  component: function WorkOrdersPage() {
    const workOrders = workOrdersRoute.useLoaderData();
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Work Orders
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Asset</TableCell>
              <TableCell>Assignee</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workOrders.map((wo) => (
              <TableRow key={wo.id}>
                <TableCell>{wo.title}</TableCell>
                <TableCell>
                  <Chip label={wo.status} size="small" />
                </TableCell>
                <TableCell>{wo.asset?.name ?? '—'}</TableCell>
                <TableCell>{wo.assignee?.name ?? 'Unassigned'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  buildingsRoute,
  workOrdersRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
