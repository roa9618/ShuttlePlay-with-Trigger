import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PasswordResetPage from "./pages/PasswordResetPage";
import GroupListPage from "./pages/GroupListPage";
import GroupNewPage from "./pages/GroupNewPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import GroupMembersPage from "./pages/GroupMembersPage";
import GroupSettingsPage from "./pages/GroupSettingsPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import JoinSessionPage from "./pages/JoinSessionPage";
import GuestJoinPage from "./pages/GuestJoinPage";
import AttendancePage from "./pages/AttendancePage";
import LateRegistrationPage from "./pages/LateRegistrationPage";
import ParticipantStatusPage from "./pages/ParticipantStatusPage";
import NextMatchPage from "./pages/NextMatchPage";
import OrganizerDashboardPage from "./pages/OrganizerDashboardPage";
import ParticipantManagementPage from "./pages/ParticipantManagementPage";
import MatchQueuePage from "./pages/MatchQueuePage";
import CurrentMatchesPage from "./pages/CurrentMatchesPage";
import MatchResultInputPage from "./pages/MatchResultInputPage";
import MatchResultEditPage from "./pages/MatchResultEditPage";
import MyRecordPage from "./pages/MyRecordPage";
import SessionReportPage from "./pages/SessionReportPage";
import ParticipantSessionReportPage from "./pages/ParticipantSessionReportPage";
import DisplayBoardPage from "./pages/DisplayBoardPage";
import SettingsPage from "./pages/SettingsPage";
import GalleryPage from "./pages/GalleryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "login", Component: LoginPage },
      { path: "signup", Component: SignupPage },
      { path: "password-reset", Component: PasswordResetPage },

      // Mobile-optimized pages (no sidebar)
      { path: "sessions/:sessionId/join", Component: JoinSessionPage },
      { path: "sessions/:sessionId/guest-join", Component: GuestJoinPage },
      { path: "sessions/:sessionId/attendance", Component: AttendancePage },
      { path: "sessions/:sessionId/late", Component: LateRegistrationPage },
      { path: "sessions/:sessionId/status", Component: ParticipantStatusPage },
      { path: "sessions/:sessionId/next-match", Component: NextMatchPage },

      // Large display (no sidebar)
      { path: "sessions/:sessionId/display", Component: DisplayBoardPage },

      // Desktop-optimized pages (with sidebar) - nested under Layout
      { path: "groups", Component: GroupListPage },
      { path: "groups/new", Component: GroupNewPage },
      { path: "groups/:groupId", Component: GroupDetailPage },
      { path: "groups/:groupId/members", Component: GroupMembersPage },
      { path: "groups/:groupId/settings", Component: GroupSettingsPage },
      { path: "groups/:groupId/create-session", Component: CreateSessionPage },
      { path: "sessions/:sessionId/dashboard", Component: OrganizerDashboardPage },
      { path: "sessions/:sessionId/participants", Component: ParticipantManagementPage },
      { path: "sessions/:sessionId/queue", Component: MatchQueuePage },
      { path: "sessions/:sessionId/current", Component: CurrentMatchesPage },
      { path: "sessions/:sessionId/result/new", Component: MatchResultInputPage },
      { path: "sessions/:sessionId/result/:matchId/edit", Component: MatchResultEditPage },
      { path: "my-record", Component: MyRecordPage },
      { path: "sessions/:sessionId/report", Component: SessionReportPage },
      { path: "sessions/:sessionId/my-report", Component: ParticipantSessionReportPage },
      { path: "settings", Component: SettingsPage },
      { path: "gallery", Component: GalleryPage },
    ],
  },
]);
