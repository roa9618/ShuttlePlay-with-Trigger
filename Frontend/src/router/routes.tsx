import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import RequireAuth from "../components/RequireAuth";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import SocialSignupPage from "../pages/SocialSignupPage";
import OAuthCallbackPage from "../pages/OAuthCallbackPage";
import PasswordResetPage from "../pages/PasswordResetPage";
import PasswordResetConfirmPage from "../pages/PasswordResetConfirmPage";
import GroupListPage from "../pages/GroupListPage";
import GroupNewPage from "../pages/GroupNewPage";
import GroupDetailPage from "../pages/GroupDetailPage";
import GroupMembersPage from "../pages/GroupMembersPage";
import GroupSettingsPage from "../pages/GroupSettingsPage";
import CreateSessionPage from "../pages/CreateSessionPage";
import JoinSessionPage from "../pages/JoinSessionPage";
import GuestJoinPage from "../pages/GuestJoinPage";
import AttendancePage from "../pages/AttendancePage";
import LateRegistrationPage from "../pages/LateRegistrationPage";
import ParticipantStatusPage from "../pages/ParticipantStatusPage";
import NextMatchPage from "../pages/NextMatchPage";
import OrganizerDashboardPage from "../pages/OrganizerDashboardPage";
import ParticipantManagementPage from "../pages/ParticipantManagementPage";
import MatchQueuePage from "../pages/MatchQueuePage";
import CurrentMatchesPage from "../pages/CurrentMatchesPage";
import MatchResultInputPage from "../pages/MatchResultInputPage";
import MatchResultEditPage from "../pages/MatchResultEditPage";
import MyRecordPage from "../pages/MyRecordPage";
import SessionReportPage from "../pages/SessionReportPage";
import ParticipantSessionReportPage from "../pages/ParticipantSessionReportPage";
import DisplayBoardPage from "../pages/DisplayBoardPage";
import SettingsPage from "../pages/SettingsPage";
import NotificationsPage from "../pages/NotificationsPage";
import GalleryPage from "../pages/GalleryPage";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "login", Component: LoginPage, handle: { title: "로그인" } },
      { path: "signup", Component: SignupPage, handle: { title: "회원가입" } },
      { path: "social-signup", Component: SocialSignupPage, handle: { title: "소셜 기본 정보 입력" } },
      { path: "oauth/callback", Component: OAuthCallbackPage, handle: { title: "소셜 로그인 처리" } },
      { path: "password-reset", Component: PasswordResetPage, handle: { title: "비밀번호 재설정" } },
      { path: "password-reset/confirm", Component: PasswordResetConfirmPage, handle: { title: "새 비밀번호 설정" } },

      // Mobile-optimized pages (no sidebar)
      { path: "sessions/:sessionId/join", Component: JoinSessionPage, handle: { title: "세션 참가" } },
      { path: "sessions/:sessionId/guest-join", Component: GuestJoinPage, handle: { title: "게스트 참가" } },
      { path: "sessions/:sessionId/attendance", Component: AttendancePage, handle: { title: "출석 체크" } },
      { path: "sessions/:sessionId/late", Component: LateRegistrationPage, handle: { title: "지각 등록" } },
      { path: "sessions/:sessionId/status", Component: ParticipantStatusPage, handle: { title: "참가 상태" } },
      { path: "sessions/:sessionId/next-match", Component: NextMatchPage, handle: { title: "다음 경기" } },

      // Large display (no sidebar)
      { path: "sessions/:sessionId/display", Component: DisplayBoardPage, handle: { title: "경기 현황판" } },

      {
        Component: RequireAuth,
        children: [
          // Desktop-optimized pages (with sidebar) - nested under Layout
          { path: "groups", Component: GroupListPage, handle: { title: "내 모임" } },
          { path: "groups/new", Component: GroupNewPage, handle: { title: "모임 만들기" } },
          { path: "groups/:groupId", Component: GroupDetailPage, handle: { title: "모임 상세" } },
          { path: "groups/:groupId/members", Component: GroupMembersPage, handle: { title: "구성원 관리" } },
          { path: "groups/:groupId/settings", Component: GroupSettingsPage, handle: { title: "모임 설정" } },
          { path: "groups/:groupId/create-session", Component: CreateSessionPage, handle: { title: "운동 일정 만들기" } },
          { path: "sessions/:sessionId/dashboard", Component: OrganizerDashboardPage, handle: { title: "운영 대시보드" } },
          { path: "sessions/:sessionId/participants", Component: ParticipantManagementPage, handle: { title: "참가자 관리" } },
          { path: "sessions/:sessionId/queue", Component: MatchQueuePage, handle: { title: "매칭 대기열" } },
          { path: "sessions/:sessionId/current", Component: CurrentMatchesPage, handle: { title: "경기 현황" } },
          { path: "sessions/:sessionId/result/new", Component: MatchResultInputPage, handle: { title: "경기 결과 입력" } },
          { path: "sessions/:sessionId/result/:matchId/edit", Component: MatchResultEditPage, handle: { title: "경기 결과 수정" } },
          { path: "my-record", Component: MyRecordPage, handle: { title: "내 기록" } },
          { path: "sessions/:sessionId/report", Component: SessionReportPage, handle: { title: "세션 리포트" } },
          { path: "sessions/:sessionId/my-report", Component: ParticipantSessionReportPage, handle: { title: "내 세션 리포트" } },
          { path: "settings", Component: SettingsPage, handle: { title: "설정" } },
          { path: "notifications", Component: NotificationsPage, handle: { title: "전체 알림" } },
        ],
      },
      { path: "gallery", Component: GalleryPage, handle: { title: "셔틀플레이 페이지 갤러리" } },
      { path: "*", Component: NotFoundPage, handle: { title: "페이지를 찾을 수 없음" } },
    ],
  },
]);
