import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router';
import { routes } from './routes';
import { LoginPage } from '@pages/LoginPage';
import { PrivateRoute } from '@components/PrivateRoute';
import { HomePage } from '@pages/HomePage';
import { NotFound } from '@pages/NotFound';
import { EditProfile } from '@pages/EditProfile';
import { Layout } from '@components/Layout';
import { ROLES } from '@const/roles';
import { CreateListing } from '@pages/CreateListing';
import { ManageModerator } from '@pages/ManageModerator';
import { ActivatePassword } from '@pages/ActivatePassword';
import { ManageModerators } from '@pages/ManageModerators';
import { CreateVerification } from '@pages/CreateVerification';
import { ViewVerifications } from '@pages/ViewVerifications';
import { ViewVerification } from '@pages/ViewVerification';
import { ManageListing } from '@pages/ManageListing';
import { MyApplications } from '@pages/MyApplications';
import { ViewComplaints } from '@pages/ViewComplaints';
import { ChatsPage } from '@pages/ChatsPage';

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route element={<Layout />}>
                <Route element={<PrivateRoute />}>
                    <Route path={routes.HOME} element={<HomePage />} />
                </Route>
                <Route element={<PrivateRoute />}>
                    <Route path={routes.EDIT_PROFILE} element={<EditProfile />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={[ROLES.LANDLORD]} />}>
                    <Route path={routes.CREATE_LISTING} element={<CreateListing />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={[ROLES.SUPER_USER]} />}>
                    <Route path={routes.MANAGE_MODERATORS} element={<ManageModerators />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={[ROLES.SUPER_USER]} />}>
                    <Route path={routes.MANAGE_MODERATOR} element={<ManageModerator />} />
                </Route>
                <Route element={<PrivateRoute allowedRoles={[ROLES.SUPER_USER]} />}>
                    <Route path={routes.CREATE_MODERATOR} element={<ManageModerator />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={[ROLES.IDP]} />}>
                    <Route path={routes.CREATE_VERIFICATION} element={<CreateVerification />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={[ROLES.MODERATOR]} />}>
                    <Route path={routes.VIEW_VERIFICATION} element={<ViewVerification />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={[ROLES.MODERATOR]} />}>
                    <Route path={routes.VIEW_VERIFICATIONS} element={<ViewVerifications />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={[ROLES.IDP, ROLES.LANDLORD]} />}>
                    <Route path={routes.MY_APPLICATIONS} element={<MyApplications />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={[ROLES.MODERATOR]} />}>
                    <Route path={routes.COMPLAINTS} element={<ViewComplaints />} />
                </Route>

                <Route path={routes.MANAGE_LISTING} element={<ManageListing />} />

                <Route
                    element={
                        <PrivateRoute allowedRoles={[ROLES.IDP, ROLES.LANDLORD, ROLES.MODERATOR]} />
                    }>
                    <Route path={routes.CHATS} element={<ChatsPage />} />
                </Route>

                <Route
                    element={
                        <PrivateRoute allowedRoles={[ROLES.IDP, ROLES.LANDLORD, ROLES.MODERATOR]} />
                    }>
                    <Route path={routes.CHAT} element={<ChatsPage />} />
                </Route>
            </Route>

            <Route path={routes.ACTIVATE_PASSWORD} element={<ActivatePassword />} />
            <Route path={routes.LOGIN} element={<LoginPage />} />

            <Route path="*" element={<NotFound />} />
        </Route>
    )
);
